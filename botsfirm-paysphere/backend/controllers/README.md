# controllers/

HTTP request/response handlers. Controllers parse and validate input, call a service, and serialize the result. They never contain business logic.

## Files

| File                       | Domain                                          |
|----------------------------|-------------------------------------------------|
| `auth.controller.js`       | Login, logout, password resets, invites.        |
| `superadmin.controller.js` | Platform-wide tenant and trial management.      |
| `client.controller.js`     | Tenant-owner operations.                        |
| `admin.controller.js`      | Tenant-admin operations.                        |
| `employee.controller.js`   | Employee self-service.                          |
| `payroll.controller.js`    | Payroll runs and payslip generation.            |
| `leave.controller.js`      | Leave requests, approvals, balances.            |
| `reports.controller.js`    | BURS, Excel, QuickBooks exports.                |
| `trial.controller.js`      | Trial signup, status, conversion.               |

## Conventions

- Validate every input with the shared validator schema.
- Never trust `tenant_id` from the body — always use `req.tenant.id`.
- Wrap async handlers so thrown errors flow into `error.middleware`.
- Return data in `{ data, meta? }` and errors in `{ code, message, fieldErrors? }`.
