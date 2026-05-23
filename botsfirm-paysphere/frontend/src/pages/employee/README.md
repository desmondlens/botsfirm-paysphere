# pages/employee/

Self-service screens for the Employee role. Employees see only their own data and log in with a username and password — no email required.

## Pages

- **EmployeeDashboard** — quick view: latest payslip, leave balances (annual, sick, family), any pending requests.
- **PayslipPage** — list of all historical payslips; view in browser and download as PDF (PDF locked during tenant's trial).
- **LeavePage** — request leave, view status, see leave history and accruals.

## Conventions

- Routes are guarded by `RequireRole("employee")` and `RequireTenant`.
- Employee profile is read-only — changes go through their Admin.
- No payroll figures from other employees are ever visible, including aggregates.
