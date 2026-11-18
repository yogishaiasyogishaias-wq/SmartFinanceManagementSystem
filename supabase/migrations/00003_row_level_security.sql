-- ============================================================================
-- Migration: 00003_row_level_security.sql
-- Description: Comprehensive Row Level Security (RLS) policies
-- Enforces role-based isolation at the PostgreSQL storage layer
-- ============================================================================

-- Enable RLS on all domain tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.current_user_role() IN ('super_admin', 'admin') OR id = auth.uid());

DROP POLICY IF EXISTS "Super admins can insert/update profiles" ON public.profiles;
CREATE POLICY "Super admins can insert/update profiles"
    ON public.profiles FOR ALL
    USING (public.current_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Admins can update agent profiles" ON public.profiles;
CREATE POLICY "Admins can update agent profiles"
    ON public.profiles FOR UPDATE
    USING (public.current_user_role() = 'admin' AND role = 'collection_agent');

-- ----------------------------------------------------------------------------
-- AGENT PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins and agents view agent info" ON public.agent_profiles;
CREATE POLICY "Admins and agents view agent info"
    ON public.agent_profiles FOR SELECT
    USING (public.current_user_role() IN ('super_admin', 'admin') OR profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage agent profiles" ON public.agent_profiles;
CREATE POLICY "Admins manage agent profiles"
    ON public.agent_profiles FOR ALL
    USING (public.current_user_role() IN ('super_admin', 'admin'));

-- ----------------------------------------------------------------------------
-- CUSTOMERS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;
CREATE POLICY "Admins can manage all customers"
    ON public.customers FOR ALL
    USING (public.current_user_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Agents view assigned customers" ON public.customers;
CREATE POLICY "Agents view assigned customers"
    ON public.customers FOR SELECT
    USING (
        public.current_user_role() = 'collection_agent' AND
        id IN (
            SELECT customer_id FROM public.finance_plans
            WHERE assigned_agent_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Agents can insert new customer leads" ON public.customers;
CREATE POLICY "Agents can insert new customer leads"
    ON public.customers FOR INSERT
    WITH CHECK (
        public.current_user_role() = 'collection_agent' AND
        created_by = auth.uid()
    );

-- ----------------------------------------------------------------------------
-- FINANCE PLANS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage all finance plans" ON public.finance_plans;
CREATE POLICY "Admins can manage all finance plans"
    ON public.finance_plans FOR ALL
    USING (public.current_user_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Agents view assigned finance plans" ON public.finance_plans;
CREATE POLICY "Agents view assigned finance plans"
    ON public.finance_plans FOR SELECT
    USING (
        public.current_user_role() = 'collection_agent' AND
        assigned_agent_id = auth.uid()
    );

-- ----------------------------------------------------------------------------
-- INSTALLMENTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage all installments" ON public.installments;
CREATE POLICY "Admins can manage all installments"
    ON public.installments FOR ALL
    USING (public.current_user_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Agents view installments of assigned plans" ON public.installments;
CREATE POLICY "Agents view installments of assigned plans"
    ON public.installments FOR SELECT
    USING (
        public.current_user_role() = 'collection_agent' AND
        finance_plan_id IN (
            SELECT id FROM public.finance_plans
            WHERE assigned_agent_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- PAYMENTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view and manage all payments" ON public.payments;
CREATE POLICY "Admins can view and manage all payments"
    ON public.payments FOR ALL
    USING (public.current_user_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Agents view their own recorded payments" ON public.payments;
CREATE POLICY "Agents view their own recorded payments"
    ON public.payments FOR SELECT
    USING (
        public.current_user_role() = 'collection_agent' AND
        agent_id = auth.uid()
    );

DROP POLICY IF EXISTS "Agents insert collections" ON public.payments;
CREATE POLICY "Agents insert collections"
    ON public.payments FOR INSERT
    WITH CHECK (
        public.current_user_role() = 'collection_agent' AND
        agent_id = auth.uid() AND
        recorded_by = auth.uid()
    );

-- Agents CANNOT update or delete payments directly (must use reversal function)

-- ----------------------------------------------------------------------------
-- PAYMENT ADJUSTMENTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view adjustments" ON public.payment_adjustments;
CREATE POLICY "Admins can view adjustments"
    ON public.payment_adjustments FOR SELECT
    USING (public.current_user_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admins can create adjustments" ON public.payment_adjustments;
CREATE POLICY "Admins can create adjustments"
    ON public.payment_adjustments FOR INSERT
    WITH CHECK (public.current_user_role() IN ('super_admin', 'admin'));

-- ----------------------------------------------------------------------------
-- SYNC OPERATIONS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Agents view and insert own sync operations" ON public.sync_operations;
CREATE POLICY "Agents view and insert own sync operations"
    ON public.sync_operations FOR ALL
    USING (agent_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'admin'))
    WITH CHECK (agent_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'admin'));

-- ----------------------------------------------------------------------------
-- AUDIT LOGS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.current_user_role() IN ('super_admin', 'admin'));

