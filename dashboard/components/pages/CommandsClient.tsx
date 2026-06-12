// ============================================================
// COMMANDS PAGE — src/app/dashboard/commands/page.tsx
// ============================================================
"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useDevicesStore } from "@/store/devices.store";
import { setAuthToken, api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const COMMANDS = ["TURN_OFF", "TURN_ON", "RESTART", "CALIBRATE", "GET_STATUS"];

export default function CommandsPage() {
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

  const fetchCommands = async (id: string) => {
    try {
      const { data } = await api.get(`/commands/${id}`);
      setCommands(data.data ?? []);
    } catch {}
  };

  useEffect(() => {
    if (selectedDevice) fetchCommands(selectedDevice.id);
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

  const statusColor = (s: string) =>
    ({
      PENDING: "text-amber-400",
      DELIVERED: "text-blue-400",
      ACKNOWLEDGED: "text-[#5CAF85]",
      FAILED: "text-red-400",
    })[s] ?? "text-[#2A3D27]";

  return (
    <div className="flex h-screen bg-[#0C0F0A] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1A2E1A]">
          <div>
            <h1 className="text-base font-medium text-[#E8F0E4]">Commands</h1>
            <p className="text-xs text-[#4A5E47] mt-0.5">
              Send and track device commands
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 flex flex-col gap-4">
          <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-5">
            <p className="text-xs text-[#4A5E47] font-mono mb-4">
              Send command
            </p>
            <div className="flex gap-3">
              <Select
                value={selectedDevice?.id ?? ""}
                onValueChange={(v) => {
                  const d = devices.find((d) => d.id === v);
                  if (d) selectDevice(d);
                }}
              >
                <SelectTrigger className="flex-1 text-xs bg-[#0C0F0A] border-[#1E3B2A] text-[#E8F0E4]">
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
              <Select value={instruction} onValueChange={setInstruction}>
                <SelectTrigger className="flex-1 text-xs bg-[#0C0F0A] border-[#1E3B2A] text-[#E8F0E4] font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A130A] border-[#1E3B2A]">
                  {COMMANDS.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="text-xs text-[#E8F0E4] font-mono"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={sendCommand}
                disabled={!selectedDevice || sending}
                className="flex items-center gap-2 px-4 py-2 bg-[#3D6B55] hover:bg-[#4d8a6e] disabled:opacity-40 text-white text-xs rounded-xl transition-colors"
              >
                <Send size={13} /> {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>

          <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#162214]">
              <p className="text-xs text-[#4A5E47] font-mono">
                Command history
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-[#162214] hover:bg-transparent">
                  {["Instruction", "Status", "Sent at", "Acknowledged at"].map(
                    (h) => (
                      <TableHead
                        key={h}
                        className="text-xs text-[#2A3D27] font-mono"
                      >
                        {h}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {commands.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-xs text-[#2A3D27] font-mono py-10"
                    >
                      {selectedDevice
                        ? "No commands sent yet"
                        : "Select a device to view history"}
                    </TableCell>
                  </TableRow>
                )}
                {commands.map((cmd) => (
                  <TableRow
                    key={cmd.id}
                    className="border-[#162214] hover:bg-[#0F1A0C]"
                  >
                    <TableCell className="font-mono text-sm text-[#9EC4A8]">
                      {cmd.instruction}
                    </TableCell>
                    <TableCell
                      className={`text-xs font-mono font-medium ${statusColor(cmd.status)}`}
                    >
                      {cmd.status}
                    </TableCell>
                    <TableCell className="text-xs text-[#2A3D27] font-mono">
                      {format(new Date(cmd.sentAt), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-xs text-[#2A3D27] font-mono">
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
      </div>
    </div>
  );
}
