# routes/

Express route definitions, grouped by domain. Each file mounts a router under a base path and delegates to a controller.

## Files

| File                       | Base path           | Purpose                                                            |
|----------------------------|---------------------|--------------------------------------------------------------------|
| `auth.routes.js`           | `/api/auth`         | Login, logout, password reset, invite redemption.                  |
| `superadmin.routes.js`     | `/api/super-admin`  | Platform-wide operations (tenants, trials, audit).                 |
| `client.routes.js`         | `/api/client`       | Tenant-owner operations (admins, leave approval, settings).        |
| `admin.routes.js`          | `/api/admin`        | Tenant-admin operations (employees, allowances, deductions).       |
| `employee.routes.js`       | `/api/employee`     | Employee self-service (own profile, own payslips, own leave).      |
| `payroll.routes.js`        | `/api/payroll`      | Payroll runs, payslip generation, finalize.                        |
| `leave.routes.js`          | `/api/leave`        | Requests, approvals, balances, accruals.                           |
| `reports.routes.js`        | `/api/reports`      | BURS files (ITW-7, ITW-10, ITW-8), Excel, QuickBooks.              |
| `trial.routes.js`          | `/api/trial`        | Trial signup, status, conversion to paid.                          |

## Conventions

- Routes are thin — they wire middleware to a controller function and nothing else.
- Every route declares the required role via `requireRole(...)`.
- Mutating routes (POST/PUT/PATCH/DELETE) are always wrapped in `audit.middleware`.
