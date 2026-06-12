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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="w-14 bg-[#060A06] flex flex-col items-center py-4 gap-1.5 border-r border-[#1A2E1A] shrink-0">
        <div
          className="w-8 h-8 rounded-lg bg-[#3D6B55] flex items-center justify-center mb-4 cursor-pointer shrink-0"
          onClick={() => router.push("/")}
        >
          <span className="text-white font-medium text-xs">N9</span>
        </div>

        {navItems.map(({ icon: Icon, label, href }) => (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <button
                onClick={() => router.push(href)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0
                  ${
                    pathname === href
                      ? "bg-[#3D6B55] text-white"
                      : "text-[#2A4025] hover:bg-[#0F1A0C] hover:text-[#5CAF85]"
                  }`}
              >
                <Icon size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4] text-xs"
            >
              {label}
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="mt-auto flex flex-col items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2A4025] hover:bg-[#0F1A0C] hover:text-[#5CAF85] transition-all">
                <Settings size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4] text-xs"
            >
              Settings
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2A4025] hover:bg-[#0F1A0C] hover:text-red-400 transition-all"
              >
                <LogOut size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4] text-xs"
            >
              Sign out
            </TooltipContent>
          </Tooltip>

          <div className="w-7 h-7 rounded-full bg-[#3D6B55] flex items-center justify-center text-white text-xs font-medium mt-1 shrink-0">
            {initials}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
