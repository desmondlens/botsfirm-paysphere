-- =====================================================================
-- Botsfirm PaySphere — PostgreSQL / Supabase schema
-- =====================================================================
-- Multi-tenant Botswana payroll SaaS platform.
--
-- Conventions:
--   * Primary key on every table: id UUID DEFAULT gen_random_uuid().
--   * Every business table carries tenant_id UUID NOT NULL for isolation.
--     (Exceptions: tenants, super_admins, trials, invite_codes — these
--      either ARE the tenant or exist before tenants do.)
--   * created_at / updated_at TIMESTAMPTZ DEFAULT now() everywhere.
--   * Enums are defined once at the top, referenced by table columns.
--   * Foreign keys use ON DELETE CASCADE for child-of-tenant data,
--     ON DELETE RESTRICT for references that must remain intact for audit.
--
-- This file is idempotent on a clean database. On an existing database,
-- enum CREATE TYPE statements will fail; wrap in DO blocks if needed.
-- =====================================================================

-- Required extensions ------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";    -- case-insensitive email

-- =====================================================================
-- ENUM TYPES
-- =====================================================================

CREATE TYPE tenant_plan AS ENUM ('starter', 'growth', 'business', 'enterprise', 'trial');
CREATE TYPE tenant_status AS ENUM ('active', 'expired', 'suspended', 'trial');

CREATE TYPE user_role AS ENUM ('client', 'admin', 'employee');

CREATE TYPE nationality_status AS ENUM ('citizen', 'resident_non_citizen', 'non_resident');
CREATE TYPE employment_type AS ENUM ('permanent', 'fixed_term', 'casual', 'contractor');
CREATE TYPE pay_frequency AS ENUM ('monthly', 'weekly', 'fortnightly');

CREATE TYPE amount_type AS ENUM ('fixed', 'percentage');

CREATE TYPE payroll_status AS ENUM ('draft', 'processing', 'approved', 'paid', 'locked');

CREATE TYPE tax_table_used AS ENUM ('resident', 'non_resident');

CREATE TYPE payslip_line_type AS ENUM ('basic_salary', 'allowance', 'deduction', 'tax', 'net_pay');

CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

CREATE TYPE audit_status AS ENUM ('success', 'failed');

CREATE TYPE trial_status AS ENUM ('active', 'expired', 'converted', 'deleted');

CREATE TYPE compliance_type AS ENUM ('itw7_monthly', 'itw10_annual', 'itw8_employee', 'sdl_payment', 'paye_payment');
CREATE TYPE compliance_status AS ENUM ('pending', 'submitted', 'overdue');

-- =====================================================================
-- TENANTS — companies using the platform
-- =====================================================================
CREATE TABLE tenants (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name          TEXT NOT NULL,
    registration_number   TEXT,
    burs_number           TEXT,                          -- BURS Tax ID
    hrdc_number           TEXT,                          -- Human Resource Development Council
    address               TEXT,
    city                  TEXT,
    country               TEXT NOT NULL DEFAULT 'Botswana',
    phone                 TEXT,
    email                 CITEXT,
    logo_url              TEXT,
    plan                  tenant_plan NOT NULL DEFAULT 'trial',
    max_employees         INTEGER NOT NULL DEFAULT 10,
    subscription_start    TIMESTAMPTZ,
    subscription_end      TIMESTAMPTZ,
    trial_start           TIMESTAMPTZ,
    trial_end             TIMESTAMPTZ,
    trial_converted       BOOLEAN NOT NULL DEFAULT FALSE,
    status                tenant_status NOT NULL DEFAULT 'trial',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_status        ON tenants(status);
CREATE INDEX idx_tenants_plan          ON tenants(plan);
CREATE INDEX idx_tenants_trial_end     ON tenants(trial_end) WHERE status = 'trial';
CREATE INDEX idx_tenants_burs_number   ON tenants(burs_number);

-- =====================================================================
-- SUPER ADMINS — Botsfirm staff (platform-level users)
-- =====================================================================
CREATE TABLE super_admins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    password_hash   TEXT NOT NULL,
    last_login      TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_super_admins_email ON super_admins(email);

-- =====================================================================
-- USERS — clients, admins, employees (single table by role)
-- =====================================================================
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email                   CITEXT,
    username                TEXT,                                  -- employees without email log in by username
    password_hash           TEXT NOT NULL,
    full_name               TEXT NOT NULL,
    role                    user_role NOT NULL,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    first_login             BOOLEAN NOT NULL DEFAULT TRUE,
    last_login              TIMESTAMPTZ,
    failed_login_attempts   INTEGER NOT NULL DEFAULT 0,
    locked_until            TIMESTAMPTZ,
    two_factor_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret       TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT users_email_or_username_required
        CHECK (email IS NOT NULL OR username IS NOT NULL),
    CONSTRAINT users_email_unique_per_tenant
        UNIQUE (tenant_id, email),
    CONSTRAINT users_username_unique_per_tenant
        UNIQUE (tenant_id, username)
);

