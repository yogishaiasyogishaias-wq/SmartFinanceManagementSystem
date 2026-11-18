-- ============================================================================
-- Migration: 00002_functions_and_triggers.sql
-- Description: Business logic functions, triggers, and atomic payment recording
-- ============================================================================

-- 1. Helper function: Get role of currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'collection_agent'::app_role
  );
$$;

-- 2. Prevent users from elevating their own role
CREATE OR REPLACE FUNCTION public.fn_prevent_self_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only super_admin can change roles
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Only super administrators can modify user roles';
        END IF;
    END IF;

    -- Prevent modifying created_at
    NEW.created_at = OLD.created_at;
    NEW.updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_self_role_escalation();

-- 3. Automatic Customer Code Generator (CUST-YYYYMM-XXXX)
CREATE OR REPLACE FUNCTION public.fn_generate_customer_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_prefix TEXT;
    v_seq_num INT;
    v_code TEXT;
BEGIN
    IF NEW.customer_code IS NULL OR TRIM(NEW.customer_code) = '' THEN
        v_prefix := 'CUST-' || TO_CHAR(NOW(), 'YYYYMM') || '-';

        SELECT COALESCE(MAX(SUBSTRING(customer_code FROM LENGTH(v_prefix) + 1)::INT), 0) + 1
        INTO v_seq_num
        FROM public.customers
        WHERE customer_code LIKE v_prefix || '%';

        v_code := v_prefix || LPAD(v_seq_num::TEXT, 4, '0');
        NEW.customer_code := v_code;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_customer_code ON public.customers;
CREATE TRIGGER trg_generate_customer_code
    BEFORE INSERT OR UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_generate_customer_code();

