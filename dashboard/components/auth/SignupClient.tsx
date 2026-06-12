"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SignupClient() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async () => {
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/register`, {
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      // Auto login after register
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.data?.message;
      setError(msg ?? "Registration failed. Please try again.");
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
          <h1 className="text-lg font-medium text-[#E8F0E4]">Create account</h1>
          <p className="text-xs text-[#4A5E47] mt-1">
            Start managing your IoT devices
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#4A5E47] font-mono">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              className="w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] placeholder:text-[#2A3D27] outline-none focus:border-[#3D6B55] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#4A5E47] font-mono">
              Phone{" "}
              <span className="text-[#2A3D27]">
                (optional — for SMS alerts)
              </span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+2348012345678"
              className="w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] placeholder:text-[#2A3D27] outline-none focus:border-[#3D6B55] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#4A5E47] font-mono">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 6 characters"
              className="w-full bg-[#0C0F0A] border border-[#1E3B2A] rounded-lg px-3 py-2.5 text-sm text-[#E8F0E4] placeholder:text-[#2A3D27] outline-none focus:border-[#3D6B55] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#4A5E47] font-mono">
              Confirm password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
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
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-2.5 bg-[#3D6B55] hover:bg-[#4d8a6e] disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-xs text-[#4A5E47] text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[#5CAF85] hover:underline">
              Sign in
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
