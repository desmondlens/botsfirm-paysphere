-- =====================================================================
-- Botsfirm PaySphere — Row Level Security policies
-- =====================================================================
-- Multi-tenant isolation via Supabase RLS.
--
-- Identity model (set via Supabase Auth JWT claims OR app-set GUCs):
--   * Standard JWT path: auth.jwt() ->> 'role'         => 'super_admin' | 'client' | 'admin' | 'employee'
--                        auth.jwt() ->> 'tenant_id'    => tenant UUID
--                        auth.jwt() ->> 'employee_id'  => employee UUID for role='employee'
--                        auth.uid()                    => users.id
--   * Service path: backend can set GUCs via SET LOCAL
--                        app.current_role
--                        app.current_tenant_id
--                        app.current_user_id
--                        app.current_employee_id
--
-- Helper functions below read from whichever source is populated, so the
-- same policies work in both contexts. Service role always bypasses RLS
-- per Supabase convention — use it deliberately.
--
-- Run this file AFTER schema.sql.
-- =====================================================================

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

CREATE OR REPLACE FUNCTION current_app_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    BEGIN
        v_role := current_setting('app.current_role', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_role := NULL;
    END;
    IF v_role IS NULL OR v_role = '' THEN
        BEGIN
            v_role := nullif(current_setting('request.jwt.claims', TRUE)::jsonb ->> 'role', '');
        EXCEPTION WHEN OTHERS THEN
            v_role := NULL;
        END;
    END IF;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_tenant()
RETURNS UUID AS $$
DECLARE
    v_tenant TEXT;
BEGIN
    BEGIN
        v_tenant := current_setting('app.current_tenant_id', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_tenant := NULL;
    END;
    IF v_tenant IS NULL OR v_tenant = '' THEN
        BEGIN
            v_tenant := nullif(current_setting('request.jwt.claims', TRUE)::jsonb ->> 'tenant_id', '');
        EXCEPTION WHEN OTHERS THEN
            v_tenant := NULL;
        END;
    END IF;
    IF v_tenant IS NULL OR v_tenant = '' THEN
        RETURN NULL;
    END IF;
    RETURN v_tenant::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_user()
RETURNS UUID AS $$
DECLARE
    v_user TEXT;
BEGIN
    BEGIN
        v_user := current_setting('app.current_user_id', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_user := NULL;
    END;
    IF v_user IS NULL OR v_user = '' THEN
        BEGIN
            v_user := nullif(current_setting('request.jwt.claims', TRUE)::jsonb ->> 'sub', '');
        EXCEPTION WHEN OTHERS THEN
            v_user := NULL;
        END;
    END IF;
    IF v_user IS NULL OR v_user = '' THEN
        RETURN NULL;
    END IF;
    RETURN v_user::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_employee()
RETURNS UUID AS $$
DECLARE
    v_emp TEXT;
BEGIN
    BEGIN
        v_emp := current_setting('app.current_employee_id', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_emp := NULL;
    END;
    IF v_emp IS NULL OR v_emp = '' THEN
        BEGIN
            v_emp := nullif(current_setting('request.jwt.claims', TRUE)::jsonb ->> 'employee_id', '');
        EXCEPTION WHEN OTHERS THEN
            v_emp := NULL;
        END;
    END IF;
    IF v_emp IS NULL OR v_emp = '' THEN
        RETURN NULL;
    END IF;
    RETURN v_emp::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
    SELECT current_app_role() = 'super_admin';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_client() RETURNS BOOLEAN AS $$
    SELECT current_app_role() = 'client';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
    SELECT current_app_role() = 'admin';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_employee() RETURNS BOOLEAN AS $$
    SELECT current_app_role() = 'employee';
$$ LANGUAGE sql STABLE;

-- =====================================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================================

ALTER TABLE tenants                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees               ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowance_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_allowances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_deductions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips                ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_line_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types             ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances          ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_benefits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_calendar     ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_permit_alerts      ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- TENANTS
--   * super admin: all rows
--   * client / admin / employee: only their own tenant row
-- =====================================================================
DROP POLICY IF EXISTS tenants_select ON tenants;
CREATE POLICY tenants_select ON tenants FOR SELECT
    USING (is_super_admin() OR id = current_app_tenant());

DROP POLICY IF EXISTS tenants_insert ON tenants;
CREATE POLICY tenants_insert ON tenants FOR INSERT
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS tenants_update ON tenants;
CREATE POLICY tenants_update ON tenants FOR UPDATE
    USING (is_super_admin() OR (is_client() AND id = current_app_tenant()))
    WITH CHECK (is_super_admin() OR (is_client() AND id = current_app_tenant()));

DROP POLICY IF EXISTS tenants_delete ON tenants;
CREATE POLICY tenants_delete ON tenants FOR DELETE
    USING (is_super_admin());

-- =====================================================================
-- SUPER ADMINS — only super admins see/manage super admins
-- =====================================================================
DROP POLICY IF EXISTS super_admins_all ON super_admins;
CREATE POLICY super_admins_all ON super_admins FOR ALL
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- =====================================================================
-- USERS
--   * super_admin: all
--   * client/admin: same tenant
--   * employee: only own user record
-- =====================================================================
DROP POLICY IF EXISTS users_select ON users;
CREATE POLICY users_select ON users FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND id = current_app_user())
    );

DROP POLICY IF EXISTS users_insert ON users;
CREATE POLICY users_insert ON users FOR INSERT
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

DROP POLICY IF EXISTS users_update ON users;
CREATE POLICY users_update ON users FOR UPDATE
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND id = current_app_user())
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND id = current_app_user())
    );

