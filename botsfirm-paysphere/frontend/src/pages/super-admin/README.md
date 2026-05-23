# pages/super-admin/

Screens for the platform owner. Super Admin has visibility across all tenants on the platform.

## Pages

- **SuperAdminDashboard** — high-level KPIs: total tenants, active trials, MRR, recent signups, conversion rate.
- **ClientsPage** — list of all paying tenants. Create, suspend, reactivate, or convert from trial.
- **ClientDetailPage** — drill into a single tenant: users, payroll history, plan, billing status.
- **TrialsPage** — list of all active and expired trials, days remaining, employee counts.
- **AuditPage** — platform-wide audit log; permanent, searchable, filterable by tenant, user, and action.

## Conventions

- Routes are guarded by a `RequireRole("super_admin")` wrapper.
- All actions taken here are themselves logged to the audit trail.
- Trial-to-paid conversions preserve every record — no data migration step required.
