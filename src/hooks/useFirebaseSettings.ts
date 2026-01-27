// src/hooks/useFirebaseSettings.ts
import { useState, useCallback } from "react";
import { db } from "@/integrations/firebase/config";
import {
  collection,
  query,
  limit,
  getDocs,
  updateDoc,
  doc,
  where,
  Timestamp,
} from "firebase/firestore";
import { toast } from "sonner";

export const useFirebaseSettings = () => {
  const [loading, setLoading] = useState(false);

  const updateThresholds = useCallback(async (thresholds: Partial<any>) => {
    setLoading(true);
    try {
      // Get the first threshold document
      const thresholdQuery = query(collection(db, "thresholds"), limit(1));

      const snapshot = await getDocs(thresholdQuery);

      if (!snapshot.empty) {
        const docRef = doc(db, "thresholds", snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...thresholds,
          updated_at: Timestamp.now(),
        });
      }

      toast.success("Thresholds updated successfully");
    } catch (error) {
      console.error("Error updating thresholds:", error);
      toast.error("Failed to update thresholds");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSchedule = useCallback(async (schedule: Partial<any>) => {
    setLoading(true);
    try {
      // Get the first schedule document
      const scheduleQuery = query(
        collection(db, "irrigation_schedule"),
        limit(1),
      );

      const snapshot = await getDocs(scheduleQuery);

      if (!snapshot.empty) {
        const docRef = doc(db, "irrigation_schedule", snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...schedule,
          updated_at: Timestamp.now(),
        });
      }

      toast.success("Schedule updated successfully");
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeviceControl = useCallback(
    async (deviceName: string, updates: Partial<any>) => {
      setLoading(true);
      try {
        // Find device by device_name
        const deviceQuery = query(
          collection(db, "device_control"),
          where("device_name", "==", deviceName),
          limit(1),
        );

        const snapshot = await getDocs(deviceQuery);

        if (!snapshot.empty) {
          const docRef = doc(db, "device_control", snapshot.docs[0].id);
          await updateDoc(docRef, {
            ...updates,
            last_updated: Timestamp.now(),
          });

          console.log(`Device ${deviceName} updated successfully`, updates);
        }
      } catch (error) {
        console.error(`Error updating ${deviceName}:`, error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    updateThresholds,
    updateSchedule,
    updateDeviceControl,
    loading,
  };
};
