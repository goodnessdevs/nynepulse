# NynePulse — IoT Device Management API

> A self-hostable, developer-friendly IoT gateway. Devices authenticate, publish telemetry, and receive commands. Developers consume a clean REST + WebSocket API.

---

## 📁 Project Structure

```
nynepulse/
├── apps/
│   ├── api/                          ← NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── device-token.strategy.ts
│   │   │   │   └── guards/
│   │   │   │       ├── jwt-auth.guard.ts
│   │   │   │       ├── device-auth.guard.ts
│   │   │   │       └── roles.guard.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   └── users.service.ts
│   │   │   │
│   │   │   ├── devices/
│   │   │   │   ├── devices.module.ts
│   │   │   │   ├── devices.controller.ts
│   │   │   │   ├── devices.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── register-device.dto.ts
│   │   │   │       └── send-command.dto.ts
│   │   │   │
│   │   │   ├── telemetry/
│   │   │   │   ├── telemetry.module.ts
│   │   │   │   ├── telemetry.controller.ts
│   │   │   │   ├── telemetry.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── publish-telemetry.dto.ts
│   │   │   │
│   │   │   ├── commands/
│   │   │   │   ├── commands.module.ts
│   │   │   │   ├── commands.controller.ts
│   │   │   │   └── commands.service.ts
│   │   │   │
│   │   │   ├── alerts/
│   │   │   │   ├── alerts.module.ts
│   │   │   │   ├── alerts.service.ts        ← SMS via Termii/Twilio
│   │   │   │   └── alerts.processor.ts      ← BullMQ worker
│   │   │   │
│   │   │   ├── gateway/
│   │   │   │   └── events.gateway.ts        ← WebSocket gateway
│   │   │   │
│   │   │   ├── firmware/
│   │   │   │   ├── firmware.module.ts
│   │   │   │   ├── firmware.controller.ts   ← OTA file uploads
│   │   │   │   └── firmware.service.ts
│   │   │   │
│   │   │   └── common/
│   │   │       ├── filters/
│   │   │       │   └── http-exception.filter.ts
│   │   │       └── interceptors/
│   │   │           └── transform.interceptor.ts
│   │   │
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── dashboard/                    ← Next.js frontend (1 page)
│       ├── app/
│       │   └── page.tsx              ← Single dashboard page
│       ├── components/
│       │   ├── DeviceList.tsx
│       │   ├── TelemetryFeed.tsx
│       │   └── CommandPanel.tsx
│       └── lib/
│           └── socket.ts             ← WebSocket client
│
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  IDLE
}

enum CommandStatus {
  PENDING
  DELIVERED
  ACKNOWLEDGED
  FAILED
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())

  devices      Device[]
}

model Device {
  id          String       @id @default(cuid())
  name        String
  type        String       // e.g. "temperature_sensor", "relay_switch"
  token       String       @unique  // device authenticates with this
  status      DeviceStatus @default(OFFLINE)
  lastSeenAt  DateTime?
  metadata    Json?        // e.g. { "location": "Room A", "firmware": "1.0.2" }
  userId      String
  createdAt   DateTime     @default(now())

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  telemetry   Telemetry[]
  commands    Command[]
  alerts      Alert[]

  @@index([userId])
  @@index([status])
}

model Telemetry {
  id        String   @id @default(cuid())
  deviceId  String
  payload   Json     // e.g. { "temp": 36.5, "humidity": 78 }
  createdAt DateTime @default(now())

  device    Device   @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  @@index([deviceId])
  @@index([createdAt])
}

model Command {
  id          String        @id @default(cuid())
  deviceId    String
  instruction String        // e.g. "TURN_OFF", "SET_TEMP:22"
  status      CommandStatus @default(PENDING)
  sentAt      DateTime      @default(now())
  ackedAt     DateTime?

  device      Device        @relation(fields: [deviceId], references: [id], onDelete: Cascade)

  @@index([deviceId])
}

model Alert {
  id        String   @id @default(cuid())
  deviceId  String
  message   String
  sentAt    DateTime @default(now())

  device    Device   @relation(fields: [deviceId], references: [id])
}

model Firmware {
  id          String   @id @default(cuid())
  version     String
  deviceType  String   // firmware targets a device type
  fileUrl     String
  uploadedAt  DateTime @default(now())
}
```

---

## 🧩 Module Breakdown

### `AuthModule`
Two auth strategies run in parallel:

**User auth** (JWT) — for dashboard users
```
POST /auth/register
POST /auth/login  → returns access_token
```

