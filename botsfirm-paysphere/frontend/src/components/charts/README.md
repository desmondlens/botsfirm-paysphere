# components/charts/

Data visualization components used on dashboards across all roles.

## What goes here

- **PayrollTrendChart** — monthly payroll totals over time.
- **HeadcountChart** — employees by department or status.
- **LeaveBalanceChart** — remaining annual/sick leave per employee.
- **TaxBreakdownChart** — PAYE vs net pay distribution.
- **TenantGrowthChart** — Super Admin view of trial vs paid clients over time.

## Conventions

- Use a single charting library (e.g., Recharts) consistently.
- Colors must match the design system — primary `#2B6CB0` for series 1, success/warning/error tokens for status-based series.
- All charts have an empty state and loading skeleton.
- Charts are pure — they receive data as props and render. Data fetching belongs in the page or a hook.
