# migrations/

Forward-only database schema changes applied after the initial `schema.sql`.

## Conventions

- One file per change. Filename: `NNNN_short_description.sql` (e.g., `0001_add_employee_kin_table.sql`).
- Apply in ascending filename order.
- Each migration must be idempotent where reasonable (e.g., `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
- Never edit a migration after it has been applied to a deployed environment — add a new migration to roll forward instead.
- Schema changes that affect RLS must include the policy updates in the same migration.
- Migrations that touch tenant data must preserve historical records — never bulk-delete rows from `audit_log`, `payslips`, or `payroll_runs`.

## Initial State

The first migration here will be created after `schema.sql` is applied to the first environment.
