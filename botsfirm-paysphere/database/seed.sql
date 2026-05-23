-- =====================================================================
-- Botsfirm PaySphere — Development seed data
-- =====================================================================
-- DO NOT RUN IN PRODUCTION.
--
-- Seeds:
--   * 1 Super Admin (superadmin@botsfirmpaysphere.com / SuperAdmin@123)
--   * 2 Tenants (Kgabo Construction, Petra Holdings)
--   * Per tenant: 1 client user, 1 admin user, 3 employees
--   * Botswana-compliant leave types per tenant
--   * Sample allowance templates per tenant
--   * Sample leave balances for each employee for the current year
--   * Compliance calendar entries for current month
--
-- Password hashes here are bcrypt of the literal passwords noted in
-- comments. Rotate before deploying anywhere reachable.
--
-- Run AFTER schema.sql and rls-policies.sql. Because RLS is enabled,
-- run this file as a Postgres superuser (Supabase service role) so it
-- bypasses RLS.
-- =====================================================================

BEGIN;

-- =====================================================================
-- SUPER ADMIN
-- =====================================================================
-- Plaintext password: SuperAdmin@123
-- bcrypt cost-10 hash (replace with freshly generated hash in real envs).
INSERT INTO super_admins (id, email, full_name, password_hash, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'superadmin@botsfirmpaysphere.com',
    'Platform Super Admin',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- TENANTS
-- =====================================================================
-- Tenant 1: Kgabo Construction
INSERT INTO tenants (
    id, company_name, registration_number, burs_number, hrdc_number,
    address, city, country, phone, email,
    plan, max_employees,
    subscription_start, subscription_end,
    status
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Kgabo Construction (Pty) Ltd',
    'BW00001234567',
    'BURS-KGB-2024-001',
    'HRDC-KGB-2024-001',
    'Plot 5421, Gaborone West Industrial',
    'Gaborone',
    'Botswana',
    '+267 71 234 567',
    'admin@kgaboconstruction.co.bw',
    'growth',
    25,
    NOW() - INTERVAL '60 days',
    NOW() + INTERVAL '305 days',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Tenant 2: Petra Holdings
INSERT INTO tenants (
    id, company_name, registration_number, burs_number, hrdc_number,
    address, city, country, phone, email,
    plan, max_employees,
    subscription_start, subscription_end,
    status
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Petra Holdings (Pty) Ltd',
    'BW00007654321',
    'BURS-PET-2024-002',
    'HRDC-PET-2024-002',
    'Plot 1188, CBD Office Park, Block B',
    'Gaborone',
    'Botswana',
    '+267 72 765 432',
    'admin@petraholdings.co.bw',
    'business',
    50,
    NOW() - INTERVAL '90 days',
    NOW() + INTERVAL '275 days',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- USERS — clients and admins
-- =====================================================================
-- All test users share password: Test@1234
-- Hash below corresponds to that plaintext (bcrypt cost-10).

-- Kgabo: client
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, first_login)
VALUES (
    'aaaa1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'client@kgaboconstruction.co.bw',
    '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS',
    'Kgabo Modisaotsile',
    'client',
    TRUE,
    FALSE
)
ON CONFLICT DO NOTHING;

-- Kgabo: admin
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, first_login)
VALUES (
    'aaaa2222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'admin@kgaboconstruction.co.bw',
    '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS',
    'Lesego Tshepo',
    'admin',
    TRUE,
    FALSE
)
ON CONFLICT DO NOTHING;

-- Petra: client
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, first_login)
VALUES (
    'bbbb1111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'client@petraholdings.co.bw',
    '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS',
    'Petra Boitumelo',
    'client',
    TRUE,
    FALSE
)
ON CONFLICT DO NOTHING;

