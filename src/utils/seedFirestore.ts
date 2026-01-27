import { db } from "@/integrations/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const seedFirestoreData = async () => {
  try {
    console.log("🌱 Starting to seed Firestore data...");

    // 1. Add sensor readings
    const sensorRef = await addDoc(collection(db, "sensor_readings"), {
      temperature: 28.5,
      humidity: 65.2,
      soil_moisture: 45.8,
      light_intensity: 850,
      ph: 6.5,
      created_at: serverTimestamp(),
      sensor_id: "sensor_001",
    });
    console.log("✅ Sensor reading added:", sensorRef.id);

    // 2. Add energy readings
    const energyRef = await addDoc(collection(db, "energy_readings"), {
      voltage: 220.5,
      current: 5.2,
      power: 1146.6,
      power_factor: 0.95,
      frequency: 50.0,
      energy_consumed: 2.5,
      created_at: serverTimestamp(),
      device_id: "meter_001",
    });
    console.log("✅ Energy reading added:", energyRef.id);

    // 3. Add device controls
    const pumpRef = await addDoc(collection(db, "device_control"), {
      device_name: "Water Pump",
      device_type: "pump",
      status: "off",
      mode: "manual",
      last_updated: serverTimestamp(),
    });
    console.log("✅ Water Pump added:", pumpRef.id);

    const valveRef = await addDoc(collection(db, "device_control"), {
      device_name: "Valve 1",
      device_type: "valve",
      status: "off",
      mode: "auto",
      last_updated: serverTimestamp(),
    });
    console.log("✅ Valve 1 added:", valveRef.id);

    const fanRef = await addDoc(collection(db, "device_control"), {
      device_name: "Cooling Fan",
      device_type: "fan",
      status: "off",
      mode: "auto",
      last_updated: serverTimestamp(),
    });
    console.log("✅ Cooling Fan added:", fanRef.id);

    // 4. Add thresholds
    const thresholdRef = await addDoc(collection(db, "thresholds"), {
      temperature_min: 20,
      temperature_max: 35,
      humidity_min: 40,
      humidity_max: 80,
      soil_moisture_min: 30,
      soil_moisture_max: 70,
      updated_at: serverTimestamp(),
    });
    console.log("✅ Thresholds added:", thresholdRef.id);

    // 5. Add irrigation schedule
    const scheduleRef = await addDoc(collection(db, "irrigation_schedule"), {
      name: "Morning Schedule",
      start_time: "06:00",
      end_time: "06:30",
      days: ["monday", "wednesday", "friday"],
      enabled: true,
      updated_at: serverTimestamp(),
    });
    console.log("✅ Irrigation schedule added:", scheduleRef.id);

    console.log("🎉 All data seeded successfully!");
    return { success: true, message: "Data berhasil ditambahkan!" };
  } catch (error: any) {
    console.error("❌ Error seeding data:", error);
    return { success: false, message: error.message };
  }
};
