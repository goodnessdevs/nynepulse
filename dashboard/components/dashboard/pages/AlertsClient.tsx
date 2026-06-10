"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore } from "@/store/devices.store";
import { setAuthToken, api } from "@/lib/api";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AlertsClient() {
  const { token } = useAuthStore();
  const { devices, fetchDevices, selectedDevice, selectDevice } =
    useDevicesStore();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    fetchDevices();
  }, [token, fetchDevices]);

  const fetchAlerts = async (deviceId: string) => {
    try {
      const { data } = await api.get(`/alerts/${deviceId}`);
      setAlerts(data.data ?? []);
    } catch {}
  };

  useEffect(() => {
    if (!selectedDevice) return;
    fetchAlerts(selectedDevice.id);
  }, [selectedDevice?.id, selectedDevice]);

  return (
    <>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-4">
        <div>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Alerts
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Threshold breach notifications
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedDevice?.id ?? ""}
            onValueChange={(value) => {
              const d = devices.find((d) => d.id === value);
              if (d) selectDevice(d);
            }}
          >
            <SelectTrigger className="h-9 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm outline-none px-3 py-1.5 flex-1 sm:w-[200px]">
              <SelectValue placeholder="Select device..." />
            </SelectTrigger>
            <SelectContent>
              {devices.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {!selectedDevice && (
          <div className="flex-1 flex items-center justify-center h-full text-sm text-zinc-400">
            Select a device to view alerts
          </div>
        )}

        {selectedDevice && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
            <AlertTriangle size={32} className="text-zinc-300" />
            <p className="text-sm">No alerts for this device</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800 rounded-2xl p-4 flex items-start gap-4 border-l-4 border-red-400"
            >
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={15} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  {alert.message}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {format(new Date(alert.sentAt), "MMM d, yyyy HH:mm:ss")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>

}