-- Petra: admin
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, first_login)
VALUES (
    'bbbb2222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'admin@petraholdings.co.bw',
    '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS',
    'Onkabetse Maruapula',
    'admin',
    TRUE,
    FALSE
)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- EMPLOYEE LOGIN ACCOUNTS (users table) — 3 per tenant
-- =====================================================================
-- Kgabo employee users (login by username — they may not have email)
INSERT INTO users (id, tenant_id, username, password_hash, full_name, role, is_active, first_login) VALUES
    ('aaaa3333-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'kgb-emp-001', '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS', 'Mpho Seretse',         'employee', TRUE, TRUE),
    ('aaaa3333-0001-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'kgb-emp-002', '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS', 'Tebogo Mokwena',       'employee', TRUE, TRUE),
    ('aaaa3333-0001-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'kgb-emp-003', '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS', 'Tinashe Mukamuri',     'employee', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Petra employee users
INSERT INTO users (id, tenant_id, username, password_hash, full_name, role, is_active, first_login) VALUES
    ('bbbb3333-0001-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'pet-emp-001', '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS', 'Naledi Phiri',        'employee', TRUE, TRUE),
    ('bbbb3333-0001-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'pet-emp-002', '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS', 'Kabelo Selepe',        'employee', TRUE, TRUE),
    ('bbbb3333-0001-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'pet-emp-003', '$2b$10$5h.0sZ2zNl7G7FfqkUu5l.GnK3PgF8h5d0Q1A.r5q8oU3VwN7y9oS', 'Chipo Nyathi',         'employee', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- EMPLOYEES — 3 per tenant (mix of citizens and non-citizens)
-- =====================================================================
-- Kgabo employees
INSERT INTO employees (
    id, tenant_id, user_id, employee_number, first_name, last_name, full_name,
    id_number, nationality_status, work_permit_number, work_permit_expiry, burs_tin,
    department, job_title, employment_type,
    contract_start_date, probation_end_date,
    basic_salary, pay_frequency,
    bank_name, bank_account_number, bank_branch_code,
    is_active, created_by
) VALUES
    ('cccc1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'aaaa3333-0001-0000-0000-000000000001',
     'KGB-001', 'Mpho', 'Seretse', 'Mpho Seretse',
     '123456789', 'citizen', NULL, NULL, 'TIN-MPHO-001',
     'Operations', 'Site Foreman', 'permanent',
     CURRENT_DATE - INTERVAL '4 years', CURRENT_DATE - INTERVAL '3 years 9 months',
     12500.00, 'monthly',
     'First National Bank Botswana', '62123456701', '281467',
     TRUE, 'aaaa2222-2222-2222-2222-222222222222'),

    ('cccc1111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
     'aaaa3333-0001-0000-0000-000000000002',
     'KGB-002', 'Tebogo', 'Mokwena', 'Tebogo Mokwena',
     '234567890', 'citizen', NULL, NULL, 'TIN-TEBO-002',
     'Finance', 'Accounts Officer', 'permanent',
     CURRENT_DATE - INTERVAL '2 years 6 months', CURRENT_DATE - INTERVAL '2 years 3 months',
     8500.00, 'monthly',
     'Standard Chartered Botswana', '0100123456789', '060167',
     TRUE, 'aaaa2222-2222-2222-2222-222222222222'),

    ('cccc1111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
     'aaaa3333-0001-0000-0000-000000000003',
     'KGB-003', 'Tinashe', 'Mukamuri', 'Tinashe Mukamuri',
     'ZWE-ABC123456', 'resident_non_citizen', 'WP-2024-0145', CURRENT_DATE + INTERVAL '8 months',
     'TIN-TINA-003',
     'Operations', 'Civil Engineer', 'fixed_term',
     CURRENT_DATE - INTERVAL '1 year 2 months', CURRENT_DATE - INTERVAL '11 months',
     22000.00, 'monthly',
     'Absa Bank Botswana', '9088123456701', '292167',
     TRUE, 'aaaa2222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Petra employees
INSERT INTO employees (
    id, tenant_id, user_id, employee_number, first_name, last_name, full_name,
    id_number, nationality_status, work_permit_number, work_permit_expiry, burs_tin,
    department, job_title, employment_type,
    contract_start_date, probation_end_date,
    basic_salary, pay_frequency,
    bank_name, bank_account_number, bank_branch_code,
    is_active, created_by
) VALUES
    ('dddd1111-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
     'bbbb3333-0001-0000-0000-000000000001',
     'PET-001', 'Naledi', 'Phiri', 'Naledi Phiri',
     '345678901', 'citizen', NULL, NULL, 'TIN-NALE-001',
     'Human Resources', 'HR Manager', 'permanent',
     CURRENT_DATE - INTERVAL '6 years 3 months', CURRENT_DATE - INTERVAL '6 years',
     18000.00, 'monthly',
     'First National Bank Botswana', '62200123456', '281467',
     TRUE, 'bbbb2222-2222-2222-2222-222222222222'),

    ('dddd1111-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
     'bbbb3333-0001-0000-0000-000000000002',
     'PET-002', 'Kabelo', 'Selepe', 'Kabelo Selepe',
     '456789012', 'citizen', NULL, NULL, 'TIN-KABE-002',
     'Sales', 'Sales Executive', 'permanent',
     CURRENT_DATE - INTERVAL '3 years 1 month', CURRENT_DATE - INTERVAL '2 years 10 months',
     11500.00, 'monthly',
     'Stanbic Bank Botswana', '9050111223344', '064167',
     TRUE, 'bbbb2222-2222-2222-2222-222222222222'),

    ('dddd1111-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
     'bbbb3333-0001-0000-0000-000000000003',
     'PET-003', 'Chipo', 'Nyathi', 'Chipo Nyathi',
     'ZWE-XYZ987654', 'resident_non_citizen', 'WP-2024-0789', CURRENT_DATE + INTERVAL '14 months',
     'TIN-CHIP-003',
     'IT', 'Software Developer', 'fixed_term',
     CURRENT_DATE - INTERVAL '9 months', CURRENT_DATE - INTERVAL '6 months',
     17500.00, 'monthly',
     'Bank of Baroda Botswana', '7012345678', '301167',
     TRUE, 'bbbb2222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- LEAVE TYPES — per tenant per Botswana Employment Act
-- =====================================================================
-- Kgabo
INSERT INTO leave_types (tenant_id, name, code, days_entitlement, carry_over_days, carry_over_years, requires_certificate, is_paid, pay_percentage) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Annual Leave',           'annual',                 15, 7,  3, FALSE, TRUE, 100),
    ('11111111-1111-1111-1111-111111111111', 'Sick Leave',             'sick',                   20, 0,  0, TRUE,  TRUE, 100),
    ('11111111-1111-1111-1111-111111111111', 'Maternity Leave',        'maternity',              84, 0,  0, TRUE,  TRUE, 50),
    ('11111111-1111-1111-1111-111111111111', 'Paternity Leave',        'paternity',               5, 0,  0, FALSE, TRUE, 100),
    ('11111111-1111-1111-1111-111111111111', 'Family Responsibility',  'family_responsibility',   3, 0,  0, FALSE, TRUE, 100),
    ('11111111-1111-1111-1111-111111111111', 'Unpaid Leave',           'unpaid',                  0, 0,  0, FALSE, FALSE, 0)
ON CONFLICT DO NOTHING;

-- Petra
INSERT INTO leave_types (tenant_id, name, code, days_entitlement, carry_over_days, carry_over_years, requires_certificate, is_paid, pay_percentage) VALUES
    ('22222222-2222-2222-2222-222222222222', 'Annual Leave',           'annual',                 15, 7,  3, FALSE, TRUE, 100),
    ('22222222-2222-2222-2222-222222222222', 'Sick Leave',             'sick',                   20, 0,  0, TRUE,  TRUE, 100),
    ('22222222-2222-2222-2222-222222222222', 'Maternity Leave',        'maternity',              84, 0,  0, TRUE,  TRUE, 50),
    ('22222222-2222-2222-2222-222222222222', 'Paternity Leave',        'paternity',               5, 0,  0, FALSE, TRUE, 100),
    ('22222222-2222-2222-2222-222222222222', 'Family Responsibility',  'family_responsibility',   3, 0,  0, FALSE, TRUE, 100),
    ('22222222-2222-2222-2222-222222222222', 'Unpaid Leave',           'unpaid',                  0, 0,  0, FALSE, FALSE, 0)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- ALLOWANCE TEMPLATES — per tenant
-- =====================================================================
INSERT INTO allowance_templates (tenant_id, name, description, amount_type, default_amount, is_taxable, is_recurring, is_active, created_by) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Housing Allowance',   'Monthly housing/accommodation allowance', 'fixed',      2500.00, TRUE,  TRUE, TRUE, 'aaaa2222-2222-2222-2222-222222222222'),
    ('11111111-1111-1111-1111-111111111111', 'Transport Allowance', 'Monthly transport allowance',             'fixed',      1500.00, TRUE,  TRUE, TRUE, 'aaaa2222-2222-2222-2222-222222222222'),
    ('11111111-1111-1111-1111-111111111111', 'Airtime Allowance',   'Mobile airtime for work calls',           'fixed',       300.00, FALSE, TRUE, TRUE, 'aaaa2222-2222-2222-2222-222222222222'),
    ('22222222-2222-2222-2222-222222222222', 'Housing Allowance',   'Monthly housing/accommodation allowance', 'fixed',      3000.00, TRUE,  TRUE, TRUE, 'bbbb2222-2222-2222-2222-222222222222'),
    ('22222222-2222-2222-2222-222222222222', 'Transport Allowance', 'Monthly transport allowance',             'fixed',      2000.00, TRUE,  TRUE, TRUE, 'bbbb2222-2222-2222-2222-222222222222'),
    ('22222222-2222-2222-2222-222222222222', 'Airtime Allowance',   'Mobile airtime for work calls',           'fixed',       400.00, FALSE, TRUE, TRUE, 'bbbb2222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- SAMPLE LEAVE BALANCES — current year
-- =====================================================================
DO $$
DECLARE
    v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
    r RECORD;
    v_annual_id UUID;
    v_sick_id   UUID;
BEGIN
    FOR r IN
        SELECT id AS employee_id, tenant_id FROM employees
        WHERE tenant_id IN (
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222'
        )
    LOOP
        SELECT id INTO v_annual_id FROM leave_types
            WHERE tenant_id = r.tenant_id AND code = 'annual' LIMIT 1;
        SELECT id INTO v_sick_id FROM leave_types
            WHERE tenant_id = r.tenant_id AND code = 'sick' LIMIT 1;

        -- Annual leave balance: opening 0, 15 accrued, ~3 taken, closing 12
        INSERT INTO leave_balances (
            tenant_id, employee_id, leave_type_id, year,
            opening_balance, accrued, taken, pending, closing_balance,
            carried_over_from_previous
        ) VALUES (
            r.tenant_id, r.employee_id, v_annual_id, v_year,
            0, 15, 3, 0, 12, 0
        ) ON CONFLICT DO NOTHING;

        -- Sick leave balance: opening 0, 20 accrued, ~1 taken, closing 19
        INSERT INTO leave_balances (
            tenant_id, employee_id, leave_type_id, year,
            opening_balance, accrued, taken, pending, closing_balance,
            carried_over_from_previous
        ) VALUES (
            r.tenant_id, r.employee_id, v_sick_id, v_year,
            0, 20, 1, 0, 19, 0
        ) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- =====================================================================
-- COMPLIANCE CALENDAR — current month entries per tenant
-- =====================================================================
-- BURS rules of thumb:
--   * ITW7 (monthly PAYE return)  — due 15th of month following payroll
--   * PAYE payment                 — due 15th of month following payroll
--   * SDL payment                  — due 15th of month following payroll
--   * ITW10 (annual reconciliation) — due 31st July each year
INSERT INTO compliance_calendar (tenant_id, type, due_date, period_month, period_year, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'itw7_monthly',
        (date_trunc('month', CURRENT_DATE) + INTERVAL '14 days')::date,
        EXTRACT(MONTH FROM CURRENT_DATE)::int - 1 + CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 12 ELSE 0 END,
        EXTRACT(YEAR FROM CURRENT_DATE)::int - CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 1 ELSE 0 END,
        'pending'),
    ('11111111-1111-1111-1111-111111111111', 'paye_payment',
        (date_trunc('month', CURRENT_DATE) + INTERVAL '14 days')::date,
        EXTRACT(MONTH FROM CURRENT_DATE)::int - 1 + CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 12 ELSE 0 END,
        EXTRACT(YEAR FROM CURRENT_DATE)::int - CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 1 ELSE 0 END,
        'pending'),
    ('11111111-1111-1111-1111-111111111111', 'sdl_payment',
        (date_trunc('month', CURRENT_DATE) + INTERVAL '14 days')::date,
        EXTRACT(MONTH FROM CURRENT_DATE)::int - 1 + CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 12 ELSE 0 END,
        EXTRACT(YEAR FROM CURRENT_DATE)::int - CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 1 ELSE 0 END,
        'pending'),
    ('22222222-2222-2222-2222-222222222222', 'itw7_monthly',
        (date_trunc('month', CURRENT_DATE) + INTERVAL '14 days')::date,
        EXTRACT(MONTH FROM CURRENT_DATE)::int - 1 + CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 12 ELSE 0 END,
        EXTRACT(YEAR FROM CURRENT_DATE)::int - CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 1 ELSE 0 END,
        'pending'),
    ('22222222-2222-2222-2222-222222222222', 'paye_payment',
        (date_trunc('month', CURRENT_DATE) + INTERVAL '14 days')::date,
        EXTRACT(MONTH FROM CURRENT_DATE)::int - 1 + CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 12 ELSE 0 END,
        EXTRACT(YEAR FROM CURRENT_DATE)::int - CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 1 ELSE 0 END,
        'pending'),
    ('22222222-2222-2222-2222-222222222222', 'sdl_payment',
        (date_trunc('month', CURRENT_DATE) + INTERVAL '14 days')::date,
        EXTRACT(MONTH FROM CURRENT_DATE)::int - 1 + CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 12 ELSE 0 END,
        EXTRACT(YEAR FROM CURRENT_DATE)::int - CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE)::int = 1 THEN 1 ELSE 0 END,
        'pending')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- WORK PERMIT ALERTS — for non-citizen employees with permits
-- =====================================================================
INSERT INTO work_permit_alerts (tenant_id, employee_id, permit_expiry_date)
SELECT tenant_id, id, work_permit_expiry
FROM employees
WHERE work_permit_expiry IS NOT NULL
ON CONFLICT (employee_id) DO NOTHING;

COMMIT;

-- =====================================================================
-- END seed.sql
-- =====================================================================
