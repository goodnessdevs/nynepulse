// ============================================================
// FIRMWARE PAGE — src/app/dashboard/firmware/page.tsx
// ============================================================
"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { setAuthToken, api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

export default function FirmwareClient() {
  const { token, user } = useAuthStore();
  const [firmwares, setFirmwares] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchFirmware = async () => {
    try {
      const { data } = await api.get("/firmware");
      setFirmwares(data.data ?? []);
    } catch {}
  };

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    fetchFirmware();
  }, [token]);

  const handleUpload = async () => {
    if (!file || !version || !deviceType) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("version", version);
      form.append("deviceType", deviceType);
      await api.post("/firmware/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchFirmware();
      setOpen(false);
      setVersion("");
      setDeviceType("");
      setFile(null);
    } catch {}
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this firmware?")) return;
    await api.delete(`/firmware/${id}`);
    fetchFirmware();
  };

  const isAdmin = user?.role === "ADMIN";
  const inputClass =
    "w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] placeholder:text-[#2A3D27] outline-none focus:border-[#3D6B55] transition-colors";

  return (
    <div className="flex h-screen bg-[#0C0F0A] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-[#1A2E1A] gap-4 sm:gap-0">
          <div>
            <h1 className="text-base font-medium text-[#E8F0E4]">Firmware</h1>
            <p className="text-xs text-[#4A5E47] mt-0.5">
              OTA firmware management
            </p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#3D6B55] hover:bg-[#4d8a6e] text-white text-sm rounded-xl transition-colors">
                  <Upload size={14} /> Upload firmware
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4]">
                <DialogHeader>
                  <DialogTitle className="text-sm font-medium text-[#E8F0E4]">
                    Upload firmware
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#4A5E47] font-mono">
                      Version
                    </label>
                    <input
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="e.g. 1.0.2"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#4A5E47] font-mono">
                      Device type
                    </label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
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
                    <label className="text-xs text-[#4A5E47] font-mono">
                      File (.bin, .hex, .elf)
                    </label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border border-dashed border-[#1E3B2A] rounded-xl px-3 py-6 text-center cursor-pointer hover:border-[#3D6B55] transition-colors"
                    >
                      <Upload
                        size={18}
                        className="mx-auto text-[#2A3D27] mb-2"
                      />
                      <p className="text-xs text-[#2A3D27] font-mono">
                        {file ? file.name : "Click to select file"}
                      </p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".bin,.hex,.elf"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={!file || !version || !deviceType || uploading}
                    className="w-full py-2.5 bg-[#3D6B55] hover:bg-[#4d8a6e] disabled:opacity-40 text-white text-sm rounded-xl transition-colors"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-24 sm:pb-6 pt-4">
          <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#162214] hover:bg-transparent">
                  {[
                    "Version",
                    "Device type",
                    "Uploaded at",
                    "File",
                    isAdmin ? "" : null,
                  ]
                    .filter(Boolean)
                    .map((h) => (
                      <TableHead
                        key={h as string}
                        className="text-xs text-[#2A3D27] font-mono"
                      >
                        {h}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {firmwares.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-xs text-[#2A3D27] font-mono py-12"
                    >
                      No firmware uploaded yet
                    </TableCell>
                  </TableRow>
                )}
                {firmwares.map((fw) => (
                  <TableRow
                    key={fw.id}
                    className="border-[#162214] hover:bg-[#0F1A0C]"
                  >
                    <TableCell className="font-mono text-sm font-medium text-[#5CAF85]">
                      v{fw.version}
                    </TableCell>
                    <TableCell className="text-xs text-[#4A5E47] font-mono">
                      {fw.deviceType}
                    </TableCell>
                    <TableCell className="text-xs text-[#2A3D27] font-mono">
                      {format(new Date(fw.uploadedAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${fw.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#3D6B55] hover:text-[#5CAF85] font-mono transition-colors"
                      >
                        <Download size={12} /> Download
                      </a>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <button
                          onClick={() => handleDelete(fw.id)}
                          className="text-[#2A3D27] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </TableCell>
                    )}
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
