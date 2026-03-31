# ♿ A11y Monitor v2

Automated WCAG accessibility monitoring — rebuilt with the modern stack.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript 5 (strict) |
| Runtime | Bun |
| UI | React 19, Tailwind CSS v4, shadcn/ui primitives |
| Database | MongoDB via Prisma ORM v6 |
| Email | Resend + React Email |
| Forms | React Hook Form + Zod v4 |
| Server Actions | next-safe-action (type-safe) |
| Data Fetching | TanStack React Query v5 |
| Tables | TanStack React Table v8 |
| Scanner | Playwright + axe-core |
| Testing | Vitest 4 |
| Linting | Biome |

## Quick Start

```bash
# 1. Copy env file
cp .env.example .env.local
# Fill in DATABASE_URL (MongoDB Atlas), RESEND_API_KEY, EMAIL_FROM/TO

# 2. Generate Prisma client
bun run db:generate

# 3. Push schema to MongoDB
bun run db:push

# 4. Start dev server
bun dev
```

Open http://localhost:3000

## Features

- **Dashboard** — Stats, violation severity breakdown, latest scan
- **Sites** — Add sites, auto-discover pages via Playwright crawler, enable/disable
- **Manual Scan** — Scan any URL with real-time status polling (TanStack Query)
- **Scan History** — Sortable/filterable table (TanStack Table), CSV export
- **Scan Detail** — Full violations breakdown with rule docs links
- **Scheduled Scans** — POST `/api/cron/scan` (set up Vercel Cron or any cron)
- **Email Reports** — React Email template sent via Resend on scheduled scans

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `RESEND_API_KEY` | Resend API key for email |
| `EMAIL_FROM` | Sender address |
| `EMAIL_TO` | Recipient for scan reports |
| `ENABLE_EMAIL` | Set to `"true"` to send emails |
| `MAX_CONCURRENT_SCANS` | Max parallel Playwright scans (default: 3) |

## Scripts

```bash
bun dev          # Dev server (Turbopack)
bun build        # Production build
bun start        # Start production
bun lint         # Biome lint
bun format       # Biome format
bun db:push      # Sync schema → MongoDB
bun db:studio    # Prisma Studio GUI
bun test         # Vitest unit tests
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.11. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
