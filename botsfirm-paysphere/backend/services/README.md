# services/

Business logic. All statutory math, multi-step workflows, and external integrations live here. Services are called by controllers and may call other services and models.

## Files

| File                       | Responsibility                                                         |
|----------------------------|------------------------------------------------------------------------|
| `paye.service.js`          | BURS PAYE calculation engine using 2025/2026 monthly brackets.         |
| `payroll.service.js`       | Full payroll run: gross, allowances, deductions, PAYE, SDL, net.       |
| `leave.service.js`         | Leave accruals, rollovers, balances, request lifecycle.                |
| `severance.service.js`     | Employment Act terminal benefits calculator.                           |
| `quickbooks.service.js`    | Journal entry generator for QuickBooks import.                         |
| `pdf.service.js`           | Payslip PDF generator using PDFKit.                                    |
| `excel.service.js`         | Excel exports using ExcelJS (payroll register, BURS, leave register).  |
| `email.service.js`         | All transactional emails via Resend (invites, payslips, trial reminders). |
| `audit.service.js`         | Append-only audit log writer.                                          |
| `invite.service.js`        | Generates and validates one-time invite codes for Admins and Employees.|
| `trial.service.js`         | Trial lifecycle: signup, expiry, reminder emails, conversion, retention. |

## Conventions

- Services are stateless — no module-level mutable state.
- Statutory constants come from `utils/taxBrackets.js`, `utils/leaveEntitlements.js`, `utils/severanceCalculator.js`.
- Every mutating service operation calls `audit.service.record(...)`.
- PAYE engine treats citizens (BWP 4,000/month threshold) and non-citizens (taxed from first pula at 5%) separately.
