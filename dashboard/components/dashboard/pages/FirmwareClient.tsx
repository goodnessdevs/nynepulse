"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Firmware
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            OTA firmware management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3D6B55] hover:bg-[#2d5040] text-white gap-2 text-sm">
                  <Upload size={14} /> <span className="hidden sm:inline">Upload firmware</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base font-medium">
                    Upload firmware
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-500">Version</Label>
                    <Input
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="e.g. 1.0.2"
                      className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3D6B55] bg-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-500">
                      Device type
                    </Label>
                    <Select value={deviceType} onValueChange={setDeviceType}>
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
                      Firmware file (.bin, .hex, .elf)
                    </Label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-6 text-center cursor-pointer hover:border-[#3D6B55] transition-colors"
                    >
                      <Upload
                        size={20}
                        className="mx-auto text-zinc-300 mb-2"
                      />
                      <p className="text-xs text-zinc-400">
                        {file ? file.name : "Click to select file"}
                      </p>
                    </div>
                    <Input
                      ref={fileRef}
                      type="file"
                      accept=".bin,.hex,.elf"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || !version || !deviceType || uploading}
                    className="bg-[#3D6B55] hover:bg-[#2d5040] text-white disabled:opacity-40"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-100 dark:border-zinc-700">
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Version
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Device type
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Uploaded at
                </TableHead>
                <TableHead className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  File
                </TableHead>
                {isAdmin && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {firmwares.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-zinc-400 py-12"
                  >
                    No firmware uploaded yet
                  </TableCell>
                </TableRow>
              )}
              {firmwares.map((fw) => (
                <TableRow
                  key={fw.id}
                  className="border-zinc-100 dark:border-zinc-700"
                >
                  <TableCell className="font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                    v{fw.version}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 font-mono whitespace-nowrap">
                    {fw.deviceType}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                    {format(new Date(fw.uploadedAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}${fw.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#3D6B55] hover:underline"
                    >
                      <Download size={13} /> Download
                    </a>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(fw.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
