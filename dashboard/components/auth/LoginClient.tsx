"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function LoginClient() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B55] flex items-center justify-center mb-4">
            <span className="text-white font-medium text-sm">N9</span>
          </div>
          <h1 className="text-lg font-medium text-[#E8F0E4]">Welcome back</h1>
          <p className="text-xs text-[#4A5E47] mt-1">
            Sign in to your NynePulse dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#4A5E47] font-mono">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] placeholder:text-[#2A3D27] outline-none focus:border-[#3D6B55] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#4A5E47] font-mono">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] placeholder:text-[#2A3D27] outline-none focus:border-[#3D6B55] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-[#3D6B55] hover:bg-[#4d8a6e] disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-xs text-[#4A5E47] text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#5CAF85] hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-xs text-[#2A3D27] text-center mt-6 font-mono">
          NynePulse · IoT Device Management
        </p>
      </div>
    </div>
  );
}
