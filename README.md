# Smart Finance Management System (SFMS)

A robust, production-oriented Daily Finance Collection Management System architected for microfinance operations, daily collection agents, and administrative financial oversight.

## Monorepo Architecture

```
SmartFinanceManagementSystem/
├── apps/
│   ├── mobile/         # Android Expo React Native offline-first collection app
│   └── web/            # Next.js 15 App Router administrative analytics dashboard
├── packages/
│   ├── shared/         # Domain models, strict integer paise finance calculations, schedule generator
│   └── validation/     # Shared Zod validation schemas across mobile, web, and backend
├── supabase/
│   ├── migrations/     # PostgreSQL DDL, schema, RLS policies, atomic functions, audit triggers
│   └── seed.sql        # Realistic development seed dataset with Super Admin, Admins, Agents, Customers, Plans
├── docs/
│   ├── ARCHITECTURE.md # System architecture, offline-first sync lifecycle & security model
│   └── MANUAL.md       # Operational manual and runbook
├── package.json        # NPM Workspaces monorepo root
├── tsconfig.base.json  # Shared TypeScript configuration
└── .env.example        # Environment variable templates
```

## Core Business Model

Designed specifically for **Daily Collection Microfinance** (not bank loans):
- All currency stored internally in **integer paise** ($1\text{ INR} = 100\text{ paise}$).
- **Principal Distributed**: e.g., ₹9,000 (900,000 paise).
- **Daily Collection**: e.g., ₹100 (10,000 paise) over 100 days.
- **Total Expected Collection**: ₹10,000 (1,000,000 paise).
- **Expected Gross Profit**: ₹10,000 - ₹9,000 = ₹1,000 (100,000 paise).
- **Remaining Collection**: Total Expected - Valid Collections Received.
- **Collection Percentage**: $(\text{Valid Collections} / \text{Total Expected}) \times 100$.
- **Realized Profit**: Proportional revenue recognition and conservative cost-recovery formulas supported.

## Technology Stack

- **Mobile**: React Native, Expo SDK 52, Expo Router v4, TypeScript, Expo SQLite, React Native Paper, React Hook Form, Zod.
- **Web**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend & Database**: Supabase, PostgreSQL 15+, Row Level Security (RLS), atomic PL/pgSQL transaction functions, audit triggers.
- **Offline Engine**: SQLite durable local outbox, UUIDv4 idempotency keys, exponential retry backoff, deterministic conflict detection.
