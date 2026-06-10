<div align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat" />
</div>

<br />

<div align="center">
  <h1>⚡ NynePulse</h1>
  <p><strong>Self-hostable IoT device management API — a lightweight, developer-friendly alternative to AWS IoT Core.</strong></p>
  <p>Connect any device, stream live telemetry, send commands, and fire threshold alerts — all from a clean REST + WebSocket API.</p>
  <br />
  <a href="#-quick-start">Quick Start</a> · <a href="#-api-reference">API Reference</a> · <a href="#-architecture">Architecture</a> · <a href="#-deploy">Deploy</a>
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
- **Swagger docs** — full auto-generated API documentation at `/api/docs`

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
│  Bearer <token>  ───► │ Telemetry────────────────────────►  │
│                       │Commands │ ◄────────────────────────  │
│  WS join:device  ◄──  │ Alerts  │   Live telemetry + cmds   │
│  ← command event      │Firmware │                           │
│                       └────┬────┘                           │
│                            │                                │
│                   ┌────────┼────────┐                       │
│                   ▼        ▼        ▼                       │
│               Postgres   Redis   BullMQ                     │
│               (data)   (TTL/    (alert                      │
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
│   │   └── schema.prisma         # DB schema
│   ├── src/
│   │   ├── auth/                 # JWT + Device token auth, guards, RBAC
│   │   ├── users/                # User management
│   │   ├── devices/              # Device registration + commands
│   │   ├── telemetry/            # Telemetry publish + history
│   │   ├── commands/             # Command send + acknowledge
│   │   ├── alerts/               # BullMQ queue + Resend + Termii
│   │   ├── firmware/             # OTA file uploads
│   │   ├── gateway/              # Socket.io WebSocket gateway
│   │   ├── cache/                # Raw Redis service (TTL-sensitive keys)
│   │   └── prisma/               # PrismaService (global)
│   └── docker-compose.yml
│
├── dashboard/                    # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── login/            # Auth page
│   │   │   └── dashboard/        # Protected pages
│   │   │       ├── page.tsx      # Main dashboard (live telemetry)
│   │   │       ├── devices/      # Device management
│   │   │       ├── telemetry/    # Historical charts
│   │   │       ├── commands/     # Send + track commands
│   │   │       ├── alerts/       # Alert history
│   │   │       └── firmware/     # OTA management
│   │   ├── store/                # Zustand stores
│   │   ├── hooks/                # useSocket (WebSocket singleton)
│   │   └── lib/                  # Axios instance + token injection
│   └── .env.local
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
docker compose up -d   # starts Postgres + Redis
```

### 3. Set up the API

```bash
cd api
cp .env.example .env   # fill in your values
pnpm install
pnpm migrate           # runs prisma migrate dev
pnpm start:dev
```

API runs at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

### 4. Set up the Dashboard

```bash
cd ../dashboard
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Dashboard runs at `http://localhost:3001`

### 5. Register and test

1. Open `http://localhost:3001` → Sign up
2. Go to **Devices** → Add a device → copy the token
3. Paste the token into `simulate-device.js`:

```js
const DEVICE_TOKEN = "your_device_token_here";
```

4. Run the simulator:

```bash
node simulate-device.js
```

5. Watch live telemetry appear on the dashboard.

---

## 🔧 Environment Variables

### API (`api/.env`)

```env
# Database
DATABASE_URL=postgresql://nynepulse:secret@localhost:5432/nynepulse

# Auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Email alerts (https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=alerts@yourdomain.com

# SMS alerts (https://termii.com) — optional
TERMII_API_KEY=
TERMII_SENDER_ID=NynePulse

# File storage
UPLOAD_PATH=./uploads
```

### Dashboard (`dashboard/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## 📡 Simulating a Device

No hardware? No problem. The simulator script mimics a real IoT device publishing telemetry every 3 seconds:

```bash
node simulate-device.js
```

```js
// simulate-device.js
const DEVICE_TOKEN = "your_device_token_here";
const API_URL = "http://localhost:3000";

setInterval(async () => {
  const payload = {
    temp: +(20 + Math.random() * 30).toFixed(1),
    humidity: +(40 + Math.random() * 40).toFixed(1),
    voltage: +(210 + Math.random() * 20).toFixed(1),
  };

  await fetch(`${API_URL}/telemetry`, {
    method: "POST",
    body: JSON.stringify({ payload }),
    headers: {
      Authorization: `Bearer ${DEVICE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  console.log("📡 Published:", payload);
}, 3000);
```

---

## 📖 API Reference

Full Swagger documentation is available at `/api/docs` when the API is running.

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
| `/commands/:commandId/ack` | PATCH | Device Token | Device acknowledges command |

### Alerts

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/alerts/:deviceId` | GET | User JWT | Get alert history for device |

### Firmware

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/firmware/upload` | POST | Admin JWT | Upload firmware file |
| `/firmware` | GET | Admin JWT | List all firmware |
| `/firmware/latest?deviceType=` | GET | Device Token | Get latest firmware for device type |
| `/firmware/:id` | DELETE | Admin JWT | Delete firmware |

### WebSocket Events

Connect to the WebSocket server and join a room:

```js
// Dashboard — receive telemetry for all your devices
socket.emit("join:dashboard", userId);
socket.on("telemetry", ({ deviceId, payload }) => { ... });
socket.on("device:status", ({ deviceId, status }) => { ... });

// Device — receive commands
socket.emit("join:device", deviceId);
socket.on("command", ({ id, instruction }) => { ... });
```

---

## 🚀 Deploy

### API → Railway

1. Push `api/` to a GitHub repo
2. Create a new Railway project → Deploy from GitHub
3. Add environment variables from `.env.example`
4. Add a Redis plugin in Railway
5. Set `REDIS_URL` to the Railway Redis URL

### Dashboard → Vercel

```bash
cd dashboard
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to your Railway API URL.

### Database → Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set `DATABASE_URL` in Railway to the Neon connection string
4. Run `npx prisma migrate deploy`

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

---

## 📝 License

MIT — use it, fork it, build on it.

---

<div align="center">
  Built by <a href="https://github.com/goodnessdevs">GeeNyne</a>
</div>