DROP POLICY IF EXISTS users_delete ON users;
CREATE POLICY users_delete ON users FOR DELETE
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND is_client())
    );

-- =====================================================================
-- EMPLOYEES
--   * super_admin: all
--   * client/admin: same tenant
--   * employee: only own employee record
-- =====================================================================
DROP POLICY IF EXISTS employees_select ON employees;
CREATE POLICY employees_select ON employees FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND id = current_app_employee())
    );

DROP POLICY IF EXISTS employees_insert ON employees;
CREATE POLICY employees_insert ON employees FOR INSERT
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

DROP POLICY IF EXISTS employees_update ON employees;
CREATE POLICY employees_update ON employees FOR UPDATE
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

DROP POLICY IF EXISTS employees_delete ON employees;
CREATE POLICY employees_delete ON employees FOR DELETE
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND is_client())
    );

-- =====================================================================
-- ALLOWANCE TEMPLATES
-- =====================================================================
DROP POLICY IF EXISTS allowance_templates_select ON allowance_templates;
CREATE POLICY allowance_templates_select ON allowance_templates FOR SELECT
    USING (
        is_super_admin()
        OR tenant_id = current_app_tenant()
    );

DROP POLICY IF EXISTS allowance_templates_write ON allowance_templates;
CREATE POLICY allowance_templates_write ON allowance_templates FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- EMPLOYEE ALLOWANCES
--   * employee sees their own allowances
-- =====================================================================
DROP POLICY IF EXISTS employee_allowances_select ON employee_allowances;
CREATE POLICY employee_allowances_select ON employee_allowances FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS employee_allowances_write ON employee_allowances;
CREATE POLICY employee_allowances_write ON employee_allowances FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- DEDUCTION TEMPLATES
-- =====================================================================
DROP POLICY IF EXISTS deduction_templates_select ON deduction_templates;
CREATE POLICY deduction_templates_select ON deduction_templates FOR SELECT
    USING (
        is_super_admin()
        OR tenant_id = current_app_tenant()
    );

DROP POLICY IF EXISTS deduction_templates_write ON deduction_templates;
CREATE POLICY deduction_templates_write ON deduction_templates FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- EMPLOYEE DEDUCTIONS
-- =====================================================================
DROP POLICY IF EXISTS employee_deductions_select ON employee_deductions;
CREATE POLICY employee_deductions_select ON employee_deductions FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS employee_deductions_write ON employee_deductions;
CREATE POLICY employee_deductions_write ON employee_deductions FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- PAYROLL RUNS — client & admin see tenant runs; employees blocked
-- =====================================================================
DROP POLICY IF EXISTS payroll_runs_select ON payroll_runs;
CREATE POLICY payroll_runs_select ON payroll_runs FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

DROP POLICY IF EXISTS payroll_runs_write ON payroll_runs;
CREATE POLICY payroll_runs_write ON payroll_runs FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- PAYSLIPS — employee sees only own AND only when visible flag is true
-- =====================================================================
DROP POLICY IF EXISTS payslips_select ON payslips;
CREATE POLICY payslips_select ON payslips FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee() AND is_visible_to_employee = TRUE)
    );

DROP POLICY IF EXISTS payslips_write ON payslips;
CREATE POLICY payslips_write ON payslips FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- PAYSLIP LINE ITEMS — same visibility as parent payslip
-- =====================================================================
DROP POLICY IF EXISTS payslip_line_items_select ON payslip_line_items;
CREATE POLICY payslip_line_items_select ON payslip_line_items FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND EXISTS (
                SELECT 1 FROM payslips p
                WHERE p.id = payslip_line_items.payslip_id
                  AND p.employee_id = current_app_employee()
                  AND p.is_visible_to_employee = TRUE
            ))
    );