-- 4. Atomic Payment Recording Procedure
-- Handles duplicate prevention, agent authorization, installment progression,
-- plan completion, and audit log in a single transaction.
CREATE OR REPLACE FUNCTION public.fn_record_payment_transaction(
    p_finance_plan_id UUID,
    p_customer_id UUID,
    p_installment_id UUID,
    p_scheduled_date DATE,
    p_expected_amount_paise BIGINT,
    p_amount_paid_paise BIGINT,
    p_payment_method payment_method_enum,
    p_reference_number TEXT,
    p_idempotency_key UUID,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_caller_role app_role;
    v_plan RECORD;
    v_target_installment RECORD;
    v_payment_id UUID;
    v_existing_payment RECORD;
    v_total_collected BIGINT;
    v_new_installment_paid BIGINT;
    v_new_installment_status installment_status;
BEGIN
    -- 1. Idempotency Check: Return existing payment if duplicate key provided
    SELECT * INTO v_existing_payment
    FROM public.payments
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'payment_id', v_existing_payment.id,
            'message', 'Payment already processed with this idempotency key'
        );
    END IF;

    -- 2. Verify Caller
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to record payments';
    END IF;

    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id;

    -- 3. Verify Finance Plan
    SELECT * INTO v_plan
    FROM public.finance_plans
    WHERE id = p_finance_plan_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Finance plan not found: %', p_finance_plan_id;
    END IF;

    IF v_plan.status <> 'active' THEN
        RAISE EXCEPTION 'Cannot record payment for a plan with status: %', v_plan.status;
    END IF;

    -- Agents can only collect on their assigned plans
    IF v_caller_role = 'collection_agent' AND v_plan.assigned_agent_id <> v_caller_id THEN
        RAISE EXCEPTION 'Unauthorized: You are not the assigned agent for this finance plan';
    END IF;

    -- 4. Identify Target Installment
    IF p_installment_id IS NOT NULL THEN
        SELECT * INTO v_target_installment
        FROM public.installments
        WHERE id = p_installment_id AND finance_plan_id = p_finance_plan_id;
    ELSE
        -- Auto-match oldest pending or partially paid installment
        SELECT * INTO v_target_installment
        FROM public.installments
        WHERE finance_plan_id = p_finance_plan_id
          AND status IN ('pending', 'partially_paid', 'missed')
        ORDER BY scheduled_date ASC
        LIMIT 1;
    END IF;

    -- 5. Insert Payment Record
    INSERT INTO public.payments (
        finance_plan_id,
        customer_id,
        agent_id,
        installment_id,
        scheduled_date,
        expected_amount_paise,
        amount_paid_paise,
        payment_method,
        reference_number,
        recorded_at,
        recorded_by,
        idempotency_key,
        sync_status,
        notes
    ) VALUES (
        p_finance_plan_id,
        p_customer_id,
        COALESCE(v_plan.assigned_agent_id, v_caller_id),
        v_target_installment.id,
        COALESCE(p_scheduled_date, v_target_installment.scheduled_date, CURRENT_DATE),
        COALESCE(p_expected_amount_paise, v_target_installment.expected_amount_paise, v_plan.daily_collection_amount_paise),
        p_amount_paid_paise,
        p_payment_method,
        p_reference_number,
        NOW(),
        v_caller_id,
        p_idempotency_key,
        'synced',
        p_notes
    ) RETURNING id INTO v_payment_id;

    -- 6. Update Target Installment
    IF v_target_installment.id IS NOT NULL THEN
        v_new_installment_paid := v_target_installment.paid_amount_paise + p_amount_paid_paise;
        IF v_new_installment_paid >= v_target_installment.expected_amount_paise THEN
            v_new_installment_status := 'paid';
        ELSE
            v_new_installment_status := 'partially_paid';
        END IF;

        UPDATE public.installments
        SET paid_amount_paise = v_new_installment_paid,
            status = v_new_installment_status,
            last_payment_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = v_target_installment.id;
    END IF;

    -- 7. Check if Finance Plan is fully collected
    SELECT COALESCE(SUM(amount_paid_paise), 0) INTO v_total_collected
    FROM public.payments
    WHERE finance_plan_id = p_finance_plan_id
      AND is_reversed = false;

    IF v_total_collected >= v_plan.total_collection_amount_paise THEN
        UPDATE public.finance_plans
        SET status = 'completed',
            updated_at = NOW()
        WHERE id = p_finance_plan_id;
    END IF;

    -- 8. Write Audit Log
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        new_data
    ) VALUES (
        v_caller_id,
        'RECORD_PAYMENT',
        'payments',
        v_payment_id,
        jsonb_build_object(
            'amount_paid_paise', p_amount_paid_paise,
            'finance_plan_id', p_finance_plan_id,
            'installment_id', v_target_installment.id,
            'idempotency_key', p_idempotency_key
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'payment_id', v_payment_id,
        'total_collected_paise', v_total_collected,
        'plan_completed', (v_total_collected >= v_plan.total_collection_amount_paise)
    );
END;
$$;

-- 5. Payment Reversal and Adjustment Function (Admin only)
CREATE OR REPLACE FUNCTION public.fn_reverse_or_adjust_payment(
    p_payment_id UUID,
    p_new_amount_paise BIGINT,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_caller_role app_role;
    v_payment RECORD;
    v_plan RECORD;
    v_installment RECORD;
    v_prev_amount BIGINT;
    v_total_collected BIGINT;
BEGIN
    -- Check admin permission
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF v_caller_role NOT IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can reverse or adjust payments';
    END IF;

    IF TRIM(COALESCE(p_reason, '')) = '' THEN
        RAISE EXCEPTION 'A valid reason is mandatory for adjustments';
    END IF;

    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found: %', p_payment_id;
    END IF;

    v_prev_amount := v_payment.amount_paid_paise;

    -- Record adjustment audit
    INSERT INTO public.payment_adjustments (
        payment_id,
        finance_plan_id,
        previous_amount_paise,
        adjusted_amount_paise,
        reason,
        authorized_by
    ) VALUES (
        p_payment_id,
        v_payment.finance_plan_id,
        v_prev_amount,
        p_new_amount_paise,
        p_reason,
        v_caller_id
    );

    IF p_new_amount_paise = 0 THEN
        -- Full Reversal
        UPDATE public.payments
        SET is_reversed = true,
            reversed_at = NOW(),
            reversed_by = v_caller_id,
            reversal_reason = p_reason
        WHERE id = p_payment_id;
    ELSE
        -- Amount correction
        UPDATE public.payments
        SET amount_paid_paise = p_new_amount_paise
        WHERE id = p_payment_id;
    END IF;

    -- Re-evaluate installment
    IF v_payment.installment_id IS NOT NULL THEN
        SELECT * INTO v_installment FROM public.installments WHERE id = v_payment.installment_id;

        -- Recompute total paid for this installment
        SELECT COALESCE(SUM(amount_paid_paise), 0) INTO v_total_collected
        FROM public.payments
        WHERE installment_id = v_payment.installment_id AND is_reversed = false;

        UPDATE public.installments
        SET paid_amount_paise = v_total_collected,
            status = CASE
                WHEN v_total_collected >= expected_amount_paise THEN 'paid'::installment_status
                WHEN v_total_collected > 0 THEN 'partially_paid'::installment_status
                ELSE 'pending'::installment_status
            END,
            updated_at = NOW()
        WHERE id = v_payment.installment_id;
    END IF;

    -- Re-evaluate plan status
    SELECT COALESCE(SUM(amount_paid_paise), 0) INTO v_total_collected
    FROM public.payments
    WHERE finance_plan_id = v_payment.finance_plan_id AND is_reversed = false;

    SELECT * INTO v_plan FROM public.finance_plans WHERE id = v_payment.finance_plan_id;

    UPDATE public.finance_plans
    SET status = CASE
        WHEN v_total_collected >= v_plan.total_collection_amount_paise THEN 'completed'::plan_status
        ELSE 'active'::plan_status
    END,
    updated_at = NOW()
    WHERE id = v_payment.finance_plan_id;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', p_payment_id,
        'previous_amount_paise', v_prev_amount,
        'new_amount_paise', p_new_amount_paise
    );
END;
$$;

