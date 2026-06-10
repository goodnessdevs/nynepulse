"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore } from "@/store/devices.store";
import { setAuthToken, api } from "@/lib/api";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DevicesClient() {
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

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusColor = (status: string) =>
    ({
      ONLINE:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      OFFLINE: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
      IDLE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    })[status] ?? "";

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Devices
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your connected IoT devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setNewDeviceToken(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#3D6B55] hover:bg-[#2d5040] text-white gap-2 text-sm">
                <Plus size={15} /> <span className="hidden sm:inline">Add device</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-medium">
                  {newDeviceToken ? "Device created" : "Add new device"}
                </DialogTitle>
              </DialogHeader>

              {newDeviceToken ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-zinc-500">
                    Copy this token — it will only be shown once. Paste it
                    into your device firmware.
                  </p>
                  <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2">
                    <code className="text-xs flex-1 break-all text-zinc-700 dark:text-zinc-300">
                      {newDeviceToken}
                    </code>
                    <button onClick={() => copyToken(newDeviceToken, "new")}>
                      {copiedId === "new" ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} className="text-zinc-400" />
                      )}
                    </button>
                  </div>
                  <Button
                    onClick={() => setOpen(false)}
                    className="bg-[#3D6B55] hover:bg-[#2d5040] text-white"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-500">
                      Device name
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Temperature Sensor 01"
                      className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3D6B55] bg-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-500">
                      Device type
                    </Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="w-full md:w-50 border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 rounded-lg outline-none">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "temperature_sensor",
                          "humidity_sensor",
                          "relay_switch",
                          "power_monitor",
                          "soil_sensor",
                          "gas_sensor",
                        ].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-500">
                      Location (optional)
                    </Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Room A"
                      className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3D6B55] bg-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={!name || !type || loading}
                    className="bg-[#3D6B55] hover:bg-[#2d5040] text-white disabled:opacity-40"
                  >
                    {loading ? "Creating..." : "Create device"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border-0 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-100 dark:border-zinc-700">
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Name
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Type
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Location
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Token
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Last seen
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-zinc-400 py-12"
                  >
                    No devices yet. Add your first device.
                  </TableCell>
                </TableRow>
              )}
              {devices.map((device) => (
                <TableRow
                  key={device.id}
                  className="border-zinc-100 dark:border-zinc-700"
                >
                  <TableCell className="font-medium text-sm text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {device.name}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 font-mono whitespace-nowrap">
                    {device.type}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(device.status)}`}
                    >
                      {device.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500 whitespace-nowrap">
                    {(device.metadata as any)?.location ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs text-zinc-400 font-mono truncate max-w-24">
                        {device.token.slice(0, 12)}...
                      </code>
                      <button
                        onClick={() => copyToken(device.token, device.id)}
                      >
                        {copiedId === device.id ? (
                          <Check size={13} className="text-emerald-500" />
                        ) : (
                          <Copy
                            size={13}
                            className="text-zinc-400 hover:text-zinc-600"
                          />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                    {device.lastSeenAt
                      ? new Date(device.lastSeenAt).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
