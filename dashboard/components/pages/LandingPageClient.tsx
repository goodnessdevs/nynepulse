"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

function PulseLine() {
  return (
    <svg width="100%" height="36" viewBox="0 0 320 36">
      <polyline
        points="0,18 20,18 35,6 50,30 65,18 95,18 110,8 125,28 140,18 165,18 180,6 195,30 210,18 240,18 255,10 270,26 285,18 320,18"
        fill="none"
        stroke="#3D6B55"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <circle r="3.5" fill="#5CAF85">
        <animateMotion
          dur="2.5s"
          repeatCount="indefinite"
          path="M0,18 L20,18 L35,6 L50,30 L65,18 L95,18 L110,8 L125,28 L140,18 L165,18 L180,6 L195,30 L210,18 L240,18 L255,10 L270,26 L285,18 L320,18"
        />
      </circle>
    </svg>
  );
}

export default function LandingPage() {
  const [telemetry, setTelemetry] = useState({
    temp: 36.5,
    hum: 72.0,
    volt: 219.4,
  });
  const [prev, setPrev] = useState({ temp: 36.5, hum: 72.0, volt: 219.4 });
  const [uptime, setUptime] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const tele = setInterval(() => {
      setTelemetry((p) => {
        setPrev({ ...p });
        return {
          temp: +Math.max(
            20,
            Math.min(55, p.temp + (Math.random() - 0.48) * 1.8),
          ).toFixed(1),
          hum: +Math.max(
            30,
            Math.min(98, p.hum + (Math.random() - 0.48) * 2.5),
          ).toFixed(1),
          volt: +Math.max(
            200,
            Math.min(240, p.volt + (Math.random() - 0.48) * 3),
          ).toFixed(1),
        };
      });
    }, 2500);
    const tick = setInterval(() => setUptime((s) => s + 1), 1000);
    return () => {
      clearInterval(tele);
      clearInterval(tick);
    };
  }, []);

  const trend = (cur: number, p: number) =>
    cur > p ? (
      <span className="text-[#e06c5a]">↑</span>
    ) : cur < p ? (
      <span className="text-[#5CAF85]">↓</span>
    ) : (
      <span className="text-[#2A3D27]">→</span>
    );

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  return (
    <div className="min-h-screen bg-[#0C0F0A] text-[#E8F0E4]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-[#1A2E1A]">
        <div className="flex items-center gap-2.5 h-8 w-8">
          <div className="relative">
            <Image
              src={"/favicon.svg"}
              alt={"N9"}
              fill
              priority
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium">NynePulse</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="https://github.com/goodnessdevs/nynepulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#4A5E47] hover:text-[#9EC4A8] transition-colors"
          >
            GitHub
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#4A5E47] hover:text-[#9EC4A8] transition-colors"
          >
            API Docs
          </a>
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 bg-[#3D6B55] hover:bg-[#4d8a6e] text-white rounded-xl transition-colors"
          >
            Dashboard →
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`w-5 h-0.5 bg-[#4A5E47] transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`w-5 h-0.5 bg-[#4A5E47] transition-all ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`w-5 h-0.5 bg-[#4A5E47] transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 py-5 border-b border-[#1A2E1A] bg-[#0A130A]">
          <a
            href="https://github.com/goodnessdevs/nynepulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#4A5E47]"
          >
            GitHub
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/docs`}
            rel="noopener noreferrer"
            target="_blank"
            className="text-sm text-[#4A5E47]"
          >
            API Docs
          </a>
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 bg-[#3D6B55] text-white rounded-xl text-center"
          >
            Dashboard →
          </Link>
        </div>
      )}

      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center px-6 md:px-12 pt-14 md:pt-20 pb-12 md:pb-16 max-w-6xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-[#5CAF85] border border-[#1E3B2A] rounded-full px-3 py-1 mb-6 md:mb-8 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5CAF85] animate-pulse" />
            open source · self-hostable
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-5 md:mb-6 tracking-tight">
            IoT device management
            <br />
            <span className="text-[#3D6B55]">built for developers.</span>
          </h1>
          <p className="text-[#4A5E47] text-sm leading-relaxed mb-8 md:mb-10 max-w-sm">
            Connect any device, stream telemetry in real time, and send commands
            back — without the complexity of enterprise platforms.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#3D6B55] hover:bg-[#4d8a6e] text-white rounded-xl text-sm font-medium transition-colors"
            >
              Launch dashboard
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/docs`}
              target="_blank"
              className="px-5 py-2.5 border border-[#1E3B2A] text-[#4A5E47] hover:text-[#9EC4A8] hover:border-[#3D6B55] rounded-xl text-sm transition-all"
            >
              Explore API
            </a>
          </div>
        </div>

        {/* Terminal */}
        <div className="relative pb-7 pr-0 md:pr-7">
          <div className="bg-[#0A130A] border border-[#1E3B2A] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5CAF85] animate-pulse inline-block" />
                <span className="text-xs text-[#5CAF85] font-mono">ONLINE</span>
              </div>
              <span className="text-xs text-[#2A3D27] font-mono truncate ml-2">
                temperature_sensor · Sensor-01
              </span>
            </div>

            {[
              {
                key: "temperature",
                val: telemetry.temp,
                prev: prev.temp,
                unit: "°C",
              },
              {
                key: "humidity",
                val: telemetry.hum,
                prev: prev.hum,
                unit: "%",
              },
              {
                key: "voltage",
                val: telemetry.volt,
                prev: prev.volt,
                unit: "V",
              },
            ].map(({ key, val, prev: p, unit }) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-[#111E11] last:border-0"
              >
                <span className="text-xs text-[#2A4025] font-mono w-24">
                  {key}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#E8F0E4] font-mono tabular-nums">
                    {val.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#2A3D27]">{unit}</span>
                  <span className="text-xs w-3">{trend(val, p)}</span>
                </div>
              </div>
            ))}

            <div className="border-t border-[#1A2A1A] mt-4 pt-4 mb-4">
              <PulseLine />
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-[#2A3D27] font-mono">
                last seen: just now
              </span>
              <span className="text-xs text-[#2A3D27] font-mono">
                uptime: {fmt(uptime)}
              </span>
            </div>
          </div>

          {/* Command card */}
          <div className="absolute bottom-0 right-0 md:right-0 bg-[#0A130A] border border-[#1E3B2A] rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1A2E1A] flex items-center justify-center text-[#5CAF85] text-xs font-mono">
              →
            </div>
            <div>
              <div className="text-xs text-[#E8F0E4] font-mono">TURN_OFF</div>
              <div className="text-xs text-[#5CAF85]">acknowledged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-6 md:px-12 pb-12 md:pb-14 max-w-6xl mx-auto">
        {[
          {
            step: "01 — CONNECT",
            title: "Any device, any hardware",
            desc: "Register a device and get a token in seconds. Any hardware that can make HTTP requests can publish telemetry — ESP32, Raspberry Pi, anything.",
          },
          {
            step: "02 — STREAM",
            title: "Live data via WebSocket",
            desc: "Socket.io rooms deliver telemetry to your dashboard the instant a device publishes. Redis caches device state with auto-expiring TTLs.",
          },
          {
            step: "03 — CONTROL",
            title: "Commands and alerts",
            desc: "Push commands to devices and define thresholds. BullMQ fires email and SMS alerts automatically when sensor values breach limits.",
          },
        ].map(({ step, title, desc }) => (
          <div key={step} className="border border-[#1A2A1A] rounded-2xl p-6">
            <div className="text-xs text-[#3D6B55] font-mono mb-4 tracking-wide">
              {step}
            </div>
            <div className="text-sm font-medium text-[#E8F0E4] mb-2">
              {title}
            </div>
            <p className="text-xs text-[#4A5E47] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Stack */}
      <div className="flex items-center gap-3 flex-wrap px-6 md:px-12 py-8 max-w-6xl mx-auto border-t border-[#1A2A1A]">
        <span className="text-xs text-[#2A3D27] font-mono mr-2">
          built with
        </span>
        {[
          "NestJS",
          "Prisma",
          "PostgreSQL",
          "Redis",
          "BullMQ",
          "Socket.io",
          "Next.js",
          "Resend",
        ].map((t) => (
          <span
            key={t}
            className="text-xs text-[#3D6B55] border border-[#1E3B2A] px-2.5 py-1 rounded-lg font-mono"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
