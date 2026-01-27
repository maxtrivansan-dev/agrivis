// src/hooks/useHistoricalData.ts
import { useEffect, useState } from "react";
import { db } from "@/integrations/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import type {
  SensorReading,
  EnergyReading,
} from "@/integrations/firebase/types";

interface HistoricalDataPoint {
  date: string;
  time: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
  waterUsage: number;
  energyUsage: number;
  waterTankLevel: number;
  vitaminTankLevel: number;
  flowRate: number;
}

export const useHistoricalData = () => {
  const [dailyData, setDailyData] = useState<HistoricalDataPoint[]>([]);
  const [weeklyData, setWeeklyData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processData = (
    sensorData: SensorReading[],
    energyData: EnergyReading[],
  ): HistoricalDataPoint[] => {
    const energyByDate: Record<string, EnergyReading[]> = {};
    energyData.forEach((reading) => {
      const date = reading.created_at.toDate().toISOString().split("T")[0];
      if (!energyByDate[date]) energyByDate[date] = [];
      energyByDate[date].push(reading);
    });

    return sensorData.map((reading) => {
      const date = reading.created_at
        ? reading.created_at.toDate()
        : new Date();
      const dateStr = date.toISOString().split("T")[0];
      const dayEnergyData = energyByDate[dateStr] || [];

      const avgEnergyUsage =
        dayEnergyData.length > 0
          ? dayEnergyData.reduce((sum, e) => sum + (Number(e.power) || 0), 0) /
            dayEnergyData.length /
            1000
          : 0;

      return {
        date: dateStr,
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: Number(reading.temperature) || 0,
        humidity: Number(reading.humidity) || 0,
        soilMoisture: Number(reading.soil_moisture) || 0,
        lightLevel: Number(reading.light_level) || 0,
        waterUsage: Number(reading.flow_rate) || 0,
        energyUsage: avgEnergyUsage,
        waterTankLevel: Number(reading.water_tank_level) || 0,
        vitaminTankLevel: Number(reading.vitamin_tank_level) || 0,
        flowRate: Number(reading.flow_rate) || 0,
      };
    });
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysTimestamp = Timestamp.fromDate(thirtyDaysAgo);

    let sensorCache: SensorReading[] = [];
    let energyCache: EnergyReading[] = [];

    // Subscribe to sensor readings
    const sensorQuery = query(
      collection(db, "sensor_readings"),
      where("created_at", ">=", thirtyDaysTimestamp),
      orderBy("created_at", "asc"),
    );

    const unsubSensor = onSnapshot(sensorQuery, (snapshot) => {
      sensorCache = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SensorReading[];

      updateProcessedData();
    });
    unsubscribes.push(unsubSensor);

    // Subscribe to energy readings
    const energyQuery = query(
      collection(db, "energy_readings"),
      where("created_at", ">=", thirtyDaysTimestamp),
      orderBy("created_at", "asc"),
    );

    const unsubEnergy = onSnapshot(energyQuery, (snapshot) => {
      energyCache = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EnergyReading[];

      updateProcessedData();
      setLoading(false);
    });
    unsubscribes.push(unsubEnergy);

    function updateProcessedData() {
      const processedData = processData(sensorCache, energyCache);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const daily = processedData.filter(
        (d) => new Date(d.date) >= sevenDaysAgo,
      );
      const weekly = processedData;

      setDailyData(daily);
      setWeeklyData(weekly);
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const calculateStats = (data: HistoricalDataPoint[]) => {
    if (data.length === 0)
      return {
        avgTemperature: 0,
        avgHumidity: 0,
        avgSoilMoisture: 0,
        avgLightLevel: 0,
        totalWaterUsage: 0,
      };

    const totals = data.reduce(
      (acc, curr) => ({
        temperature: acc.temperature + curr.temperature,
        humidity: acc.humidity + curr.humidity,
        soilMoisture: acc.soilMoisture + curr.soilMoisture,
        lightLevel: acc.lightLevel + curr.lightLevel,
        waterUsage: acc.waterUsage + curr.waterUsage,
      }),
      {
        temperature: 0,
        humidity: 0,
        soilMoisture: 0,
        lightLevel: 0,
        waterUsage: 0,
      },
    );

    return {
      avgTemperature: totals.temperature / data.length,
      avgHumidity: totals.humidity / data.length,
      avgSoilMoisture: totals.soilMoisture / data.length,
      avgLightLevel: totals.lightLevel / data.length,
      totalWaterUsage: totals.waterUsage,
    };
  };

  const weeklyStats = calculateStats(weeklyData);
  const dailyStats = calculateStats(dailyData);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    dailyData,
    weeklyData,
    loading,
    error,
    stats: {
      avgTemperature: weeklyStats.avgTemperature,
      avgHumidity: weeklyStats.avgHumidity,
      avgSoilMoisture: weeklyStats.avgSoilMoisture,
      avgLightLevel: weeklyStats.avgLightLevel,
      totalWaterUsage: weeklyStats.totalWaterUsage,
      changes: {
        temperature: calculateChange(
          dailyStats.avgTemperature,
          weeklyStats.avgTemperature,
        ),
        humidity: calculateChange(
          dailyStats.avgHumidity,
          weeklyStats.avgHumidity,
        ),
        soilMoisture: calculateChange(
          dailyStats.avgSoilMoisture,
          weeklyStats.avgSoilMoisture,
        ),
        lightLevel: calculateChange(
          dailyStats.avgLightLevel,
          weeklyStats.avgLightLevel,
        ),
        waterUsage: calculateChange(
          dailyStats.totalWaterUsage,
          weeklyStats.totalWaterUsage,
        ),
      },
    },
    refetch: () => {}, // Firebase onSnapshot handles real-time updates
  };
};
