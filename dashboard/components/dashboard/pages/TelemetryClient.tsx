"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore } from "@/store/devices.store";
import { setAuthToken, api } from "@/lib/api";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TelemetryClient() {
  const { token } = useAuthStore();
  const { devices, fetchDevices, selectedDevice, selectDevice } =
    useDevicesStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    fetchDevices();
  }, [token, fetchDevices]);

  const fetchHistory = async (deviceId: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/telemetry/${deviceId}/history?limit=30`);
      const records = (data.data ?? []).reverse();
      setHistory(
        records.map((r: any) => ({
          time: format(new Date(r.createdAt), "HH:mm:ss"),
          ...r.payload,
        })),
      );
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedDevice) return;
    fetchHistory(selectedDevice.id);
  }, [selectedDevice?.id, selectedDevice]);

  const metricKeys =
    history.length > 0
      ? Object.keys(history[0]).filter((k) => k !== "time")
      : [];

  const colors = ["#3D6B55", "#6366f1", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-4">
        <div>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Telemetry
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Historical sensor data per device
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
            <SelectTrigger className="flex-1 sm:w-48 text-sm bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
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

      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-4">
        {!selectedDevice && (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">
            Select a device to view telemetry history
          </div>
        )}

        {selectedDevice && loading && (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">
            Loading...
          </div>
        )}

        {selectedDevice && !loading && history.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">
            No telemetry data yet for this device
          </div>
        )}

        {metricKeys.map((key, i) => (
          <div
            key={key}
            className="bg-white dark:bg-zinc-800 rounded-2xl p-5"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4 capitalize">
              {key}
            </p>
            <div className="h-45 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#aaa" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#aaa" }} width={35} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "0.5px solid #e0ddd8",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={key}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
