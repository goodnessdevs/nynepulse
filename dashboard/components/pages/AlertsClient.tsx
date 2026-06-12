// ============================================================
// ALERTS PAGE — src/app/dashboard/alerts/page.tsx
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
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  const { token } = useAuthStore();
  const { devices, fetchDevices, selectedDevice, selectDevice } =
    useDevicesStore();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    fetchDevices();
  }, [token, fetchDevices]);
  useEffect(() => {
    if (!selectedDevice) return;
    const get = async () => {
      try {
        const { data } = await api.get(`/alerts/${selectedDevice.id}`);
        setAlerts(data.data ?? []);
      } catch {}
    };
    get();
  }, [selectedDevice?.id, selectedDevice]);

  return (
    <div className="flex h-screen bg-[#0C0F0A] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1A2E1A]">
          <div>
            <h1 className="text-base font-medium text-[#E8F0E4]">Alerts</h1>
            <p className="text-xs text-[#4A5E47] mt-0.5">
              Threshold breach notifications
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

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {!selectedDevice && (
            <div className="h-full flex items-center justify-center text-xs text-[#2A3D27] font-mono">
              Select a device to view alerts
            </div>
          )}
          {selectedDevice && alerts.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0A130A] border border-[#1E3B2A] flex items-center justify-center">
                <AlertTriangle size={18} className="text-[#2A3D27]" />
              </div>
              <p className="text-xs text-[#2A3D27] font-mono">
                No alerts for this device
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-4 flex items-start gap-4 border-l-4 border-l-red-500/50"
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={14} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#E8F0E4]">{alert.message}</p>
                  <p className="text-xs text-[#2A3D27] font-mono mt-1">
                    {format(new Date(alert.sentAt), "MMM d, yyyy HH:mm:ss")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
