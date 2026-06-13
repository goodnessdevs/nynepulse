# NynePulse - IoT Device Management Platform

NynePulse is a self-hostable, developer-friendly IoT gateway. It allows devices to authenticate, publish telemetry, and receive commands via a clean REST + WebSocket API, while providing a modern dashboard for real-time monitoring and management.

## 🏗 Architecture & Core Concepts

- **Backend (API):** Built with NestJS, using Prisma for PostgreSQL and Redis for real-time caching and state management.
- **Frontend (Dashboard):** A Next.js 15+ application using the App Router, Tailwind CSS, and shadcn/ui.
- **Real-time Communication:** Powered by Socket.io. Devices join specific rooms to receive commands, and the dashboard joins user rooms to receive telemetry from all owned devices.
- **Redis TTL Trick:** Device "ONLINE" status is managed via Redis keys with a 30s TTL. Devices must publish telemetry every 30s to stay online, avoiding the need for heavy polling or cron jobs.
- **Asynchronous Alerts:** BullMQ handles threshold alerts (Email via Resend, SMS via Termii) out-of-band to keep the telemetry ingestion path fast.
- **Dual Authentication:**
    - **Users:** Standard JWT-based authentication.
    - **Devices:** Static Bearer tokens generated upon registration.

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Language** | TypeScript |
| **Backend** | NestJS, Passport.js, Socket.io, BullMQ |
| **Database** | PostgreSQL (Prisma ORM) |
| **Caching/Queue** | Redis |
| **Frontend** | Next.js, Tailwind CSS, Lucide, Zustand, Recharts |
| **UI Components** | shadcn/ui (Radix UI) |
| **Infrastructure** | Docker, Docker Compose |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (pnpm recommended)
- Docker Desktop (for Postgres and Redis)

### Infrastructure
```bash
# Start Postgres and Redis
docker compose up -d
```

### API (`/api`)
```bash
cd api
pnpm install
# Setup .env (copy from .env.example)
pnpm migrate       # Prisma migrations
pnpm generate      # Generate Prisma client
pnpm start:dev     # Start in watch mode
```
- **Swagger Docs:** `http://localhost:3000/api/docs`

### Dashboard (`/dashboard`)
```bash
cd dashboard
pnpm install
# Setup .env.local (copy from .env.local.example)
pnpm dev
```
- **URL:** `http://localhost:3001`

### Device Simulation
```bash
# Test the system without hardware
node simulate-device.js
```

## 📂 Project Structure

- `api/`: NestJS backend.
    - `src/alerts/`: BullMQ processor and notification services (Resend/Termii).
    - `src/auth/`: JWT and Device Token strategies.
    - `src/gateway/`: Socket.io events gateway.
    - `src/telemetry/`: Telemetry ingestion and history.
    - `prisma/`: Database schema and migrations.
- `dashboard/`: Next.js frontend.
    - `app/dashboard/`: Protected dashboard routes.
    - `components/ui/`: shadcn/ui components.
    - `store/`: Zustand state management.
    - `hooks/use-socket.ts`: WebSocket client singleton.
- `simulate-device.js`: A script to mimic a real IoT device for testing.

## 🛠 Development Conventions

- **Monorepo-ish:** The project consists of two main applications (`api` and `dashboard`) in the root.
- **Type Safety:** Use Prisma-generated types for database entities.
- **Real-time Events:** All telemetry updates should be emitted via the `EventsGateway` in the API.
- **Error Handling:** Use the global `HttpExceptionFilter` in the API for consistent error responses.
- **Styles:** Use Tailwind CSS for all dashboard styling. Prefer Vanilla CSS for custom components if needed.

## 🧪 Testing

- **Unit Tests:** Run `pnpm test` in the `api` directory.
- **E2E Tests:** Run `pnpm test:e2e` in the `api` directory.
- **Manual Verification:** Use `simulate-device.js` to verify real-time telemetry flow to the dashboard.
