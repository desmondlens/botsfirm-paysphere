# Backend — Botsfirm PaySphere

Node.js + Express API. Hosted on Railway.

## Purpose

Exposes the REST API consumed by the React frontend. Handles authentication validation, multi-tenant data access, payroll calculations, statutory compliance, document generation, and notification delivery.

## Structure

```
backend/
├── server.js       Main entry point. Boots Express, mounts middleware and routes.
├── config/         Database, email, environment configuration loaders.
├── middleware/     Auth, tenant, role, and audit middleware.
├── routes/         Express route definitions per domain (thin layer).
├── controllers/    HTTP-level request/response handlers per domain.
├── services/       Business logic: PAYE engine, payroll, leave, severance, exports, email.
├── models/         Database table accessors (Supabase / SQL).
└── utils/          Statutory constants and helpers (tax brackets, leave rules, severance).
```

## Request Pipeline

1. `auth.middleware` validates the Supabase JWT and attaches `req.user`.
2. `tenant.middleware` resolves the tenant from `req.user` and attaches `req.tenant`. Super Admin can override via header.
3. `role.middleware` enforces the required role per route.
4. Controller calls into a service. The service performs business logic and uses models to talk to the DB.
5. `audit.middleware` records the action — never skipped, never deleted.

## Required Environment Variables

See the root `.env.example`. Key ones:

```
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
JWT_SECRET, SESSION_TIMEOUT_MINUTES
RESEND_API_KEY, EMAIL_FROM_ADDRESS
TRIAL_DURATION_DAYS, TRIAL_MAX_EMPLOYEES, TRIAL_MAX_PAYROLL_RUNS
```

## Conventions

- Every database query passes through a tenant filter — never trust client-supplied tenant IDs.
- Every mutating action writes to the audit log.
- Errors are returned in a normalized JSON shape: `{ code, message, fieldErrors? }`.
- Statutory math (PAYE, SDL, severance, leave accrual) lives in `services/` and `utils/`, never in controllers.

## Deployment

Deployed to Railway. The `start` script runs `node server.js`.
