"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore, Device } from "@/store/devices.store";
import { useSocket } from "@/hooks/use-socket";
import { setAuthToken, api } from "@/lib/api";
import { Wifi, Cpu, Bell, Terminal, Search, TrendingUp } from "lucide-react";

export default function DashboardClient() {
  const router = useRouter();
  const { user, token, _hasHydrated } = useAuthStore();
  const {
    devices,
    selectedDevice,
    latestTelemetry,
    fetchDevices,
    selectDevice,
    updateDeviceStatus,
    updateTelemetry,
  } = useDevicesStore();

  const [commandInput, setCommandInput] = useState("TURN_OFF");
  const [cmdLog, setCmdLog] = useState<
    { instruction: string; status: string }[]
  >([]);
  const [alerts, setAlerts] = useState<{ message: string; sentAt: string }[]>(
    [],
  );

  // Effect 1 — auth + fetch devices
  useEffect(() => {
    if (!_hasHydrated) return; // wait for hydration
    if (!token) {
      router.push("/sign-in");
      return;
    }
    setAuthToken(token);
    fetchDevices();
  }, [token, fetchDevices, router, _hasHydrated]);

  // Effect 2 — fetch alerts when selected device changes
  useEffect(() => {
    if (!selectedDevice) return;
    const getAlerts = async () => {
      try {
        const { data } = await api.get(`/alerts/${selectedDevice.id}`);
        setAlerts(data.data.slice(0, 3));
      } catch {}
    };
    getAlerts();
  }, [selectedDevice]);

  useSocket(
    _hasHydrated ? (user?.id ?? null) : null,
    (data) => {
      console.log("📡 Telemetry:", data);
      updateTelemetry(data.deviceId, data.payload);
    },
    (data) => updateDeviceStatus(data.deviceId, data.status),
  );

  const sendCommand = async () => {
    if (!selectedDevice) return;
    try {
      await api.post(`/commands/${selectedDevice.id}`, {
        instruction: commandInput,
      });
      setCmdLog((prev) => [
        { instruction: commandInput, status: "PENDING" },
        ...prev.slice(0, 2),
      ]);
      setTimeout(
        () =>
          setCmdLog((prev) =>
            prev.map((c, i) =>
              i === 0 ? { ...c, status: "ACKNOWLEDGED" } : c,
            ),
          ),
        1500,
      );
    } catch {}
  };

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;
  const currentTelemetry = selectedDevice
    ? latestTelemetry[selectedDevice.id]
    : null;

  const statusDot = (s: Device["status"]) =>
    ({
      ONLINE: "bg-emerald-500",
      OFFLINE: "bg-[#2A3D27]",
      IDLE: "bg-amber-400",
    })[s];
  const statusPill = (s: Device["status"]) =>
    ({
      ONLINE: "bg-emerald-500/10 text-emerald-400",
      OFFLINE: "bg-[#1A2A1A] text-[#4A5E47]",
      IDLE: "bg-amber-500/10 text-amber-400",
    })[s];

  return (
    <div className="flex h-screen bg-[#0C0F0A] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1A2E1A]">
          <div>
            <h1 className="text-base font-medium text-[#E8F0E4]">
              Hello, {user?.email?.split("@")[0]} 👋
            </h1>
            <p className="text-xs text-[#4A5E47] mt-0.5">
              Monitor and control your connected devices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#0A130A] border border-[#1E3B2A] rounded-full px-3 py-1.5 w-44">
              <Search size={12} className="text-[#2A3D27]" />
              <input
                placeholder="Search devices..."
                className="text-xs bg-transparent outline-none text-[#E8F0E4] placeholder:text-[#2A3D27] w-full"
              />
            </div>
            <div className="relative">
              <button className="w-8 h-8 rounded-full bg-[#0A130A] border border-[#1E3B2A] flex items-center justify-center text-[#4A5E47]">
                <Bell size={13} />
              </button>
              {alerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0C0F0A]" />
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { icon: Cpu, label: "Total devices", value: devices.length },
              { icon: Wifi, label: "Online now", value: onlineCount },
              { icon: Bell, label: "Alerts today", value: alerts.length },
              {
                icon: Terminal,
                label: "Commands sent",
                value: cmdLog.length,
                accent: true,
              },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${accent ? "bg-[#3D6B55] border-[#3D6B55]" : "bg-[#0A130A] border-[#1E3B2A]"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? "bg-white/10" : "bg-[#0F1A0C]"}`}
                >
                  <Icon
                    size={15}
                    className={accent ? "text-white" : "text-[#3D6B55]"}
                  />
                </div>
                <div>
                  <p
                    className={`text-xs ${accent ? "text-white/60" : "text-[#4A5E47]"}`}
                  >
                    {label}
                  </p>
                  <p
                    className={`text-xl font-medium ${accent ? "text-white" : "text-[#E8F0E4]"}`}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-[1fr_1fr_240px] gap-3">
            {/* Device list */}
            <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#E8F0E4]">Devices</p>
                <span className="flex items-center gap-1 text-xs text-[#4A5E47]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Live
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {devices.length === 0 && (
                  <p className="text-xs text-[#2A3D27] py-4 text-center font-mono">
                    No devices yet
                  </p>
                )}
                {devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => selectDevice(device)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border ${selectedDevice?.id === device.id ? "bg-[#0F1A0C] border-[#3D6B55]/40" : "border-transparent hover:bg-[#0F1A0C]"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(device.status)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8F0E4] truncate">
                        {device.name}
                      </p>
                      <p className="text-xs text-[#2A3D27] font-mono truncate">
                        {device.type}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusPill(device.status)}`}
                    >
                      {device.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Telemetry + Commands */}
            <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#E8F0E4] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  {selectedDevice?.name ?? "Select a device"}
                </p>
                <span className="text-xs text-[#2A3D27] font-mono">
                  live telemetry
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {!currentTelemetry && (
                  <p className="text-xs text-[#2A3D27] py-3 text-center font-mono">
                    {selectedDevice ? "Waiting for data..." : "Select a device"}
                  </p>
                )}
                {currentTelemetry &&
                  Object.entries(currentTelemetry).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0F1A0C] border border-[#162214]"
                    >
                      <div>
                        <p className="text-xs text-[#2A4025] font-mono capitalize">
                          {key}
                        </p>
                        <p className="text-base font-medium text-[#E8F0E4] font-mono">
                          {String(value)}
                        </p>
                      </div>
                      <TrendingUp size={13} className="text-[#2A3D27]" />
                    </div>
                  ))}
              </div>

              <div className="mt-auto">
                <p className="text-xs text-[#2A3D27] font-mono mb-2">
                  Send command
                </p>
                <div className="flex gap-2">
                  <select
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    className="flex-1 border border-[#1E3B2A] rounded-lg px-2 py-1.5 text-xs bg-[#0F1A0C] text-[#E8F0E4] outline-none font-mono"
                  >
                    {[
                      "TURN_OFF",
                      "TURN_ON",
                      "RESTART",
                      "CALIBRATE",
                      "GET_STATUS",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    onClick={sendCommand}
                    disabled={!selectedDevice}
                    className="px-4 py-1.5 bg-[#3D6B55] hover:bg-[#4d8a6e] disabled:opacity-40 text-white text-xs rounded-lg transition-colors"
                  >
                    Send →
                  </button>
                </div>
              </div>

              {cmdLog.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-[#2A3D27] font-mono">
                    Recent commands
                  </p>
                  {cmdLog.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0F1A0C] border border-[#162214]"
                    >
                      <span className="text-xs font-mono text-[#9EC4A8]">
                        {c.instruction}
                      </span>
                      <span
                        className={`text-xs font-mono ${c.status === "ACKNOWLEDGED" ? "text-[#5CAF85]" : "text-[#2A3D27]"}`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3">
              {/* Profile */}
              <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#3D6B55] flex items-center justify-center text-white text-sm font-medium">
                    {user?.email?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#E8F0E4]">
                      {user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-[#2A3D27] font-mono">
                      {user?.email}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-1">
                    {[
                      { label: "Devices", value: devices.length },
                      { label: "Online", value: onlineCount },
                      { label: "Alerts", value: alerts.length },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-sm font-medium text-[#E8F0E4]">
                          {value}
                        </p>
                        <p className="text-xs text-[#2A3D27] font-mono">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-4 flex-1">
                <p className="text-sm font-medium text-[#E8F0E4] mb-3">
                  Recent alerts
                </p>
                <div className="flex flex-col gap-2">
                  {alerts.length === 0 && (
                    <p className="text-xs text-[#2A3D27] font-mono py-2 text-center">
                      No alerts yet
                    </p>
                  )}
                  {alerts.map((alert, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl bg-red-500/5 border-l-2 border-red-500/40"
                    >
                      <p className="text-xs text-[#E8F0E4]">{alert.message}</p>
                      <p className="text-xs text-[#2A3D27] font-mono mt-0.5">
                        {new Date(alert.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
