"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore, Device } from "@/store/devices.store";
import { useSocket } from "@/hooks/use-socket";
import { setAuthToken, api } from "@/lib/api";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Card } from "@/components/ui/card";
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
      router.push("/login");
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

  // WebSocket
  useSocket(
    _hasHydrated ? (user?.id ?? null) : null,
    (data) => {
      console.log("📡 Telemetry in dashboard:", data); // ← confirm this fires
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
      setTimeout(() => {
        setCmdLog((prev) =>
          prev.map((c, i) => (i === 0 ? { ...c, status: "ACKNOWLEDGED" } : c)),
        );
      }, 1500);
    } catch {}
  };

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;
  const currentTelemetry = selectedDevice
    ? latestTelemetry[selectedDevice.id]
    : null;

  // Add this log temporarily
  console.log("latestTelemetry:", latestTelemetry);
  console.log("currentTelemetry:", currentTelemetry);

  console.log("selectedDevice id:", selectedDevice?.id);
  console.log("latestTelemetry keys:", Object.keys(latestTelemetry));

  const statusColor = (status: Device["status"]) =>
    ({
      ONLINE:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      OFFLINE: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
      IDLE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    })[status];

  const statusDot = (status: Device["status"]) =>
    ({
      ONLINE: "bg-emerald-500",
      OFFLINE: "bg-zinc-300",
      IDLE: "bg-amber-400",
    })[status];

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Hello, {user?.email?.split("@")[0]}! 👋
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor and control your connected devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1.5 w-48">
            <Search size={13} className="text-zinc-400" />
            <input
              placeholder="Search devices..."
              className="text-xs bg-transparent outline-none text-zinc-600 dark:text-zinc-300 w-full"
            />
          </div>
          <div className="relative">
            <button className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500">
              <Bell size={15} />
            </button>
            {alerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#EDEAE3] dark:border-zinc-950" />
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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
            <Card
              key={label}
              className={`flex items-center gap-3 p-4 border-0 shadow-none rounded-2xl ${accent ? "bg-[#3D6B55]" : "bg-white dark:bg-zinc-800"}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-white/15" : "bg-[#F0EDE6] dark:bg-zinc-700"}`}
              >
                <Icon
                  size={17}
                  className={accent ? "text-white" : "text-[#3D6B55]"}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${accent ? "text-white/70" : "text-zinc-400"}`}
                >
                  {label}
                </p>
                <p
                  className={`text-xl font-medium ${accent ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}
                >
                  {value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_260px] gap-3">
          {/* Device List */}
          <Card className="p-4 border-0 shadow-none rounded-2xl bg-white dark:bg-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Devices
              </p>
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {devices.length === 0 && (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  No devices yet
                </p>
              )}
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => selectDevice(device)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border
                    ${
                      selectedDevice?.id === device.id
                        ? "bg-[#F0EDE6] dark:bg-zinc-700 border-[#3D6B55]/30"
                        : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                    }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${statusDot(device.status)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {device.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {device.type}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(device.status)}`}
                  >
                    {device.status}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Telemetry + Commands */}
          <Card className="p-4 border-0 shadow-none rounded-2xl bg-white dark:bg-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                {selectedDevice?.name ?? "Select a device"}
              </p>
              <span className="text-xs text-zinc-400">Live telemetry</span>
            </div>

            {/* Telemetry Values */}
            <div className="flex flex-col gap-2">
              {!currentTelemetry && (
                <p className="text-xs text-zinc-400 py-3 text-center">
                  {selectedDevice ? "Waiting for data..." : "Select a device"}
                </p>
              )}
              {currentTelemetry &&
                Object.entries(currentTelemetry).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F7F5F1] dark:bg-zinc-700"
                  >
                    <div>
                      <p className="text-xs text-zinc-400 capitalize">{key}</p>
                      <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                        {String(value)}
                      </p>
                    </div>
                    <TrendingUp size={14} className="text-zinc-300" />
                  </div>
                ))}
            </div>

            {/* Send Command */}
            <div className="mt-auto">
              <p className="text-xs text-zinc-400 mb-2">Send command</p>
              <div className="flex gap-2">
                <select
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="flex-1 border border-zinc-200 dark:border-zinc-600 rounded-lg px-2 py-1.5 text-xs bg-[#F7F5F1] dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 outline-none"
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
                  className="px-4 py-1.5 bg-[#3D6B55] hover:bg-[#2d5040] disabled:opacity-40 text-white text-xs rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Command Log */}
            {cmdLog.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-zinc-400">Recent commands</p>
                {cmdLog.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F0EDE6] dark:bg-zinc-700"
                  >
                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                      {c.instruction}
                    </span>
                    <span
                      className={`text-xs font-medium ${c.status === "ACKNOWLEDGED" ? "text-[#3D6B55]" : "text-zinc-400"}`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Right Column */}
          <div className="flex flex-col gap-3">
            {/* Profile */}
            <Card className="p-4 border-0 shadow-none rounded-2xl bg-white dark:bg-zinc-800">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-[#3D6B55] flex items-center justify-center text-white font-medium">
                  {user?.email?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user?.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
                <div className="flex gap-4 mt-1">
                  {[
                    { label: "Devices", value: devices.length },
                    { label: "Online", value: onlineCount },
                    { label: "Alerts", value: alerts.length },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {value}
                      </p>
                      <p className="text-xs text-zinc-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Alerts */}
            <Card className="p-4 border-0 shadow-none rounded-2xl bg-white dark:bg-zinc-800 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                Recent alerts
              </p>
              <div className="flex flex-col gap-2">
                {alerts.length === 0 && (
                  <p className="text-xs text-zinc-400 py-2 text-center">
                    No alerts yet
                  </p>
                )}
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400"
                  >
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {alert.message}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(alert.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
