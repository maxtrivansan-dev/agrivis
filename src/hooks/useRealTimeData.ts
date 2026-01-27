import { useEffect, useState } from "react";
import { db, auth } from "@/integrations/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

export const useRealTimeData = () => {
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [devices, setDevices] = useState<DeviceControl[]>([]);
  const [thresholds, setThresholds] = useState<Threshold | null>(null);
  const [schedule, setSchedule] = useState<IrrigationSchedule | null>(null);
  const [energyData, setEnergyData] = useState<EnergyReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Cek status autentikasi dulu
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);

      if (!user) {
        console.warn("User belum login, silakan login terlebih dahulu");
        setLoading(false);
        return;
      }

      console.log("User authenticated:", user.uid);
      setLoading(true);
      const unsubscribes: (() => void)[] = [];

      // Subscribe to sensor readings
      const sensorQuery = query(
        collection(db, "sensor_readings"),
        orderBy("created_at", "desc"),
        limit(1),
      );

      const unsubSensor = onSnapshot(
        sensorQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setSensorData({ id: doc.id, ...doc.data() } as SensorReading);
            setLastUpdate(new Date());
            console.log("✅ Latest sensor data:", doc.data());
          }
        },
        (error) => {
          console.error("❌ Sensor error:", error.code, error.message);
        },
      );
      unsubscribes.push(unsubSensor);

      // Subscribe to energy readings
      const energyQuery = query(
        collection(db, "energy_readings"),
        orderBy("created_at", "desc"),
        limit(1),
      );

      const unsubEnergy = onSnapshot(
        energyQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setEnergyData({ id: doc.id, ...doc.data() } as EnergyReading);
            setLastUpdate(new Date());
            console.log("✅ Latest energy data:", doc.data());
          }
        },
        (error) => {
          console.error("❌ Energy error:", error.code, error.message);
        },
      );
      unsubscribes.push(unsubEnergy);

      // Subscribe to device controls
      const deviceQuery = query(
        collection(db, "device_control"),
        orderBy("last_updated", "desc"),
      );

      const unsubDevices = onSnapshot(
        deviceQuery,
        (snapshot) => {
          const deviceData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as DeviceControl[];
          setDevices(deviceData);
          setLastUpdate(new Date());
          console.log("✅ Device data:", deviceData);
        },
        (error) => {
          console.error("❌ Device error:", error.code, error.message);
        },
      );
      unsubscribes.push(unsubDevices);

      // Subscribe to thresholds
      const thresholdQuery = query(
        collection(db, "thresholds"),
        orderBy("updated_at", "desc"),
        limit(1),
      );

      const unsubThreshold = onSnapshot(
        thresholdQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setThresholds({ id: doc.id, ...doc.data() } as Threshold);
            setLastUpdate(new Date());
            console.log("✅ Threshold data:", doc.data());
          }
        },
        (error) => {
          console.error("❌ Threshold error:", error.code, error.message);
        },
      );
      unsubscribes.push(unsubThreshold);

      // Subscribe to irrigation schedule
      const scheduleQuery = query(
        collection(db, "irrigation_schedule"),
        orderBy("updated_at", "desc"),
        limit(1),
      );

      const unsubSchedule = onSnapshot(
        scheduleQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setSchedule({ id: doc.id, ...doc.data() } as IrrigationSchedule);
            setLastUpdate(new Date());
            console.log("✅ Schedule data:", doc.data());
          }
          setLoading(false);
        },
        (error) => {
          console.error("❌ Schedule error:", error.code, error.message);
          setLoading(false);
        },
      );
      unsubscribes.push(unsubSchedule);

      // Cleanup subscriptions
      return () => {
        console.log("Cleaning up realtime subscriptions");
        unsubscribes.forEach((unsub) => unsub());
      };
    });

    return () => unsubAuth();
  }, []);

  return {
    sensorData,
    devices,
    thresholds,
    schedule,
    energyData,
    loading,
    lastUpdate,
  };
};
