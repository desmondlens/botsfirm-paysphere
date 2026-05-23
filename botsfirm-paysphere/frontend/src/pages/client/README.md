# pages/client/

Screens for the Client role — the tenant owner. Client sees only their own company data.

## Pages

- **ClientDashboard** — overview: headcount, last payroll, pending leave approvals, plan & trial status.
- **AdminsPage** — invite, list, deactivate Admins. Admin permissions managed here.
- **LeaveApprovalPage** — approve or reject leave requests escalated from Admins (final-level approval).
- **ReportsPage** — generate and download tenant-level reports: payroll register, BURS submission (ITW-7, ITW-10, ITW-8), Excel exports, QuickBooks journals.
- **SettingsPage** — company profile, banking details, plan & billing, branding for payslips, e-TAX registration number.

## Conventions

- Routes are guarded by `RequireRole("client")` and `RequireTenant` middleware.
- Tenant ID is taken from `TenantContext` — never from the URL or a hidden field.
- Trial accounts have PDF, QuickBooks export, and BURS reports disabled — show an upgrade prompt instead.
