# crontab.sh

A cloud-native cron job scheduler with AI-powered natural language scheduling. Schedule HTTP pings, manage triggers, and inspect execution logs — all from a clean web dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Bun](https://bun.sh) |
| **Backend** | Express, TypeScript |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT (jsonwebtoken) |
| **AI** | OpenRouter API |
| **Scheduling** | `Bun.cron()` (native in-process) |

## Features

- **AI Cron Parser** — Describe schedules in plain English; the OpenRouter-powered API converts your prompt into a valid 5-field cron expression.
- **CRUD Job Management** — Create, update, pause/resume, and delete cron jobs through the dashboard or REST API.
- **Execution Telemetry** — Every run captures exit code, stdout/stderr, and latency. Inspect logs per job or globally.
- **Crash Recovery** — On server restart, the singleton scheduler automatically reloads all active jobs from MongoDB.
- **Multi-Tenant Isolation** — Every job is scoped to its owning user. Passwords hashed with Argon2id.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- MongoDB instance (local or Atlas)
- OpenRouter API key (optional, for AI cron generation)

### 1. Clone and install

```bash
git clone https://github.com/raghavdwd/crontab.git
cd crontab

# Install server dependencies
cd server && bun install

# Install client dependencies
cd ../client && bun install
```

### 2. Configure environment

Copy the template in `server/` and set your values:

```bash
cd ../server
cp .env.example .env   # or edit .env directly
```

Required variables:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=<your-secret>
DB_URI=mongodb://localhost:27017/crontab
OPENROUTER_API_KEY=<your-key>        # optional
```

### 3. Run

```bash
# Terminal 1 — Server
cd server && bun run dev

# Terminal 2 — Client
cd client && bun run dev
```

The client dev server runs at `http://localhost:5173`, the API at `http://localhost:3000`.

## Project Structure

```
crontab/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components (shadcn)
│   │   ├── contexts/        # Auth context / state
│   │   ├── pages/           # Landing, Login, Signup, Dashboard, CreateJob, Profile
│   │   ├── lib/             # Utilities (axios instance, etc.)
│   │   └── assets/          # Static assets
│   └── ...
├── server/                  # Express API (Bun)
│   ├── src/
│   │   ├── configs/         # DB connection, env, app config
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth middleware
│   │   ├── models/          # Mongoose schemas (User, CronJob, CronLog, AI)
│   │   ├── routes/          # Express routers (auth, cron, ai)
│   │   ├── services/        # Business logic (auth, scheduler, AI)
│   │   └── utils/           # Helpers
│   ├── index.ts             # Server entry point
│   └── ...
├── api_docs.md              # Full API reference
└── README.md
```

## API Overview

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Login, receive JWT |
| GET | `/auth/me` | Bearer | Current user info |
| GET | `/cron` | Bearer | List user's cron jobs |
| POST | `/cron` | Bearer | Create a new cron job |
| PUT | `/cron/:id` | Bearer | Update a cron job |
| DELETE | `/cron/:id` | Bearer | Delete a cron job |
| GET | `/cron/logs` | Bearer | Execution logs |
| POST | `/ai/generate-cron` | Bearer | AI: natural language → cron expression |

See [api_docs.md](./api_docs.md) for full request/response schemas.

## Scheduling Engine

Jobs are scheduled in-process using `Bun.cron()`. Each trigger spawns an isolated shell subprocess (`Bun.spawn`) that executes the configured command. The result (exit code, stdout, stderr, duration) is persisted to the `CronLog` collection for later inspection.
