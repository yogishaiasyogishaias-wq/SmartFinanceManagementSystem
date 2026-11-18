# Smart Finance Management System - Architecture & Technical Specification

## 1. System Overview

The **Smart Finance Management System (SFMS)** is a daily microfinance collection and administrative platform built with an offline-first architecture for Android collection agents and a Next.js administrative oversight web dashboard.

```
                      ┌────────────────────────────────────────┐
                      │        SUPABASE / POSTGRESQL           │
                      │  - Row Level Security (RLS) Enforced   │
                      │  - Atomic PL/pgSQL Payment Functions   │
                      │  - Immutable Audit & Adjustment Logs   │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
     ┌───────────────────────┐                       ┌───────────────────────┐
     │   WEB ADMIN PANEL     │                       │  ANDROID COLLECTION   │
     │   (Next.js App Router)│                       │   (Expo React Native) │
     │ - Disburse Plans      │                       │ - SQLite Local Cache  │
     │ - Real-time Ledger    │                       │ - Durable Outbox Queue│
     │ - Reports & CSV Export│                       │ - Offline Receipts    │
     │ - Overdue Tracking    │                       │ - UUIDv4 Idempotency  │
     └───────────────────────┘                       └───────────────────────┘
```

---

## 2. Integer Paise Accounting Standard

All financial calculations and storage within SFMS utilize **integer paise** ($1\text{ INR} = 100\text{ paise}$). Floating-point data types (`FLOAT`, `DOUBLE`, `REAL`) are strictly prohibited in calculation pipelines to prevent decimal drift.

* **Principal Distributed**: e.g. ₹9,000 = `900000` paise.
* **Daily Installment**: e.g. ₹100 = `10000` paise.
* **Duration**: 100 days.
* **Total Expected Collection**: $100 \times 100 = 10,000\text{ INR} = 1,000,000\text{ paise}$.
* **Expected Gross Profit**: $1,000,000 - 900,000 = 100,000\text{ paise} = ₹1,000$.
* **Remaining Collection**: $\text{Total Expected} - \text{Valid Collections Received}$.
* **Collection Percentage**: $(\text{Valid Collections} / \text{Total Expected}) \times 100$.

### Profit Recognition Models
1. **Conservative / Cost-Recovery Model (Cash Basis)**:
   $$\text{Realized Profit} = \max(0, \text{Valid Collections} - \text{Principal})$$
   Under this model, zero profit is recognized until the entire ₹9,000 principal has been collected.
2. **Proportional Recognition Model (Microfinance Standard)**:
   $$\text{Realized Profit} = \text{round}\left(\text{Valid Collections} \times \frac{\text{Expected Profit}}{\text{Total Expected Collection}}\right)$$
   Under this model, each ₹100 daily collection consists of ₹90 principal recovery and ₹10 gross profit.

---

## 3. Installment Schedule Generator Rule

The generation of daily installment schedules follows an explicit, documented rule:
* $\text{Expected End Date} = \text{Start Date} + \text{Duration Days} - 1\text{ day}$.
* For day $i \in [1, \text{duration\_days}]$:
  $$\text{Scheduled Date}_i = \text{Start Date} + (i - 1)\text{ days}$$
  $$\text{Expected Amount}_i = \text{Daily Collection Amount}$$
* If $(\text{daily\_amount} \times \text{duration\_days}) \neq \text{total\_expected}$, the remainder is allocated to the final installment ($i = \text{duration\_days}$) to ensure the sum of scheduled installments equals the total collection amount.

---

## 4. Offline Synchronization Architecture

When a collection agent records a payment in the field without cellular connectivity:

```
[Agent Records Collection]
           │
           ▼
[Generate UUIDv4 Idempotency Key]
           │
           ▼
[Write to Local SQLite Outbox] ───► [Update Local Cached Installment]
           │                                      │
           ▼                                      ▼
[Display "Pending Sync" Digital Receipt]   [UI Updates Instantly]
           │
           │ (Connectivity Restored)
           ▼
[Sync Engine Dispatches Outbox Item]
           │
           ▼
[PostgreSQL RPC: fn_record_payment_transaction]
   ├── 1. Check Idempotency Key: if duplicate, return existing receipt without double-crediting
   ├── 2. Verify Caller Role & Agent Assignment
   ├── 3. Insert Payment Row (recorded_by = auth.uid())
   ├── 4. Update Installment Paid Amount & Status ('paid' / 'partially_paid')
   ├── 5. Check if Plan Completed (total paid >= total expected)
   └── 6. Write Audit Log
           │
           ▼
[Mobile Receives Server Confirmation] ───► [Prune Outbox & Mark Receipt Confirmed]
```

### Edge Cases Handled
1. **Network Drop / Timeout**: Item remains in local outbox with `retry_count += 1`.
2. **App Crash / Kill**: SQLite database persists outbox queue across application restarts.
3. **Duplicate Retry**: Server-side `idempotency_key UNIQUE` constraint and PL/pgSQL idempotency check guarantee zero duplicate credits.
4. **Device Clock Discrepancies**: The server timestamp (`NOW()`) is the authoritative source for financial accounting; client device clock is only recorded as local capture metadata.

---

## 5. Security & Row Level Security (RLS) Model

1. **Role Separation**:
   * `super_admin`: Full system management, user role assignments, audit log review.
   * `admin`: Customer management, plan disbursement, agent assignment, payment adjustment authorizations.
   * `collection_agent`: Access strictly isolated to assigned customers, active route plans, and self-recorded payments.
2. **PostgreSQL RLS**: Enforced directly on all exposed database tables (`customers`, `finance_plans`, `installments`, `payments`, `audit_logs`).
3. **No Client Role Modification**: Database trigger `trg_prevent_self_role_escalation` aborts any unauthorized attempt by non-super-admins to alter user roles.
4. **No Direct Delete**: Payments can never be deleted from the database. Adjustments and reversals must use `fn_reverse_or_adjust_payment` with mandatory audit justifications.

