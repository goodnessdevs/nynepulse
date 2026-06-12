"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldOff } from "lucide-react";

export default function ForbiddenClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0C0F0A] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#0A130A] border border-[#1E3B2A] flex items-center justify-center mb-6">
          <ShieldOff size={24} className="text-[#3D6B55]" />
        </div>

        <div className="text-xs text-[#3D6B55] font-mono mb-3 tracking-widest">
          403 — FORBIDDEN
        </div>

        <h1 className="text-2xl font-medium text-[#E8F0E4] mb-3">
          Access denied
        </h1>

        <p className="text-sm text-[#4A5E47] leading-relaxed mb-8">
          You don&apos;t have permission to view this page. This area requires
          elevated privileges.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-[#1E3B2A] text-[#4A5E47] hover:text-[#9EC4A8] hover:border-[#3D6B55] rounded-xl text-sm transition-all"
          >
            ← Go back
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-[#3D6B55] hover:bg-[#4d8a6e] text-white rounded-xl text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <p className="text-xs text-[#2A3D27] font-mono mt-10">
          NynePulse · IoT Device Management
        </p>
      </div>
    </div>
  );
}
