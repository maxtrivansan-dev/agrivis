// src/hooks/useActivityHistory.ts
import { useState, useEffect } from "react";
import { db } from "@/integrations/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import type {
  IrrigationLog,
  EnergyLog,
  SensorReading,
} from "@/integrations/firebase/types";

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: "irrigation" | "manual" | "schedule" | "alert" | "energy";
  action: string;
  details: string;
  duration: string;
  user: string;
  status: "completed" | "acknowledged" | "failed" | "active";
}

export const useActivityHistory = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processIrrigationLogs = (logs: IrrigationLog[]): ActivityItem[] => {
    return logs.map((log) => ({
      id: log.id,
      timestamp: log.created_at
        ? log.created_at.toDate().toISOString()
        : new Date().toISOString(),
      type: "irrigation" as const,
      action: "Auto watering completed",
      details: `${log.trigger_reason || "Scheduled irrigation"} - Tank: ${log.tank_type || "Water"} - Moisture: ${log.soil_moisture_before}% → ${log.soil_moisture_after}%`,
      duration: `${Math.round((log.duration_seconds || 0) / 60)} min`,
      user: "System",
      status: "completed" as const,
    }));
  };

  const processEnergyLogs = (logs: EnergyLog[]): ActivityItem[] => {
    return logs.map((log) => ({
      id: log.id,
      timestamp: log.created_at
        ? log.created_at.toDate().toISOString()
        : new Date().toISOString(),
      type: "energy" as const,
      action: `${log.device_name} operation`,
      details: `Power: ${log.estimated_power_watts}W - Energy: ${log.estimated_energy_kwh}kWh`,
      duration: `${Math.round((log.duration_seconds || 0) / 60)} min`,
      user: "System",
      status: "completed" as const,
    }));
  };

  const processSensorReadings = (readings: SensorReading[]): ActivityItem[] => {
    const alerts: ActivityItem[] = [];

    readings.forEach((reading) => {
      const timestamp = reading.created_at
        ? reading.created_at.toDate().toISOString()
        : new Date().toISOString();

      if ((reading.water_tank_level || 0) < 20) {
        alerts.push({
          id: `${reading.id}-water`,
          timestamp,
          type: "alert",
          action: "Low water level alert",
          details: `Water tank level: ${reading.water_tank_level}%`,
          duration: "-",
          user: "System",
          status: "acknowledged",
        });
      }

      if ((reading.vitamin_tank_level || 0) < 15) {
        alerts.push({
          id: `${reading.id}-vitamin`,
          timestamp,
          type: "alert",
          action: "Low vitamin level alert",
          details: `Vitamin tank level: ${reading.vitamin_tank_level}%`,
          duration: "-",
          user: "System",
          status: "acknowledged",
        });
      }

      if ((reading.temperature || 0) > 30) {
        alerts.push({
          id: `${reading.id}-temp`,
          timestamp,
          type: "alert",
          action: "High temperature alert",
          details: `Temperature: ${reading.temperature}°C`,
          duration: "-",
          user: "System",
          status: "acknowledged",
        });
      }
    });

    return alerts;
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysTimestamp = Timestamp.fromDate(thirtyDaysAgo);

    // Subscribe to irrigation logs
    const irrigationQuery = query(
      collection(db, "irrigation_logs"),
      where("created_at", ">=", thirtyDaysTimestamp),
      orderBy("created_at", "desc"),
      limit(50),
    );

    const unsubIrrigation = onSnapshot(irrigationQuery, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IrrigationLog[];

      updateActivities("irrigation", processIrrigationLogs(logs));
    });
    unsubscribes.push(unsubIrrigation);

    // Subscribe to energy logs
    const energyQuery = query(
      collection(db, "energy_logs"),
      where("created_at", ">=", thirtyDaysTimestamp),
      orderBy("created_at", "desc"),
      limit(50),
    );

    const unsubEnergy = onSnapshot(energyQuery, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EnergyLog[];

      updateActivities("energy", processEnergyLogs(logs));
    });
    unsubscribes.push(unsubEnergy);

    // Subscribe to sensor readings for alerts
    const sensorQuery = query(
      collection(db, "sensor_readings"),
      where("created_at", ">=", thirtyDaysTimestamp),
      orderBy("created_at", "desc"),
      limit(100),
    );

    const unsubSensor = onSnapshot(sensorQuery, (snapshot) => {
      const readings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SensorReading[];

      updateActivities("alerts", processSensorReadings(readings));
      setLoading(false);
    });
    unsubscribes.push(unsubSensor);

    let allActivitiesCache: { [key: string]: ActivityItem[] } = {
      irrigation: [],
      energy: [],
      alerts: [],
    };

    function updateActivities(type: string, newActivities: ActivityItem[]) {
      allActivitiesCache[type] = newActivities;

      const combined = [
        ...allActivitiesCache.irrigation,
        ...allActivitiesCache.energy,
        ...allActivitiesCache.alerts,
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setActivities(combined);
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const exportData = () => {
    const csvContent = [
      [
        "Timestamp",
        "Type",
        "Action",
        "Details",
        "Duration",
        "User",
        "Status",
      ].join(","),
      ...activities.map((item) =>
        [
          item.timestamp,
          item.type,
          item.action,
          item.details.replace(/,/g, ";"),
          item.duration,
          item.user,
          item.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `irrigation_history_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return {
    activities,
    loading,
    error,
    refetch: () => {}, // Firebase onSnapshot handles real-time updates
    exportData,
  };
};
