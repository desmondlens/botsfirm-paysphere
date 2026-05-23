# middleware/

Express middleware that runs on every request before reaching a controller.

## Files

- **auth.middleware.js** — validates the Supabase JWT, attaches `req.user` (id, role, email/username, tenant_id). Rejects with 401 if invalid.
- **tenant.middleware.js** — resolves the active tenant. For Super Admin, supports an `X-Tenant-Id` header override to drill into a tenant; for everyone else, the tenant is locked to the user's own. Attaches `req.tenant`.
- **role.middleware.js** — factory: `requireRole('admin', 'client')`. Rejects with 403 if `req.user.role` isn't permitted.
- **audit.middleware.js** — wraps mutating endpoints. After the controller succeeds, records `{ tenant_id, user_id, action, resource, before, after, ip, user_agent, timestamp }` to the audit table.
- **rateLimit.middleware.js** — basic per-IP and per-user rate limiting.
- **error.middleware.js** — catches thrown errors and converts them into the normalized error shape.

## Conventions

- Order matters: `auth → tenant → role → rateLimit → controller → audit → error`.
- The audit middleware never silently fails — if it can't write the audit row, the request is rolled back.
