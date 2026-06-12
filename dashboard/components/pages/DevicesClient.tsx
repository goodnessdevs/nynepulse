// ============================================================
// DEVICES PAGE — src/app/dashboard/devices/page.tsx
// ============================================================
"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore } from "@/store/devices.store";
import { setAuthToken, api } from "@/lib/api";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Copy, Check } from "lucide-react";

export default function DevicesPage() {
  const { token } = useAuthStore();
  const { devices, fetchDevices } = useDevicesStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newDeviceToken, setNewDeviceToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    fetchDevices();
  }, [token, fetchDevices]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/devices", {
        name,
        type,
        metadata: location ? { location } : undefined,
      });
      setNewDeviceToken(data.data.token);
      fetchDevices();
      setName("");
      setType("");
      setLocation("");
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this device?")) return;
    await api.delete(`/devices/${id}`);
    fetchDevices();
  };

  const copyToken = (t: string, id: string) => {
    navigator.clipboard.writeText(t);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusPill = (s: string) =>
    ({
      ONLINE: "bg-emerald-500/10 text-emerald-400",
      OFFLINE: "bg-[#1A2A1A] text-[#4A5E47]",
      IDLE: "bg-amber-500/10 text-amber-400",
    })[s] ?? "";

  const inputClass =
    "w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] placeholder:text-[#2A3D27] outline-none focus:border-[#3D6B55] transition-colors";
  const labelClass = "text-xs text-[#4A5E47] font-mono";

  return (
    <div className="flex h-screen bg-[#0C0F0A] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1A2E1A]">
          <div>
            <h1 className="text-base font-medium text-[#E8F0E4]">Devices</h1>
            <p className="text-xs text-[#4A5E47] mt-0.5">
              Manage your connected IoT devices
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setNewDeviceToken(null);
            }}
          >
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#3D6B55] hover:bg-[#4d8a6e] text-white text-sm rounded-xl transition-colors">
                <Plus size={14} /> Add device
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4]">
              <DialogHeader>
                <DialogTitle className="text-sm font-medium text-[#E8F0E4]">
                  {newDeviceToken ? "Device created" : "Add new device"}
                </DialogTitle>
              </DialogHeader>
              {newDeviceToken ? (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-[#4A5E47]">
                    Copy this token — shown only once. Paste it into your device
                    firmware.
                  </p>
                  <div className="flex items-center gap-2 bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2">
                    <code className="text-xs flex-1 break-all text-[#5CAF85] font-mono">
                      {newDeviceToken}
                    </code>
                    <button onClick={() => copyToken(newDeviceToken, "new")}>
                      {copiedId === "new" ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} className="text-[#4A5E47]" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full py-2.5 bg-[#3D6B55] hover:bg-[#4d8a6e] text-white text-sm rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Device name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Temperature Sensor 01"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Device type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] outline-none focus:border-[#3D6B55]"
                    >
                      <option value="">Select type...</option>
                      {[
                        "temperature_sensor",
                        "humidity_sensor",
                        "relay_switch",
                        "power_monitor",
                        "soil_sensor",
                        "gas_sensor",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Location (optional)</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Room A"
                      className={inputClass}
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!name || !type || loading}
                    className="w-full py-2.5 bg-[#3D6B55] hover:bg-[#4d8a6e] disabled:opacity-40 text-white text-sm rounded-xl transition-colors"
                  >
                    {loading ? "Creating..." : "Create device"}
                  </button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1E3B2A] hover:bg-transparent">
                  {[
                    "Name",
                    "Type",
                    "Status",
                    "Location",
                    "Token",
                    "Last seen",
                    "",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs text-[#2A3D27] font-mono"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-xs text-[#2A3D27] font-mono py-12"
                    >
                      No devices yet
                    </TableCell>
                  </TableRow>
                )}
                {devices.map((device) => (
                  <TableRow
                    key={device.id}
                    className="border-[#162214] hover:bg-[#0F1A0C]"
                  >
                    <TableCell className="text-sm text-[#E8F0E4] font-medium">
                      {device.name}
                    </TableCell>
                    <TableCell className="text-xs text-[#4A5E47] font-mono">
                      {device.type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusPill(device.status)}`}
                      >
                        {device.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[#4A5E47]">
                      {(device.metadata as any)?.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs text-[#2A3D27] font-mono">
                          {device.token.slice(0, 10)}...
                        </code>
                        <button
                          onClick={() => copyToken(device.token, device.id)}
                        >
                          {copiedId === device.id ? (
                            <Check size={12} className="text-emerald-500" />
                          ) : (
                            <Copy
                              size={12}
                              className="text-[#2A3D27] hover:text-[#5CAF85]"
                            />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#2A3D27] font-mono">
                      {device.lastSeenAt
                        ? new Date(device.lastSeenAt).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="text-[#2A3D27] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