**Device auth** (Token) — for IoT devices
```
// Device sends its token in every request header
Authorization: Bearer <device_token>
```

Devices get their token when registered via the dashboard. They never use passwords.

---

### `DevicesModule`

| Endpoint | Auth | Description |
|---|---|---|
| `POST /devices` | User JWT | Register a new device |
| `GET /devices` | User JWT | List all user's devices |
| `GET /devices/:id` | User JWT | Get device + latest telemetry (Redis cached) |
| `DELETE /devices/:id` | User JWT | Remove device |
| `POST /devices/:id/commands` | User JWT | Send command to device |
| `PATCH /devices/:id/ack` | Device Token | Device acknowledges a command |

**Registering a device flow:**
1. User calls `POST /devices` with `{ name, type }`
2. Server generates a unique `token` (UUID or crypto random)
3. Returns token **once** — user copies it into their device firmware
4. Device uses this token for all future requests

---

### `TelemetryModule`
The hottest endpoint — devices call this constantly.

```
POST /telemetry  ← Device Token auth
Body: { "temp": 36.5, "humidity": 78 }
```

**Flow:**
1. Validate device token → get `deviceId`
2. Save telemetry to DB
3. Update device `status: ONLINE`, `lastSeenAt: now()` in Redis
4. Emit WebSocket event → dashboard updates in real-time
5. Check alert thresholds → if breached, push job to BullMQ

```ts
// telemetry.service.ts
async publish(deviceId: string, payload: Record<string, any>) {
  await this.prisma.telemetry.create({ data: { deviceId, payload } });
  await this.cacheManager.set(`device:${deviceId}:latest`, payload, 60);
  this.eventsGateway.emitTelemetry(deviceId, payload);
  await this.checkAlertThresholds(deviceId, payload);
}
```

---

### `CommandsModule`
Users send commands to devices through the dashboard.

**Flow:**
1. User sends `POST /devices/:id/commands` with `{ instruction: "TURN_OFF" }`
2. Command saved to DB with `status: PENDING`
3. Emitted via WebSocket to the device's room
4. Device receives it, acts on it, calls `PATCH /devices/:id/ack`
5. Command updates to `ACKNOWLEDGED`

```ts
// events.gateway.ts
emitCommand(deviceId: string, command: Command) {
  this.server.to(`device:${deviceId}`).emit('command', command);
}
```

---

### `GatewayModule` (WebSockets)
Two types of rooms:

```ts
@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  // Dashboard joins user room → receives all their devices' telemetry
  @SubscribeMessage('join:dashboard')
  handleDashboardJoin(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }

  // Device joins its own room → receives commands
  @SubscribeMessage('join:device')
  handleDeviceJoin(client: Socket, deviceId: string) {
    client.join(`device:${deviceId}`);
  }

  emitTelemetry(deviceId: string, payload: any) {
    this.server.to(`device:${deviceId}`).emit('telemetry', payload);
  }

  emitDeviceStatus(deviceId: string, status: DeviceStatus) {
    this.server.emit(`device:${deviceId}:status`, status);
  }
}
```

---

### `AlertsModule`
Threshold-based SMS alerts via Termii (Nigerian SMS gateway) or Twilio.

```ts
// alerts.processor.ts  — BullMQ worker
@Process('send-alert')
async handleAlert(job: Job<{ deviceId: string; message: string }>) {
  const device = await this.prisma.device.findUnique({
    where: { id: job.data.deviceId },
    include: { user: true }
  });
  await this.termiiService.sendSms(device.user.phone, job.data.message);
  await this.prisma.alert.create({ data: { deviceId, message } });
}
```

Example trigger: temp > 50°C → SMS "Device [name] is overheating"

---

### `FirmwareModule` (File Uploads)
OTA (Over-The-Air) update support — devices can poll for new firmware.

```
POST /firmware          ← Admin only, uploads .bin file
GET  /firmware/latest?deviceType=esp32   ← Device polls this
```

---

### `CacheModule` (Redis)

| Key | Value | TTL |
|---|---|---|
| `device:{id}:status` | `ONLINE/OFFLINE` | 30s (auto-expires = device appears offline) |
| `device:{id}:latest` | Latest telemetry payload | 60s |
| `devices:user:{userId}` | Device list | 120s |

The status TTL trick is elegant: devices must publish telemetry every 30s or they automatically go `OFFLINE` — no polling needed.

---

## 📊 Dashboard (One Page — Keep It Dead Simple)

**Philosophy:** A visitor should understand everything in under 5 seconds.

**Layout — 3 sections only:**

