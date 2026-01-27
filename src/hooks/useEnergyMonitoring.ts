// src/hooks/useEnergyMonitoring.ts
import { useEffect, useState } from "react";
import { db } from "@/integrations/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import type { EnergyReading } from "@/integrations/firebase/types";

interface EnergyData {
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  powerFactor: number;
}

interface DailyEnergyConsumption {
  device_name: string;
  total_energy: number;
  avg_power: number;
  peak_power: number;
  runtime_hours: number;
}

export const useEnergyMonitoring = () => {
  const [latestReading, setLatestReading] = useState<EnergyReading | null>(
    null,
  );
  const [dailyConsumption, setDailyConsumption] = useState<
    DailyEnergyConsumption[]
  >([]);
  const [recentReadings, setRecentReadings] = useState<EnergyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // Subscribe to latest reading
    const latestQuery = query(
      collection(db, "energy_readings"),
      orderBy("created_at", "desc"),
      limit(1),
    );

    const unsubLatest = onSnapshot(latestQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const reading = { id: doc.id, ...doc.data() } as EnergyReading;
        setLatestReading(reading);

        // Add to recent readings
        setRecentReadings((prev) => {
          const updated = [...prev, reading].slice(-100);
          return updated;
        });
      }
    });
    unsubscribes.push(unsubLatest);

    // Fetch recent readings for charts (last 24 hours)
    const fetchRecentReadings = async () => {
      try {
        setLoading(true);
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const recentQuery = query(
          collection(db, "energy_readings"),
          where("created_at", ">=", Timestamp.fromDate(twentyFourHoursAgo)),
          orderBy("created_at", "asc"),
        );

        const snapshot = await getDocs(recentQuery);
        const readings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as EnergyReading[];

        setRecentReadings(readings);

        // Calculate daily consumption from readings
        const deviceConsumption: { [key: string]: DailyEnergyConsumption } = {};

        readings.forEach((reading) => {
          const device = reading.device_name;
          if (!deviceConsumption[device]) {
            deviceConsumption[device] = {
              device_name: device,
              total_energy: 0,
              avg_power: 0,
              peak_power: 0,
              runtime_hours: 0,
            };
          }

          const power = Number(reading.power) || 0;
          const energy = Number(reading.energy) || 0;

          deviceConsumption[device].total_energy += energy;
          deviceConsumption[device].peak_power = Math.max(
            deviceConsumption[device].peak_power,
            power,
          );
        });

        // Calculate averages
        Object.keys(deviceConsumption).forEach((device) => {
          const deviceReadings = readings.filter(
            (r) => r.device_name === device,
          );
          const totalPower = deviceReadings.reduce(
            (sum, r) => sum + (Number(r.power) || 0),
            0,
          );
          deviceConsumption[device].avg_power =
            totalPower / deviceReadings.length;
          deviceConsumption[device].runtime_hours =
            deviceReadings.length * (5 / 60); // Assuming 5 min intervals
        });

        setDailyConsumption(Object.values(deviceConsumption));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching energy data:", err);
        setError("Failed to fetch energy data");
        setLoading(false);
      }
    };

    fetchRecentReadings();

    return () => {
      console.log("Cleaning up energy monitoring subscription");
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const currentEnergyData: EnergyData = {
    voltage: latestReading?.voltage ? Number(latestReading.voltage) : 0,
    current: latestReading?.current ? Number(latestReading.current) : 0,
    power: latestReading?.power ? Number(latestReading.power) : 0,
    energy: latestReading?.energy ? Number(latestReading.energy) : 0,
    frequency: latestReading?.frequency ? Number(latestReading.frequency) : 0,
    powerFactor: latestReading?.power_factor
      ? Number(latestReading.power_factor)
      : 0,
  };

  const totalDailyEnergy = dailyConsumption.reduce(
    (sum, device) => sum + Number(device.total_energy || 0),
    0,
  );
  const averagePower =
    dailyConsumption.reduce(
      (sum, device) => sum + Number(device.avg_power || 0),
      0,
    ) / Math.max(dailyConsumption.length, 1);
  const peakPower = Math.max(
    ...dailyConsumption.map((device) => Number(device.peak_power || 0)),
    0,
  );

  return {
    latestReading,
    recentReadings,
    dailyConsumption,
    currentEnergyData,
    totalDailyEnergy,
    averagePower,
    peakPower,
    loading,
    error,
  };
};