CREATE INDEX idx_users_tenant_id   ON users(tenant_id);
CREATE INDEX idx_users_role        ON users(tenant_id, role);
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_username    ON users(username);
CREATE INDEX idx_users_active      ON users(tenant_id, is_active);

-- =====================================================================
-- EMPLOYEES — full HR profile
-- =====================================================================
CREATE TABLE employees (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_number       TEXT NOT NULL,
    first_name            TEXT NOT NULL,
    last_name             TEXT NOT NULL,
    full_name             TEXT NOT NULL,
    id_number             TEXT NOT NULL,                  -- Omang or passport
    nationality_status    nationality_status NOT NULL,
    work_permit_number    TEXT,
    work_permit_expiry    DATE,
    burs_tin              TEXT,                            -- employee BURS TIN
    department            TEXT,
    job_title             TEXT NOT NULL,
    employment_type       employment_type NOT NULL DEFAULT 'permanent',
    contract_start_date   DATE NOT NULL,
    contract_end_date     DATE,
    probation_end_date    DATE,
    basic_salary          NUMERIC(14,2) NOT NULL CHECK (basic_salary >= 0),
    pay_frequency         pay_frequency NOT NULL DEFAULT 'monthly',
    bank_name             TEXT,
    bank_account_number   TEXT,
    bank_branch_code      TEXT,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    termination_date      DATE,
    termination_reason    TEXT,
    created_by            UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT employees_number_unique_per_tenant UNIQUE (tenant_id, employee_number),
    CONSTRAINT employees_idnumber_unique_per_tenant UNIQUE (tenant_id, id_number),
    CONSTRAINT employees_non_citizen_needs_permit
        CHECK (nationality_status = 'citizen' OR work_permit_number IS NOT NULL)
);

CREATE INDEX idx_employees_tenant_id        ON employees(tenant_id);
CREATE INDEX idx_employees_active           ON employees(tenant_id, is_active);
CREATE INDEX idx_employees_user_id          ON employees(user_id);
CREATE INDEX idx_employees_nationality      ON employees(tenant_id, nationality_status);
CREATE INDEX idx_employees_permit_expiry    ON employees(work_permit_expiry)
    WHERE work_permit_expiry IS NOT NULL AND is_active = TRUE;
CREATE INDEX idx_employees_employee_number  ON employees(tenant_id, employee_number);

-- =====================================================================
-- ALLOWANCE TEMPLATES — defined by admin per company
-- =====================================================================
CREATE TABLE allowance_templates (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    description       TEXT,
    amount_type       amount_type NOT NULL DEFAULT 'fixed',
    default_amount    NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (default_amount >= 0),
    is_taxable        BOOLEAN NOT NULL DEFAULT TRUE,
    is_recurring      BOOLEAN NOT NULL DEFAULT TRUE,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT allowance_templates_name_unique_per_tenant UNIQUE (tenant_id, name)
);

