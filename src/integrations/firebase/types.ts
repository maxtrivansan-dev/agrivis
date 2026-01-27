// src/integrations/firebase/types.ts
import { Timestamp } from "firebase/firestore";

export interface DeviceControl {
  id: string;
  device_name: string;
  auto_mode: boolean | null;
  is_active: boolean | null;
  last_updated: Timestamp | null;
}

export interface EnergyLog {
  id: string;
  device_name: string;
  created_at: Timestamp | null;
  duration_seconds: number | null;
  estimated_energy_kwh: number | null;
  estimated_power_watts: number | null;
}

export interface EnergyReading {
  id: string;
  device_name: string;
  created_at: Timestamp;
  current: number | null;
  energy: number | null;
  frequency: number | null;
  power: number | null;
  power_factor: number | null;
  voltage: number | null;
}

export interface IrrigationLog {
  id: string;
  created_at: Timestamp | null;
  duration_seconds: number | null;
  soil_moisture_after: number | null;
  soil_moisture_before: number | null;
  tank_type: string | null;
  trigger_reason: string | null;
}

export interface IrrigationSchedule {
  id: string;
  enabled: boolean | null;
  evening_time: string | null;
  morning_time: string | null;
  tank_rotation: boolean | null;
  updated_at: Timestamp | null;
  weekend_mode: boolean | null;
  irrigation_mode: "threshold" | "fuzzy_logic";
}

export interface SensorReading {
  id: string;
  created_at: Timestamp | null;
  flow_rate: number | null;
  humidity: number | null;
  light_level: number | null;
  soil_moisture: number | null;
  temperature: number | null;
  total_flow_volume: number | null;
  vitamin_tank_level: number | null;
  vitamin_temp: number | null;
  water_tank_level: number | null;
  water_temp: number | null;
}

export interface Threshold {
  id: string;
  low_vitamin_level: number | null;
  low_water_level: number | null;
  max_temperature: number | null;
  min_light_level: number | null;
  min_soil_moisture: number | null;
  min_flow_rate: number | null;
  min_total_flow_volume: number | null;
  updated_at: Timestamp | null;
}
