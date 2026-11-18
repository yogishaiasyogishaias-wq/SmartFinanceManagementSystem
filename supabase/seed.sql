-- ============================================================================
-- Supabase Development Seed Dataset
-- Smart Finance Management System
-- All amounts in integer paise (1 INR = 100 paise)
-- ============================================================================

-- Disable triggers during seed insertion if needed
SET session_replication_role = 'replica';

-- 1. SEED PROFILES
-- Passwords in development can be set via Supabase Auth UI or GoTrue CLI
INSERT INTO public.profiles (id, email, full_name, phone, role, is_active, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'superadmin@smartfinance.com', 'Suresh Balakrishnan', '9840112233', 'super_admin', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', 'admin1@smartfinance.com', 'Kavitha Sundaram', '9840223344', 'admin', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000003', 'agent.kumar@smartfinance.com', 'Kumar Velu', '9840334455', 'collection_agent', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000004', 'agent.priya@smartfinance.com', 'Priya Mani', '9840445566', 'collection_agent', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000005', 'agent.rajesh@smartfinance.com', 'Rajesh Natarajan', '9840556677', 'collection_agent', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 2. SEED AGENT PROFILES
INSERT INTO public.agent_profiles (id, profile_id, employee_code, max_active_plans, area_assigned, daily_target_paise)
VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'AGT-001', 60, 'Central Market & Bazaar Road', 500000),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'AGT-002', 50, 'North Commercial Street', 450000),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'AGT-003', 50, 'South Industrial Estate', 400000)
ON CONFLICT (profile_id) DO NOTHING;

-- 3. SEED CUSTOMERS
INSERT INTO public.customers (id, customer_code, full_name, phone, alternate_phone, address, shop_name, created_by, is_active)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'CUST-202611-0001', 'Murugan Chettiar', '9876500001', '9876500091', 'Shop 14, Central Vegetable Market', 'Murugan Veggies', '00000000-0000-0000-0000-000000000002', true),
    ('20000000-0000-0000-0000-000000000002', 'CUST-202611-0002', 'Anandhi Selvam', '9876500002', NULL, '45 Flower Bazaar Road', 'Meenakshi Flower Mart', '00000000-0000-0000-0000-000000000002', true),
    ('20000000-0000-0000-0000-000000000003', 'CUST-202611-0003', 'Dhanapal Nadar', '9876500003', '9876500093', '78 Main Road, Market Area', 'Dhanapal Provisions', '00000000-0000-0000-0000-000000000002', true),
    ('20000000-0000-0000-0000-000000000004', 'CUST-202611-0004', 'Selvam Arumugam', '9876500004', NULL, '102 Car Street', 'Sri Selvam Tea Stall', '00000000-0000-0000-0000-000000000003', true),
    ('20000000-0000-0000-0000-000000000005', 'CUST-202611-0005', 'Fatima Begum', '9876500005', '9876500095', '22 Weaver Colony, North', 'Star Tailors & Textiles', '00000000-0000-0000-0000-000000000004', true),
    ('20000000-0000-0000-0000-000000000006', 'CUST-202611-0006', 'Karthik Raja', '9876500006', NULL, 'Shop 5, Bus Stand Complex', 'Karthik Electrical Works', '00000000-0000-0000-0000-000000000005', true),
    ('20000000-0000-0000-0000-000000000007', 'CUST-202611-0007', 'Muthu Krishnan', '9876500007', NULL, '33 South Agraharam', 'Muthu Stationery & Xerox', '00000000-0000-0000-0000-000000000003', true),
    ('20000000-0000-0000-0000-000000000008', 'CUST-202611-0008', 'Lakshmi Narayanan', '9876500008', '9876500098', '19 Fish Market Lane', 'Ocean Fresh Seafoods', '00000000-0000-0000-0000-000000000003', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED FINANCE PLANS
-- Plan 1: Standard ₹9,000 principal / ₹10,000 total / 100 days @ ₹100/day
INSERT INTO public.finance_plans (
    id, customer_id, principal_amount_paise, total_collection_amount_paise,
    daily_collection_amount_paise, duration_days, start_date, end_date,
    assigned_agent_id, status, created_by
) VALUES
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 900000, 1000000, 10000, 100, '2026-10-01', '2027-01-08', '00000000-0000-0000-0000-000000000003', 'active', '00000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 1800000, 2000000, 20000, 100, '2026-10-01', '2027-01-08', '00000000-0000-0000-0000-000000000003', 'active', '00000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 4500000, 5000000, 50000, 100, '2026-09-01', '2026-12-09', '00000000-0000-0000-0000-000000000003', 'active', '00000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 900000, 1000000, 10000, 100, '2026-10-15', '2027-01-22', '00000000-0000-0000-0000-000000000003', 'active', '00000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 1800000, 2000000, 20000, 100, '2026-10-10', '2027-01-17', '00000000-0000-0000-0000-000000000004', 'active', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED INITIAL INSTALLMENTS FOR PLAN 1 (First 5 days)
INSERT INTO public.installments (id, finance_plan_id, installment_number, scheduled_date, expected_amount_paise, paid_amount_paise, status)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, '2026-10-01', 10000, 10000, 'paid'),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 2, '2026-10-02', 10000, 10000, 'paid'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 3, '2026-10-03', 10000, 5000, 'partially_paid'),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 4, '2026-10-04', 10000, 0, 'missed'),
    ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 5, '2026-10-05', 10000, 0, 'pending')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED SAMPLE PAYMENTS
INSERT INTO public.payments (
    id, finance_plan_id, customer_id, agent_id, installment_id,
    scheduled_date, expected_amount_paise, amount_paid_paise, payment_method,
    reference_number, recorded_at, recorded_by, idempotency_key, sync_status
) VALUES
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '2026-10-01', 10000, 10000, 'cash', NULL, '2026-10-01 10:30:00+05:30', '00000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000001', 'synced'),
    ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '2026-10-02', 10000, 10000, 'upi', 'UPI-REF-98371982', '2026-10-02 11:15:00+05:30', '00000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000002', 'synced'),
    ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '2026-10-03', 10000, 5000, 'cash', NULL, '2026-10-03 12:00:00+05:30', '00000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000003', 'synced')
ON CONFLICT (id) DO NOTHING;

RESET session_replication_role;

