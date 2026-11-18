-- ============================================================================
-- Migration: 00001_initial_schema.sql
-- Description: Core Schema for Smart Finance Management System
-- All currency stored in integer paise (BIGINT)
-- ============================================================================

-- Custom Enums
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'collection_agent');
CREATE TYPE plan_status AS ENUM ('active', 'completed', 'defaulted', 'cancelled');
CREATE TYPE installment_status AS ENUM ('paid', 'partially_paid', 'pending', 'missed', 'waived');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'upi', 'bank_transfer', 'other');
CREATE TYPE sync_status_enum AS ENUM ('pending', 'synced', 'failed', 'conflict');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'collection_agent',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. AGENT PROFILES
CREATE TABLE IF NOT EXISTS public.agent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    employee_code TEXT NOT NULL UNIQUE,
    max_active_plans INT NOT NULL DEFAULT 50 CHECK (max_active_plans > 0),
    area_assigned TEXT NOT NULL,
    daily_target_paise BIGINT NOT NULL DEFAULT 0 CHECK (daily_target_paise >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL CHECK (phone ~ '^[6-9][0-9]{9}$'),
    alternate_phone TEXT CHECK (alternate_phone IS NULL OR alternate_phone ~ '^[6-9][0-9]{9}$'),
    address TEXT NOT NULL,
    shop_name TEXT,
    photo_path TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_code ON public.customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON public.customers(created_by);

-- 4. FINANCE PLANS
CREATE TABLE IF NOT EXISTS public.finance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    principal_amount_paise BIGINT NOT NULL CHECK (principal_amount_paise > 0),
    total_collection_amount_paise BIGINT NOT NULL,
    daily_collection_amount_paise BIGINT NOT NULL CHECK (daily_collection_amount_paise > 0),
    duration_days INT NOT NULL CHECK (duration_days > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    assigned_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status plan_status NOT NULL DEFAULT 'active',
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_total_greater_than_principal CHECK (total_collection_amount_paise > principal_amount_paise),
    CONSTRAINT chk_end_date_valid CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_finance_plans_customer ON public.finance_plans(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_plans_agent ON public.finance_plans(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_finance_plans_status ON public.finance_plans(status);
CREATE INDEX IF NOT EXISTS idx_finance_plans_dates ON public.finance_plans(start_date, end_date);

-- 5. INSTALLMENTS
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finance_plan_id UUID NOT NULL REFERENCES public.finance_plans(id) ON DELETE CASCADE,
    installment_number INT NOT NULL CHECK (installment_number > 0),
    scheduled_date DATE NOT NULL,
    expected_amount_paise BIGINT NOT NULL CHECK (expected_amount_paise > 0),
    paid_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (paid_amount_paise >= 0),
    status installment_status NOT NULL DEFAULT 'pending',
    last_payment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_plan_installment_number UNIQUE (finance_plan_id, installment_number)
);

CREATE INDEX IF NOT EXISTS idx_installments_plan ON public.installments(finance_plan_id);
CREATE INDEX IF NOT EXISTS idx_installments_date ON public.installments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.installments(status);

-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finance_plan_id UUID NOT NULL REFERENCES public.finance_plans(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    installment_id UUID REFERENCES public.installments(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    expected_amount_paise BIGINT NOT NULL,
    amount_paid_paise BIGINT NOT NULL CHECK (amount_paid_paise > 0),
    payment_method payment_method_enum NOT NULL DEFAULT 'cash',
    reference_number TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID NOT NULL REFERENCES public.profiles(id),
    idempotency_key UUID NOT NULL UNIQUE,
    sync_status sync_status_enum NOT NULL DEFAULT 'synced',
    notes TEXT,
    is_reversed BOOLEAN NOT NULL DEFAULT false,
    reversed_at TIMESTAMPTZ,
    reversed_by UUID REFERENCES public.profiles(id),
    reversal_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_plan ON public.payments(finance_plan_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_agent ON public.payments(agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_recorded_at ON public.payments(recorded_at);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON public.payments(idempotency_key);

-- 7. PAYMENT ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.payment_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    finance_plan_id UUID NOT NULL REFERENCES public.finance_plans(id) ON DELETE RESTRICT,
    previous_amount_paise BIGINT NOT NULL,
    adjusted_amount_paise BIGINT NOT NULL CHECK (adjusted_amount_paise >= 0),
    reason TEXT NOT NULL,
    authorized_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SYNC OPERATIONS (Auditing offline-first sync operations)
CREATE TABLE IF NOT EXISTS public.sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id),
    operation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    idempotency_key UUID NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    status TEXT NOT NULL,
    server_processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_ops_agent ON public.sync_operations(agent_id);
CREATE INDEX IF NOT EXISTS idx_sync_ops_idempotency ON public.sync_operations(idempotency_key);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

