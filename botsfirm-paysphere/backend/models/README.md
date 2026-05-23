# models/

Database table accessors. Each file represents one table and exposes query helpers (find, list, insert, update, soft-delete).

## Files

| File                   | Table                                              |
|------------------------|----------------------------------------------------|
| `tenant.model.js`      | Tenants (companies). Includes plan, trial status.  |
| `user.model.js`        | Users (Super Admin, Client, Admin, Employee).      |
| `employee.model.js`    | Employees (subset of users with payroll fields).   |
| `payroll.model.js`     | Payroll runs.                                      |
| `payslip.model.js`     | Individual payslips per employee per run.          |
| `leave.model.js`       | Leave requests, approvals, balances.               |
| `allowance.model.js`   | Allowance definitions + assignments.               |
| `deduction.model.js`   | Deduction definitions + assignments.               |
| `audit.model.js`       | Append-only audit log.                             |
| `trial.model.js`       | Trial signup, expiry, reminder tracking.           |

## Conventions

- **Every table has `tenant_id`** — no exceptions outside of the platform-level audit log entries belonging to Super Admin (which still carries the affected tenant_id).
- Models never trust caller-supplied `tenant_id` — middleware injects it.
- All inserts/updates go through Supabase service-role client; reads use the user-scoped client where possible so RLS enforces isolation.
- Soft-delete via `deleted_at` rather than hard delete. Audit rows can never be deleted.
