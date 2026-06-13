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
import Image from "next/image";

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
    router.push("/sign-in");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="fixed bottom-0 left-0 w-full h-16 bg-[#060A06] border-t border-[#1A2E1A] flex sm:relative sm:w-14 sm:h-full sm:flex-col sm:border-t-0 sm:border-r items-center py-0 sm:py-4 px-2 sm:px-0 gap-1 sm:gap-1.5 shrink-0 z-50">
        <div
          className="hidden sm:flex w-8 h-8 rounded-lg bg-[#3D6B55] items-center justify-center mb-4 cursor-pointer shrink-0"
          onClick={() => router.push("/")}
        >
          <div className="relative">
            <Image
              src={"/favicon.svg"}
              alt={"N9"}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-1 sm:flex-none sm:flex-col items-center justify-around sm:justify-start w-full gap-1 sm:gap-1.5">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => router.push(href)}
                  className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all shrink-0
                    ${
                      pathname === href
                        ? "bg-[#3D6B55] text-white"
                        : "text-[#2A4025] hover:bg-[#0F1A0C] hover:text-[#5CAF85]"
                    }`}
                >
                  <Icon size={18} className="sm:size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="hidden sm:block bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4] text-xs"
              >
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="flex sm:mt-auto sm:flex-col items-center gap-1 sm:gap-1.5 px-2 sm:px-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-[#2A4025] hover:bg-[#0F1A0C] hover:text-[#5CAF85] transition-all">
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
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[#2A4025] hover:bg-[#0F1A0C] hover:text-red-400 transition-all"
              >
                <LogOut size={18} className="sm:size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="hidden sm:block bg-[#0A130A] border-[#1E3B2A] text-[#E8F0E4] text-xs"
            >
              Sign out
            </TooltipContent>
          </Tooltip>

          <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#3D6B55] flex items-center justify-center text-white text-xs font-medium shrink-0">
            {initials}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
