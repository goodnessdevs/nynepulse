<div align="center">

<img src="demo.gif" alt="NynePulse Demo" width="100%" />

<br />
<br />

<img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat" />

<br />
<br />

<h1>⚡ NynePulse</h1>
<p><strong>Self-hostable IoT device management API — a lightweight, developer-friendly alternative to AWS IoT Core.</strong></p>
<p>Connect any device, stream live telemetry, send commands, and fire threshold alerts — all from a clean REST + WebSocket API.</p>

<br />

<a href="https://nynepulse.vercel.app">🚀 Live Demo</a> ·
<a href="https://nynepulse.onrender.com/api/docs">📖 API Docs</a> ·
<a href="https://github.com/goodnessdevs/nyne-pulse">⭐ GitHub</a>

</div>

---

## ✨ Features

- **Dual authentication** — JWT for dashboard users, token-based auth for IoT devices
- **Live telemetry** — devices publish sensor data; Socket.io delivers it to the dashboard in real time
- **Auto offline detection** — Redis TTL trick: devices that stop publishing automatically go `OFFLINE` with no polling or cron jobs
- **Command delivery** — send instructions to devices via WebSocket; devices acknowledge receipt
- **Threshold alerts** — BullMQ processes alert jobs asynchronously; Resend (email) and Termii (SMS) fire when sensor values breach limits
- **OTA firmware** — upload `.bin`/`.hex` files; devices poll for the latest firmware version
- **RBAC** — Admin and User roles enforced via NestJS guards
- **Rate limiting** — per-device request throttling via `@nestjs/throttler`
- **Swagger docs** — full auto-generated API docs at [`/api/docs`](https://nynepulse.onrender.com/api/docs)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NynePulse                            │
│                                                             │
│   IoT Device          NestJS API           Next.js          │
│  (ESP32, etc.)  ───►  ┌─────────┐  ◄───  Dashboard         │
│                       │  Auth   │                           │
│  POST /telemetry      │  Devices│  WebSocket (Socket.io)    │
│  Bearer <token>  ───► │Telemetry├──────────────────────────►│
│                       │Commands │◄────────────────────────── │
│  WS join:device  ◄──  │ Alerts  │   Live telemetry + cmds   │
│  ← command event      │Firmware │                           │
│                       └────┬────┘                           │
│                            │                                │
│                   ┌────────┼────────┐                       │
│                   ▼        ▼        ▼                       │
│               Postgres   Redis   BullMQ                     │
│              (Neon)    (TTL/    (alert                      │
│                         cache)   queue)                     │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- **Redis TTL trick** — device status keys expire after 30 seconds. Devices must publish telemetry every 30s or they appear `OFFLINE` automatically. No polling, no cron job.
- **BullMQ for alerts** — alert processing is decoupled from the telemetry publish path. The API returns immediately; the queue handles retries with exponential backoff.
- **Dual auth strategies** — Passport runs two strategies in parallel: `JwtStrategy` for dashboard users and `DeviceTokenStrategy` for hardware devices.
- **WebSocket rooms** — each user joins a room by `userId`; each device joins a room by `deviceId`. Dashboard receives all its devices' telemetry; devices receive only their own commands.

---

## 🗂 Project Structure

```
nyne-pulse/
├── api/                          # NestJS backend
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/                 # JWT + Device token auth, guards, RBAC
│   │   ├── users/
│   │   ├── devices/
│   │   ├── telemetry/
│   │   ├── commands/
│   │   ├── alerts/               # BullMQ queue + Resend + Termii
│   │   ├── firmware/             # OTA file uploads
│   │   ├── gateway/              # Socket.io WebSocket gateway
│   │   ├── cache/                # Raw Redis service (TTL-sensitive keys)
│   │   └── prisma/
│   └── Dockerfile
│
├── dashboard/                    # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing page
│       │   ├── login/
│       │   ├── signup/
│       │   ├── forbidden/        # 403 page
│       │   └── dashboard/
│       │       ├── page.tsx      # Main dashboard (live telemetry)
│       │       ├── devices/
│       │       ├── telemetry/    # Historical charts
│       │       ├── commands/
│       │       ├── alerts/
│       │       └── firmware/
│       ├── store/                # Zustand stores
│       ├── hooks/                # useSocket (WebSocket singleton)
│       └── lib/
│
└── simulate-device.js            # Simulates an IoT device for testing
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker Desktop

### 1. Clone the repo

```bash
git clone https://github.com/goodnessdevs/nyne-pulse.git
cd nyne-pulse
```

### 2. Start infrastructure

```bash
docker compose up -d
```

### 3. Set up the API

```bash
cd api
cp .env.example .env
pnpm install
pnpm migrate
pnpm start:dev
```

API: `http://localhost:3000`
Swagger: `http://localhost:3000/api/docs`

### 4. Set up the Dashboard

```bash
cd ../dashboard
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Dashboard: `http://localhost:3001`

### 5. Simulate a device

1. Sign up at `http://localhost:3001/signup`
2. Go to **Devices** → Add a device → copy the token
3. Paste into `simulate-device.js` and run:

```bash
node simulate-device.js
```

---

## 🔧 Environment Variables

### API (`api/.env`)

```env
DATABASE_URL=postgresql://nynepulse:secret@localhost:5432/nynepulse
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=alerts@yourdomain.com
TERMII_API_KEY=
TERMII_SENDER_ID=NynePulse
UPLOAD_PATH=./uploads
```

### Dashboard (`dashboard/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## 📖 API Reference

Full Swagger docs: [nynepulse.onrender.com/api/docs](https://nynepulse.onrender.com/api/docs)

### Authentication

| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Create a user account |
| `/auth/login` | POST | Login, returns `access_token` |

### Devices

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/devices` | POST | User JWT | Register a new device |
| `/devices` | GET | User JWT | List all user's devices |
| `/devices/:id` | GET | User JWT | Get device + latest telemetry |
| `/devices/:id` | DELETE | User JWT | Delete a device |

### Telemetry

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/telemetry` | POST | Device Token | Publish sensor data |
| `/telemetry/:deviceId/history` | GET | User JWT | Get historical telemetry |

### Commands

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/commands/:deviceId` | POST | User JWT | Send command to device |
| `/commands/:deviceId` | GET | User JWT | Get command history |
| `/commands/:commandId/ack` | PATCH | Device Token | Acknowledge a command |

### Alerts

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/alerts/:deviceId` | GET | User JWT | Get alert history |

### Firmware

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/firmware/upload` | POST | Admin JWT | Upload firmware file |
| `/firmware` | GET | Admin JWT | List all firmware |
| `/firmware/latest?deviceType=` | GET | Device Token | Get latest firmware |
| `/firmware/:id` | DELETE | Admin JWT | Delete firmware |

### WebSocket Events

```js
// Dashboard
socket.emit("join:dashboard", userId);
socket.on("telemetry", ({ deviceId, payload }) => { ... });
socket.on("device:status", ({ deviceId, status }) => { ... });

// Device
socket.emit("join:device", deviceId);
socket.on("command", ({ id, instruction }) => { ... });
```

---

## 🚀 Deployment

| Service | Platform | URL |
|---|---|---|
| API | Render (Docker) | [nynepulse.onrender.com](https://nynepulse.onrender.com) |
| Dashboard | Vercel | [nynepulse.vercel.app](https://nynepulse.vercel.app) |
| Database | Neon (PostgreSQL) | — |
| Cache | Redis | — |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| API framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Docker local / Neon production) |
| Cache + TTL | Redis (`node-redis`) |
| Queue | BullMQ |
| WebSockets | Socket.io |
| File uploads | Multer |
| Email alerts | Resend |
| SMS alerts | Termii |
| Dashboard | Next.js + Tailwind CSS |
| UI components | shadcn/ui |
| State management | Zustand |
| Charts | Recharts |
| Auth | Passport.js (JWT + custom token strategy) |
| Deployment | Docker + Render + Vercel |

---

## 📝 License

MIT — use it, fork it, build on it.

---

<div align="center">
  Built by <a href="https://github.com/goodnessdevs">Geenine</a>
</div>