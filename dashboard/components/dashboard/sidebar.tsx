"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Cpu,
  ChartLine,
  Terminal,
  Bell,
  Upload,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Cpu, label: "Devices", href: "/dashboard/devices" },
  { icon: ChartLine, label: "Telemetry", href: "/dashboard/telemetry" },
  { icon: Terminal, label: "Commands", href: "/dashboard/commands" },
  { icon: Bell, label: "Alerts", href: "/dashboard/alerts" },
  { icon: Upload, label: "Firmware", href: "/dashboard/firmware" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "N9";

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="w-full sm:w-16 bg-zinc-900 flex sm:flex-col items-center py-3 sm:py-5 px-4 sm:px-0 gap-2 sm:rounded-r-2xl fixed bottom-0 sm:relative sm:bottom-auto z-50">
        <div className="hidden sm:flex w-9 h-9 rounded-xl bg-[#3D6B55] items-center justify-center mb-4">
          <span className="text-white font-medium text-sm">N9</span>
        </div>

        <div className="flex sm:flex-col items-center justify-around sm:justify-start w-full gap-2">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => router.push(href)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${
                      pathname === href
                        ? "bg-[#3D6B55] text-white"
                        : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    }`}
                >
                  <Icon size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden sm:block">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="sm:mt-auto flex sm:flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all">
                <Settings size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden sm:block">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all"
              >
                <LogOut size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden sm:block">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-8 h-8 rounded-full bg-[#3D6B55] flex items-center justify-center text-white text-xs font-medium sm:mt-1">
            {initials}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );

}