```
┌─────────────────────────────────────────┐
│  NynePulse          [2 Online] [1 Idle] │  ← Header: counts only
├──────────────┬──────────────────────────┤
│              │                          │
│ Device List  │   Live Telemetry Feed    │  ← Click device → see its data
│              │                          │
│ ● Sensor-01  │  temp: 36.5°C  ↑        │
│ ● Sensor-02  │  humidity: 78% →        │
│ ○ Relay-01   │  voltage: 220V ✓        │
│              │                          │
├──────────────┴──────────────────────────┤
│  Send Command: [TURN_OFF ▾] [Send]      │  ← Command panel
└─────────────────────────────────────────┘
```

**Rules for the dashboard:**
- No charts (keeps it simple, no chart library needed)
- Green dot = Online, Grey = Offline — color does all the work
- Telemetry values update in-place (no page refresh, WebSocket driven)
- One font, two colors max, dark theme

---

## 🐳 Docker Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    env_file: ./apps/api/.env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: nynepulse
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: nynepulse
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

---

## 🌍 Environment Variables

```env
# .env.example
DATABASE_URL=postgresql://nynepulse:secret@localhost:5432/nynepulse
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d

REDIS_HOST=localhost
REDIS_PORT=6379

TERMII_API_KEY=            # SMS alerts (Nigerian gateway)
TERMII_SENDER_ID=NynePulse

STORAGE_PATH=./uploads     # Local firmware file storage
```

---

## 📦 Key Dependencies

```bash
# Core
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt
npm install @nestjs/throttler
npm install @nestjs/cache-manager cache-manager

# Redis
npm install cache-manager-ioredis-yet ioredis

# Queue
npm install @nestjs/bull bull

# WebSockets
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# File uploads
npm install multer @types/multer

# DB
npm install @prisma/client prisma
npm install bcrypt @types/bcrypt

# Docs
npm install @nestjs/swagger
```

---

## 📋 1–2 Week Plan

### Week 1 — Core API
- [ ] NestJS init + Prisma schema + Docker Compose
- [ ] `AuthModule` — User JWT + Device Token strategies
- [ ] `DevicesModule` — Register, list, delete devices
- [ ] `TelemetryModule` — Devices publish data
- [ ] `GatewayModule` — WebSocket rooms
- [ ] Redis caching (device status TTL trick)
- [ ] Swagger setup

### Week 2 — Polish & Frontend
- [ ] `CommandsModule` — Send + acknowledge commands
- [ ] `AlertsModule` — BullMQ + Termii SMS
- [ ] `FirmwareModule` — OTA file uploads
- [ ] Rate limiting per device
- [ ] Next.js dashboard (1 day max)
- [ ] Seed script with simulated device data
- [ ] README + Wokwi demo GIF
- [ ] Deploy to Railway (free tier)

---

## 🎯 What This Demonstrates

| Skill | Where it shows |
|---|---|
| NestJS architecture | Modular design, multiple auth strategies |
| Dual auth (JWT + Token) | User vs Device auth is genuinely advanced |
| WebSockets | Real-time telemetry + command delivery |
| Redis TTL trick | Devices go offline automatically — elegant |
| Queue + Workers | BullMQ alert processing |
| File uploads | OTA firmware delivery |
| External API | Termii SMS integration |
| DB design | Relational schema with telemetry indexing |
| Rate limiting | Per-device throttling |
| Docker | Multi-service Compose setup |

---

## 🧪 Testing Without Hardware

```bash
# Install MQTTX CLI
npm install -g mqttx

# Simulate a temperature sensor publishing every 3 seconds
curl -X POST http://localhost:3000/telemetry \
  -H "Authorization: Bearer <device_token>" \
  -H "Content-Type: application/json" \
  -d '{"temp": 36.5, "humidity": 78}' \
  --repeat 3000  # or write a simple loop script

# Or use this Node.js simulator script
node simulate-device.js
```

```js
// simulate-device.js
const axios = require('axios');

const DEVICE_TOKEN = 'your_device_token_here';
const API_URL = 'http://localhost:3000';

setInterval(async () => {
  const payload = {
    temp: (20 + Math.random() * 20).toFixed(1),
    humidity: (40 + Math.random() * 40).toFixed(1),
    voltage: (210 + Math.random() * 20).toFixed(1),
  };

  await axios.post(`${API_URL}/telemetry`, payload, {
    headers: { Authorization: `Bearer ${DEVICE_TOKEN}` }
  });

  console.log('Published:', payload);
}, 3000);
```

Run this script → your dashboard lights up with live data. Perfect for demos and README GIFs.