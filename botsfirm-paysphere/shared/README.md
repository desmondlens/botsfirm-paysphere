# shared/

Cross-cutting code consumed by **both** the frontend and the backend. Single source of truth for values that must stay consistent across the stack.

## Files

- **constants.js** — Plan limits (trial: 5 employees, 1 payroll run; data retention 30 days), leave entitlements, statutory rates, role names, action codes used in the audit log.
- **types.js** — Shared data shapes used in API contracts: `User`, `Tenant`, `Employee`, `PayrollRun`, `Payslip`, `LeaveRequest`, `AuditEntry`, `TrialStatus`. (TypeScript-style JSDoc typedefs so it works in both JS environments.)

## Conventions

- Never import from `frontend/` or `backend/` here — `shared/` must remain dependency-free.
- No I/O, no environment-specific code (no `process.env`, no `window`).
- Values here are the source of truth. If a number changes (e.g., trial employee cap), it changes in `constants.js` and both apps follow.
