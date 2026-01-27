import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Thermometer,
  Droplets,
  Clock,
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Calendar,
  Gauge,
  Brain,
} from "lucide-react";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useFirebaseSettings } from "@/hooks/useFirebaseSettings";

export default function Settings() {
  const { thresholds, schedule } = useRealTimeData();
  const { updateThresholds, updateSchedule, loading } = useFirebaseSettings();
  const [localThresholds, setLocalThresholds] = useState({
    max_temperature: 30,
    min_soil_moisture: 25,
    low_water_level: 20,
    low_vitamin_level: 15,
  });

  const [localSchedule, setLocalSchedule] = useState({
    enabled: true,
    morning_time: "08:00",
    evening_time: "18:00",
    weekend_mode: true,
    tank_rotation: true,
    irrigation_mode: "threshold" as "threshold" | "fuzzy_logic",
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when data comes from Supabase
  useEffect(() => {
    if (thresholds) {
      setLocalThresholds({
        max_temperature: Number(thresholds.max_temperature) || 30,
        min_soil_moisture: Number(thresholds.min_soil_moisture) || 25,
        low_water_level: Number(thresholds.low_water_level) || 20,
        low_vitamin_level: Number(thresholds.low_vitamin_level) || 15,
      });
    }
  }, [thresholds]);

  useEffect(() => {
    if (schedule) {
      setLocalSchedule({
        enabled: schedule.enabled ?? true,
        morning_time: schedule.morning_time || "08:00",
        evening_time: schedule.evening_time || "18:00",
        weekend_mode: schedule.weekend_mode ?? true,
        tank_rotation: schedule.tank_rotation ?? true,
        irrigation_mode:
          (schedule.irrigation_mode as "threshold" | "fuzzy_logic") ||
          "threshold",
      });
    }
  }, [schedule]);

  const updateThresholdSetting = (key: string, value: any) => {
    setLocalThresholds((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateScheduleSetting = (key: string, value: any) => {
    setLocalSchedule((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateThresholds(localThresholds);
    await updateSchedule(localSchedule);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (thresholds) {
      setLocalThresholds({
        max_temperature: Number(thresholds.max_temperature) || 30,
        min_soil_moisture: Number(thresholds.min_soil_moisture) || 25,
        low_water_level: Number(thresholds.low_water_level) || 20,
        low_vitamin_level: Number(thresholds.low_vitamin_level) || 15,
      });
    }
    if (schedule) {
      setLocalSchedule({
        enabled: schedule.enabled ?? true,
        morning_time: schedule.morning_time || "08:00",
        evening_time: schedule.evening_time || "18:00",
        weekend_mode: schedule.weekend_mode ?? true,
        tank_rotation: schedule.tank_rotation ?? true,
        irrigation_mode:
          (schedule.irrigation_mode as "threshold" | "fuzzy_logic") ||
          "threshold",
      });
    }
    setHasChanges(false);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure thresholds, schedules, and system preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && <Badge variant="secondary">Unsaved Changes</Badge>}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Environmental Thresholds
              </CardTitle>
              <CardDescription>
                Set trigger values for automatic system responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxTemp" className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Maximum Temperature (°C)
                  </Label>
                  <Input
                    id="maxTemp"
                    type="number"
                    value={localThresholds.max_temperature}
                    onChange={(e) =>
                      updateThresholdSetting(
                        "max_temperature",
                        Number(e.target.value),
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Fan will activate when temperature exceeds this value
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minSoil" className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    Minimum Soil Moisture (%)
                  </Label>
                  <Input
                    id="minSoil"
                    type="number"
                    value={localThresholds.min_soil_moisture}
                    onChange={(e) =>
                      updateThresholdSetting(
                        "min_soil_moisture",
                        Number(e.target.value),
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Irrigation will start when soil moisture falls below this
                    level
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowWater">Low Water Level Alert (%)</Label>
                  <Input
                    id="lowWater"
                    type="number"
                    value={localThresholds.low_water_level}
                    onChange={(e) =>
                      updateThresholdSetting(
                        "low_water_level",
                        Number(e.target.value),
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert when water tank level drops below this percentage
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowVitamin">
                    Low Vitamin Level Alert (%)
                  </Label>
                  <Input
                    id="lowVitamin"
                    type="number"
                    value={localThresholds.low_vitamin_level}
                    onChange={(e) =>
                      updateThresholdSetting(
                        "low_vitamin_level",
                        Number(e.target.value),
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert when vitamin tank level drops below this percentage
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Irrigation Schedule
              </CardTitle>
              <CardDescription>
                Configure automatic watering times and patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Scheduled Irrigation */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Scheduled Irrigation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically water plants at set times
                  </p>
                </div>
                <Switch
                  checked={localSchedule.enabled}
                  onCheckedChange={(checked) =>
                    updateScheduleSetting("enabled", checked)
                  }
                />
              </div>

              <Separator />

              {/* Irrigation Decision Mode */}
              <div className="space-y-3">
                <Label
                  htmlFor="irrigationMode"
                  className="flex items-center gap-2 text-base font-semibold"
                >
                  <Brain className="h-5 w-5" />
                  Irrigation Decision Mode
                </Label>
                <Select
                  value={localSchedule.irrigation_mode}
                  onValueChange={(value: "threshold" | "fuzzy_logic") => {
                    console.log("Changing irrigation mode to:", value);
                    updateScheduleSetting("irrigation_mode", value);
                  }}
                >
                  <SelectTrigger id="irrigationMode" className="w-full">
                    <SelectValue placeholder="Select irrigation mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threshold">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Threshold-Based</div>
                          <div className="text-xs text-muted-foreground">
                            Simple rule-based control
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="fuzzy_logic">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Fuzzy Logic</div>
                          <div className="text-xs text-muted-foreground">
                            Intelligent adaptive control
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Mode Description Card */}
                <div
                  className={`p-4 rounded-lg border ${
                    localSchedule.irrigation_mode === "threshold"
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                      : "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {localSchedule.irrigation_mode === "threshold" ? (
                      <Gauge className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Brain className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {localSchedule.irrigation_mode === "threshold"
                          ? "Threshold-Based Control"
                          : "Fuzzy Logic Control"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {localSchedule.irrigation_mode === "threshold"
                          ? "Irrigation triggers when soil moisture falls below the minimum threshold. Simple and predictable behavior based on fixed values."
                          : "Uses fuzzy logic to determine optimal watering by analyzing multiple environmental factors (soil moisture, temperature, humidity). Provides more intelligent and adaptive irrigation decisions."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Watering Times */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="morningTime"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Morning Watering Time
                  </Label>
                  <Input
                    id="morningTime"
                    type="time"
                    value={localSchedule.morning_time}
                    onChange={(e) =>
                      updateScheduleSetting("morning_time", e.target.value)
                    }
                    disabled={!localSchedule.enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="eveningTime"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Evening Watering Time
                  </Label>
                  <Input
                    id="eveningTime"
                    type="time"
                    value={localSchedule.evening_time}
                    onChange={(e) =>
                      updateScheduleSetting("evening_time", e.target.value)
                    }
                    disabled={!localSchedule.enabled}
                  />
                </div>
              </div>

              {/* Tank Rotation */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tank Rotation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically alternate between water and vitamin tanks
                    (even/odd days)
                  </p>
                </div>
                <Switch
                  checked={localSchedule.tank_rotation}
                  onCheckedChange={(checked) =>
                    updateScheduleSetting("tank_rotation", checked)
                  }
                />
              </div>

              {/* Weekend Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Weekend Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Continue scheduled watering on weekends
                  </p>
                </div>
                <Switch
                  checked={localSchedule.weekend_mode}
                  onCheckedChange={(checked) =>
                    updateScheduleSetting("weekend_mode", checked)
                  }
                  disabled={!localSchedule.enabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Automation Settings
              </CardTitle>
              <CardDescription>
                Configure automatic system behaviors and safety features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-8 text-muted-foreground">
                Additional automation settings will be available in future
                updates
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
