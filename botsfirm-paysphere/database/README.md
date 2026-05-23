# database/

PostgreSQL schema, security policies, seed data, and future migrations for the Supabase project.

## Files

- **schema.sql** — All table definitions. Every business table has a `tenant_id` column.
- **rls-policies.sql** — Supabase Row Level Security policies enforcing tenant isolation, role-based access, and immutability of the audit log.
- **seed.sql** — Test data for local development: one Super Admin, two demo tenants (one trial, one paid), a handful of employees.
- **migrations/** — Future schema changes, applied in order.

## Multi-Tenancy Rules

- Every business table has a `tenant_id` FK to `tenants.id` and a NOT NULL constraint.
- RLS policies restrict SELECT/INSERT/UPDATE/DELETE to rows where `tenant_id = current_tenant()`.
- Super Admin role has policies allowing cross-tenant SELECT but still goes through the audit log.

## Audit Log Rules

- `audit_log` table has policies that **deny UPDATE and DELETE to all roles**, including Super Admin and the database owner — enforced via revoked grants.
- Append-only by design. Retention: 5 years.

## Apply Order

1. `schema.sql`
2. `rls-policies.sql`
3. `seed.sql` (dev only)
4. Anything in `migrations/`, in filename order.
