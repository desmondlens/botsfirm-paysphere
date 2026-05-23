# pages/admin/

Screens for the Admin role — the day-to-day payroll operator. Admin sees only their own company data and has limited permissions compared to Client.

## Pages

- **AdminDashboard** — operational KPIs: employees due to be paid, leave pending review, recent payroll runs.
- **EmployeesPage** — list, add, edit, terminate employees. Manages employee profile fields, banking, e-TAX status.
- **PayrollPage** — create a new payroll run, review, approve, finalize. Generates payslips and bank file.
- **LeavePage** — first-level approval for leave requests; escalates to Client for second-level approval.
- **AllowancesPage** — define and assign allowances (housing, transport, etc.) per employee.
- **DeductionsPage** — define and assign deductions (loans, garnishments, contributions).
- **ReportsPage** — payroll register, leave register, allowance/deduction summary, BURS files (locked during trial).

## Conventions

- Routes are guarded by `RequireRole("admin")` and `RequireTenant`.
- Trial accounts cannot finalize more than 1 payroll run and cannot exceed 5 employees.
- Every action — create, edit, approve, finalize — writes to the audit log.
