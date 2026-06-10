"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore } from "@/store/devices.store";
import { setAuthToken, api } from "@/lib/api";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMMANDS = ["TURN_OFF", "TURN_ON", "RESTART", "CALIBRATE", "GET_STATUS"];

export default function CommandsClient() {
  const { token } = useAuthStore();
  const { devices, fetchDevices, selectedDevice, selectDevice } =
    useDevicesStore();
  const [commands, setCommands] = useState<any[]>([]);
  const [instruction, setInstruction] = useState("TURN_OFF");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    fetchDevices();
  }, [token, fetchDevices]);

  const fetchCommands = async (deviceId: string) => {
    try {
      const { data } = await api.get(`/commands/${deviceId}`);
      setCommands(data.data ?? []);
    } catch {}
  };

  useEffect(() => {
    if (!selectedDevice) return;
    fetchCommands(selectedDevice.id);
  }, [selectedDevice?.id, selectedDevice]);

  const sendCommand = async () => {
    if (!selectedDevice) return;
    setSending(true);
    try {
      await api.post(`/commands/${selectedDevice.id}`, { instruction });
      await fetchCommands(selectedDevice.id);
    } catch {}
    setSending(false);
  };

  const statusColor = (status: string) =>
    ({
      PENDING: "text-amber-500",
      DELIVERED: "text-blue-500",
      ACKNOWLEDGED: "text-emerald-500",
      FAILED: "text-red-500",
    })[status] ?? "text-zinc-400";

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Commands
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Send and track device commands
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-4">
        {/* Send Command Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            Send command
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={selectedDevice?.id ?? ""}
              onValueChange={(value) => {
                const d = devices.find((d) => d.id === value);
                if (d) selectDevice(d);
              }}
            >
              <SelectTrigger className="flex-1 border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 rounded-lg outline-none">
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

            <Select value={instruction} onValueChange={setInstruction}>
              <SelectTrigger className="flex-1 border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 rounded-lg outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMANDS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={sendCommand}
              disabled={!selectedDevice || sending}
              className="bg-[#3D6B55] hover:bg-[#2d5040] text-white gap-2 disabled:opacity-40"
            >
              <Send size={14} />
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>

        {/* Command History */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Command history
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-100 dark:border-zinc-700">
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Instruction
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Sent at
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Acknowledged at
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commands.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-zinc-400 py-10"
                  >
                    {selectedDevice
                      ? "No commands sent yet"
                      : "Select a device to view command history"}
                  </TableCell>
                </TableRow>
              )}
              {commands.map((cmd) => (
                <TableRow
                  key={cmd.id}
                  className="border-zinc-100 dark:border-zinc-700"
                >
                  <TableCell className="font-mono text-sm text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                    {cmd.instruction}
                  </TableCell>
                  <TableCell
                    className={`text-sm font-medium ${statusColor(cmd.status)} whitespace-nowrap`}
                  >
                    {cmd.status}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                    {format(new Date(cmd.sentAt), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                    {cmd.ackedAt
                      ? format(new Date(cmd.ackedAt), "MMM d, HH:mm:ss")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>

}