DROP POLICY IF EXISTS payslip_line_items_write ON payslip_line_items;
CREATE POLICY payslip_line_items_write ON payslip_line_items FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- LEAVE TYPES
-- =====================================================================
DROP POLICY IF EXISTS leave_types_select ON leave_types;
CREATE POLICY leave_types_select ON leave_types FOR SELECT
    USING (is_super_admin() OR tenant_id = current_app_tenant());

DROP POLICY IF EXISTS leave_types_write ON leave_types;
CREATE POLICY leave_types_write ON leave_types FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- LEAVE BALANCES — employee sees only own
-- =====================================================================
DROP POLICY IF EXISTS leave_balances_select ON leave_balances;
CREATE POLICY leave_balances_select ON leave_balances FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS leave_balances_write ON leave_balances;
CREATE POLICY leave_balances_write ON leave_balances FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- LEAVE REQUESTS — employees see/insert own, admins manage all
-- =====================================================================
DROP POLICY IF EXISTS leave_requests_select ON leave_requests;
CREATE POLICY leave_requests_select ON leave_requests FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS leave_requests_insert ON leave_requests;
CREATE POLICY leave_requests_insert ON leave_requests FOR INSERT
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND tenant_id = current_app_tenant() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS leave_requests_update ON leave_requests;
CREATE POLICY leave_requests_update ON leave_requests FOR UPDATE
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee()
            AND employee_id = current_app_employee()
            AND status = 'pending')      -- employees can only modify while pending
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS leave_requests_delete ON leave_requests;
CREATE POLICY leave_requests_delete ON leave_requests FOR DELETE
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND is_client())
    );

-- =====================================================================
-- TERMINAL BENEFITS
-- =====================================================================
DROP POLICY IF EXISTS terminal_benefits_select ON terminal_benefits;
CREATE POLICY terminal_benefits_select ON terminal_benefits FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS terminal_benefits_write ON terminal_benefits;
CREATE POLICY terminal_benefits_write ON terminal_benefits FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- AUDIT LOGS
--   * super_admin: all
--   * client: tenant logs
--   * admin: limited — own actions or actions on entities they touch
--     (here: own actions, plus payroll/leave/employee events)
--   * employee: nothing
-- Writes: anyone authenticated can insert (the application is the one
-- recording); UPDATE/DELETE blocked by triggers (see schema.sql).
-- =====================================================================
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
    USING (
        is_super_admin()
        OR (is_client() AND tenant_id = current_app_tenant())
        OR (is_admin()
            AND tenant_id = current_app_tenant()
            AND (
                user_id = current_app_user()
                OR entity_type IN ('payroll_run','payslip','leave_request','employee','allowance','deduction')
            ))
    );

DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
    WITH CHECK (
        is_super_admin()
        OR tenant_id = current_app_tenant()
        OR tenant_id IS NULL    -- platform-level events
    );

-- (No UPDATE/DELETE policies — table triggers reject them.)

-- =====================================================================
-- INVITE CODES — super admin only (clients only redeem via signup endpoint)
-- =====================================================================
DROP POLICY IF EXISTS invite_codes_all ON invite_codes;
CREATE POLICY invite_codes_all ON invite_codes FOR ALL
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- =====================================================================
-- TRIALS — super admin only
-- =====================================================================
DROP POLICY IF EXISTS trials_all ON trials;
CREATE POLICY trials_all ON trials FOR ALL
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- =====================================================================
-- COMPLIANCE CALENDAR
-- =====================================================================
DROP POLICY IF EXISTS compliance_calendar_select ON compliance_calendar;
CREATE POLICY compliance_calendar_select ON compliance_calendar FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

DROP POLICY IF EXISTS compliance_calendar_write ON compliance_calendar;
CREATE POLICY compliance_calendar_write ON compliance_calendar FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- WORK PERMIT ALERTS
-- =====================================================================
DROP POLICY IF EXISTS work_permit_alerts_select ON work_permit_alerts;
CREATE POLICY work_permit_alerts_select ON work_permit_alerts FOR SELECT
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
        OR (is_employee() AND employee_id = current_app_employee())
    );

DROP POLICY IF EXISTS work_permit_alerts_write ON work_permit_alerts;
CREATE POLICY work_permit_alerts_write ON work_permit_alerts FOR ALL
    USING (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    )
    WITH CHECK (
        is_super_admin()
        OR (tenant_id = current_app_tenant() AND current_app_role() IN ('client','admin'))
    );

-- =====================================================================
-- END rls-policies.sql
-- =====================================================================
