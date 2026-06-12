// ============================================================
// TELEMETRY PAGE — src/app/dashboard/telemetry/page.tsx
// ============================================================
"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore } from "@/store/devices.store";
import { setAuthToken, api } from "@/lib/api";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function TelemetryPage() {
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
    if (selectedDevice) fetchHistory(selectedDevice.id);
  }, [selectedDevice?.id, selectedDevice]);

  const metricKeys =
    history.length > 0
      ? Object.keys(history[0]).filter((k) => k !== "time")
      : [];
  const colors = ["#3D6B55", "#5CAF85", "#f59e0b", "#ef4444", "#06b6d4"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-xl px-3 py-2">
        <p className="text-xs text-[#2A3D27] font-mono mb-1">{label}</p>
        {payload.map((p: any) => (
          <p
            key={p.name}
            className="text-xs font-mono"
            style={{ color: p.color }}
          >
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#0C0F0A] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1A2E1A]">
          <div>
            <h1 className="text-base font-medium text-[#E8F0E4]">Telemetry</h1>
            <p className="text-xs text-[#4A5E47] mt-0.5">
              Historical sensor data per device
            </p>
          </div>
          <Select
            value={selectedDevice?.id ?? ""}
            onValueChange={(v) => {
              const d = devices.find((d) => d.id === v);
              if (d) selectDevice(d);
            }}
          >
            <SelectTrigger className="w-48 text-xs bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4]">
              <SelectValue placeholder="Select device..." />
            </SelectTrigger>
            <SelectContent className="bg-[#0A130A] border-[#1E3B2A]">
              {devices.map((d) => (
                <SelectItem
                  key={d.id}
                  value={d.id}
                  className="text-xs text-[#E8F0E4] font-mono"
                >
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 flex flex-col gap-4">
          {!selectedDevice && (
            <div className="flex-1 flex items-center justify-center text-xs text-[#2A3D27] font-mono">
              Select a device to view telemetry history
            </div>
          )}
          {selectedDevice && loading && (
            <div className="flex-1 flex items-center justify-center text-xs text-[#2A3D27] font-mono">
              Loading...
            </div>
          )}
          {selectedDevice && !loading && history.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-xs text-[#2A3D27] font-mono">
              No telemetry data yet for this device
            </div>
          )}

          {metricKeys.map((key, i) => (
            <div
              key={key}
              className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-5"
            >
              <p className="text-xs text-[#4A5E47] font-mono mb-4 capitalize">
                {key}
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162214" />
                  <XAxis
                    dataKey="time"
                    tick={{
                      fontSize: 10,
                      fill: "#2A3D27",
                      fontFamily: "monospace",
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "#2A3D27",
                      fontFamily: "monospace",
                    }}
                    width={32}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={key}
                    stroke={colors[i % colors.length]}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
