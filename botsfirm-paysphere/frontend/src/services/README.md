# services/

Thin wrappers around backend API endpoints. One file per resource.

## Examples

- **auth.service.js** — login, logout, password reset, invite redemption.
- **employee.service.js** — CRUD for employees.
- **payroll.service.js** — create payroll run, fetch history, finalize, download.
- **leave.service.js** — request, approve, list balances.
- **reports.service.js** — request report generation, fetch download URLs.
- **tenant.service.js** — tenant settings, plan info.
- **superadmin.service.js** — platform-wide operations.
- **api.client.js** — base axios/fetch instance with auth header injection, tenant header injection, and centralized error handling.

## Conventions

- Services return parsed data, never raw `Response` objects.
- Errors are normalized into `{ code, message, fieldErrors? }`.
- No React state in here — services are pure async functions.