CREATE INDEX idx_allowance_templates_tenant ON allowance_templates(tenant_id);
CREATE INDEX idx_allowance_templates_active ON allowance_templates(tenant_id, is_active);

-- =====================================================================
-- EMPLOYEE ALLOWANCES — assignment to a specific employee
-- =====================================================================
CREATE TABLE employee_allowances (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id              UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    allowance_template_id    UUID NOT NULL REFERENCES allowance_templates(id) ON DELETE RESTRICT,
    amount                   NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    is_taxable               BOOLEAN NOT NULL DEFAULT TRUE,
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from           DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to             DATE,
    created_by               UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT employee_allowances_dates_sensible
        CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX idx_employee_allowances_tenant   ON employee_allowances(tenant_id);
CREATE INDEX idx_employee_allowances_employee ON employee_allowances(employee_id);
CREATE INDEX idx_employee_allowances_template ON employee_allowances(allowance_template_id);
CREATE INDEX idx_employee_allowances_active   ON employee_allowances(employee_id, is_active);

-- =====================================================================
-- DEDUCTION TEMPLATES
-- =====================================================================
CREATE TABLE deduction_templates (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                       TEXT NOT NULL,
    description                TEXT,
    amount_type                amount_type NOT NULL DEFAULT 'fixed',
    default_amount             NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (default_amount >= 0),
    reduces_taxable_income     BOOLEAN NOT NULL DEFAULT FALSE,
    is_recurring               BOOLEAN NOT NULL DEFAULT TRUE,
    is_active                  BOOLEAN NOT NULL DEFAULT TRUE,
    created_by                 UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT deduction_templates_name_unique_per_tenant UNIQUE (tenant_id, name)
);

CREATE INDEX idx_deduction_templates_tenant ON deduction_templates(tenant_id);
CREATE INDEX idx_deduction_templates_active ON deduction_templates(tenant_id, is_active);

-- =====================================================================
-- EMPLOYEE DEDUCTIONS
-- =====================================================================
CREATE TABLE employee_deductions (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id               UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    deduction_template_id     UUID NOT NULL REFERENCES deduction_templates(id) ON DELETE RESTRICT,
    amount                    NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    reduces_taxable_income    BOOLEAN NOT NULL DEFAULT FALSE,
    balance                   NUMERIC(14,2),                -- for loans / amortising deductions
    is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from            DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to              DATE,
    created_by                UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT employee_deductions_dates_sensible
        CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX idx_employee_deductions_tenant   ON employee_deductions(tenant_id);
CREATE INDEX idx_employee_deductions_employee ON employee_deductions(employee_id);
CREATE INDEX idx_employee_deductions_template ON employee_deductions(deduction_template_id);
CREATE INDEX idx_employee_deductions_active   ON employee_deductions(employee_id, is_active);

-- =====================================================================
-- PAYROLL RUNS
-- =====================================================================
CREATE TABLE payroll_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pay_period_month    INTEGER NOT NULL CHECK (pay_period_month BETWEEN 1 AND 12),
    pay_period_year     INTEGER NOT NULL CHECK (pay_period_year BETWEEN 2000 AND 2100),
    run_date            DATE NOT NULL DEFAULT CURRENT_DATE,
    status              payroll_status NOT NULL DEFAULT 'draft',
    total_gross         NUMERIC(16,2) NOT NULL DEFAULT 0,
    total_paye          NUMERIC(16,2) NOT NULL DEFAULT 0,
    total_sdl           NUMERIC(16,2) NOT NULL DEFAULT 0,
    total_deductions    NUMERIC(16,2) NOT NULL DEFAULT 0,
    total_net           NUMERIC(16,2) NOT NULL DEFAULT 0,
    employee_count      INTEGER NOT NULL DEFAULT 0,
    run_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,
    locked_at           TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payroll_runs_unique_period UNIQUE (tenant_id, pay_period_year, pay_period_month)
);

CREATE INDEX idx_payroll_runs_tenant ON payroll_runs(tenant_id);
CREATE INDEX idx_payroll_runs_period ON payroll_runs(tenant_id, pay_period_year DESC, pay_period_month DESC);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(tenant_id, status);

-- =====================================================================
-- PAYSLIPS — one per employee per payroll run
-- =====================================================================
CREATE TABLE payslips (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payroll_run_id                  UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id                     UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    pay_period_month                INTEGER NOT NULL CHECK (pay_period_month BETWEEN 1 AND 12),
    pay_period_year                 INTEGER NOT NULL,
    basic_salary                    NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_taxable_allowances        NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_non_taxable_allowances    NUMERIC(14,2) NOT NULL DEFAULT 0,
    gross_taxable_income            NUMERIC(14,2) NOT NULL DEFAULT 0,
    paye_amount                     NUMERIC(14,2) NOT NULL DEFAULT 0,
    sdl_amount                      NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_deductions                NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_pay                         NUMERIC(14,2) NOT NULL DEFAULT 0,
    nationality_status              nationality_status NOT NULL,
    tax_table_used                  tax_table_used NOT NULL,
    pdf_url                         TEXT,
    is_visible_to_employee          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payslips_unique_per_run UNIQUE (payroll_run_id, employee_id)
);

CREATE INDEX idx_payslips_tenant       ON payslips(tenant_id);
CREATE INDEX idx_payslips_run          ON payslips(payroll_run_id);
CREATE INDEX idx_payslips_employee     ON payslips(employee_id);
CREATE INDEX idx_payslips_visibility   ON payslips(employee_id, is_visible_to_employee);
CREATE INDEX idx_payslips_period       ON payslips(tenant_id, pay_period_year DESC, pay_period_month DESC);

-- =====================================================================
-- PAYSLIP LINE ITEMS — detailed breakdown rows
-- =====================================================================
CREATE TABLE payslip_line_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payslip_id    UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    line_type     payslip_line_type NOT NULL,
    description   TEXT NOT NULL,
    amount        NUMERIC(14,2) NOT NULL,
    is_taxable    BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payslip_line_items_tenant   ON payslip_line_items(tenant_id);
CREATE INDEX idx_payslip_line_items_payslip  ON payslip_line_items(payslip_id);
CREATE INDEX idx_payslip_line_items_type     ON payslip_line_items(payslip_id, line_type);

-- =====================================================================
-- LEAVE TYPES
-- =====================================================================
CREATE TABLE leave_types (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                     TEXT NOT NULL,
    code                     TEXT NOT NULL,           -- annual, sick, maternity, paternity, family_responsibility, unpaid, other
    days_entitlement         NUMERIC(6,2) NOT NULL DEFAULT 0,
    carry_over_days          NUMERIC(6,2) NOT NULL DEFAULT 0,
    carry_over_years         INTEGER NOT NULL DEFAULT 0,
    requires_certificate     BOOLEAN NOT NULL DEFAULT FALSE,
    is_paid                  BOOLEAN NOT NULL DEFAULT TRUE,
    pay_percentage           NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (pay_percentage BETWEEN 0 AND 100),
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT leave_types_code_unique_per_tenant UNIQUE (tenant_id, code)
);

CREATE INDEX idx_leave_types_tenant ON leave_types(tenant_id);
CREATE INDEX idx_leave_types_active ON leave_types(tenant_id, is_active);

-- =====================================================================
-- LEAVE BALANCES — per employee per leave type per year
-- =====================================================================
CREATE TABLE leave_balances (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id                     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id                   UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    year                            INTEGER NOT NULL,
    opening_balance                 NUMERIC(6,2) NOT NULL DEFAULT 0,
    accrued                         NUMERIC(6,2) NOT NULL DEFAULT 0,
    taken                           NUMERIC(6,2) NOT NULL DEFAULT 0,
    pending                         NUMERIC(6,2) NOT NULL DEFAULT 0,
    closing_balance                 NUMERIC(6,2) NOT NULL DEFAULT 0,
    carried_over_from_previous      NUMERIC(6,2) NOT NULL DEFAULT 0,
    expires_at                      DATE,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT leave_balances_unique UNIQUE (employee_id, leave_type_id, year)
);

CREATE INDEX idx_leave_balances_tenant   ON leave_balances(tenant_id);
CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year     ON leave_balances(tenant_id, year);
CREATE INDEX idx_leave_balances_expires  ON leave_balances(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================================
-- LEAVE REQUESTS
-- =====================================================================
CREATE TABLE leave_requests (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id                 UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id               UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date                  DATE NOT NULL,
    end_date                    DATE NOT NULL,
    days_requested              NUMERIC(6,2) NOT NULL CHECK (days_requested > 0),
    reason                      TEXT,
    status                      leave_status NOT NULL DEFAULT 'pending',
    applied_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_by                 UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at                 TIMESTAMPTZ,
    approval_password_used      BOOLEAN NOT NULL DEFAULT FALSE,
    rejection_reason            TEXT,
    certificate_url             TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT leave_requests_dates_valid CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_tenant    ON leave_requests(tenant_id);
CREATE INDEX idx_leave_requests_employee  ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status    ON leave_requests(tenant_id, status);
CREATE INDEX idx_leave_requests_period    ON leave_requests(tenant_id, start_date, end_date);

-- =====================================================================
-- TERMINAL BENEFITS — per employee severance/gratuity ledger
-- =====================================================================
CREATE TABLE terminal_benefits (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id                 UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    months_served               INTEGER NOT NULL DEFAULT 0,
    severance_days_accrued      NUMERIC(8,2) NOT NULL DEFAULT 0,
    severance_amount            NUMERIC(14,2) NOT NULL DEFAULT 0,
    gratuity_accrued            NUMERIC(14,2) NOT NULL DEFAULT 0,
    last_calculated_at          TIMESTAMPTZ,
    next_gratuity_date          DATE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT terminal_benefits_employee_unique UNIQUE (employee_id)
);

CREATE INDEX idx_terminal_benefits_tenant   ON terminal_benefits(tenant_id);
CREATE INDEX idx_terminal_benefits_employee ON terminal_benefits(employee_id);
CREATE INDEX idx_terminal_benefits_next_gratuity ON terminal_benefits(next_gratuity_date);

-- =====================================================================
-- AUDIT LOGS — append-only
-- =====================================================================
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,    -- NULL for super admin platform actions
    user_id         UUID,                                                -- not FK: keep log even if user deleted
    user_role       TEXT,                                                -- 'super_admin', 'client', 'admin', 'employee'
    action          TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    entity_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    status          audit_status NOT NULL DEFAULT 'success',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant       ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user         ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity       ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created      ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action       ON audit_logs(action);

-- =====================================================================
-- INVITE CODES — generated by super admin for new tenants
-- =====================================================================
CREATE TABLE invite_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
    code            TEXT UNIQUE NOT NULL,
    plan            tenant_plan NOT NULL,
    max_employees   INTEGER NOT NULL,
    generated_by    UUID REFERENCES super_admins(id) ON DELETE SET NULL,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL,
    redeemed_at     TIMESTAMPTZ,
    redeemed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invite_codes_code      ON invite_codes(code);
CREATE INDEX idx_invite_codes_unused    ON invite_codes(is_used, expires_at) WHERE is_used = FALSE;
CREATE INDEX idx_invite_codes_tenant    ON invite_codes(tenant_id);

-- =====================================================================
-- TRIALS — prospect/trial tracking before conversion to tenant
-- =====================================================================
CREATE TABLE trials (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                       CITEXT NOT NULL,
    full_name                   TEXT NOT NULL,
    company_name                TEXT NOT NULL,
    phone                       TEXT,
    employee_count_estimate     INTEGER,
    plan_assigned               tenant_plan,
    tenant_id                   UUID REFERENCES tenants(id) ON DELETE SET NULL,
    trial_start                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    trial_end                   TIMESTAMPTZ NOT NULL,
    status                      trial_status NOT NULL DEFAULT 'active',
    employees_added             INTEGER NOT NULL DEFAULT 0,
    payroll_runs_count          INTEGER NOT NULL DEFAULT 0,
    reminder_1_sent             BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_3_sent             BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_6_sent             BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_7_sent             BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_8_sent             BOOLEAN NOT NULL DEFAULT FALSE,
    converted_at                TIMESTAMPTZ,
    data_delete_scheduled_at    TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trials_email           ON trials(email);
CREATE INDEX idx_trials_status          ON trials(status);
CREATE INDEX idx_trials_trial_end       ON trials(trial_end);
CREATE INDEX idx_trials_delete_due      ON trials(data_delete_scheduled_at)
    WHERE status = 'expired' AND data_delete_scheduled_at IS NOT NULL;

-- =====================================================================
-- COMPLIANCE CALENDAR — BURS submission tracking per tenant
-- =====================================================================
CREATE TABLE compliance_calendar (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type                compliance_type NOT NULL,
    due_date            DATE NOT NULL,
    period_month        INTEGER CHECK (period_month IS NULL OR period_month BETWEEN 1 AND 12),
    period_year         INTEGER NOT NULL,
    status              compliance_status NOT NULL DEFAULT 'pending',
    submitted_at        TIMESTAMPTZ,
    reference_number    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_calendar_tenant ON compliance_calendar(tenant_id);
CREATE INDEX idx_compliance_calendar_due    ON compliance_calendar(due_date) WHERE status IN ('pending', 'overdue');
CREATE INDEX idx_compliance_calendar_status ON compliance_calendar(tenant_id, status);
CREATE INDEX idx_compliance_calendar_period ON compliance_calendar(tenant_id, period_year DESC, period_month DESC);

-- =====================================================================
-- WORK PERMIT ALERTS — track outreach for expiring permits
-- =====================================================================
CREATE TABLE work_permit_alerts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id             UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    permit_expiry_date      DATE NOT NULL,
    alert_60_sent           BOOLEAN NOT NULL DEFAULT FALSE,
    alert_30_sent           BOOLEAN NOT NULL DEFAULT FALSE,
    alert_expired_sent      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT work_permit_alerts_employee_unique UNIQUE (employee_id)
);

CREATE INDEX idx_work_permit_alerts_tenant ON work_permit_alerts(tenant_id);
CREATE INDEX idx_work_permit_alerts_expiry ON work_permit_alerts(permit_expiry_date);

-- =====================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to every table that has updated_at -------------------
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updated_at'
          AND table_name IN (
            'tenants','super_admins','users','employees',
            'allowance_templates','employee_allowances',
            'deduction_templates','employee_deductions',
            'payroll_runs','payslips',
            'leave_types','leave_balances','leave_requests',
            'terminal_benefits','trials','compliance_calendar',
            'work_permit_alerts'
          )
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I; ' ||
            'CREATE TRIGGER trg_%I_updated_at ' ||
            'BEFORE UPDATE ON %I ' ||
            'FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
            t, t, t, t
        );
    END LOOP;
END $$;

-- =====================================================================
-- AUDIT LOG IMMUTABILITY — block UPDATE and DELETE
-- =====================================================================
CREATE OR REPLACE FUNCTION audit_logs_no_modify()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only — % not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_no_update ON audit_logs;
CREATE TRIGGER trg_audit_logs_no_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION audit_logs_no_modify();

DROP TRIGGER IF EXISTS trg_audit_logs_no_delete ON audit_logs;
CREATE TRIGGER trg_audit_logs_no_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION audit_logs_no_modify();

-- =====================================================================
-- END schema.sql
-- =====================================================================
