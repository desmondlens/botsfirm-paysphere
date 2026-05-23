// trial.service.js
// Trial lifecycle management.
//
// Responsibilities:
//   - Create a trial tenant on self-service signup (7-day window).
//   - Enforce limits: 5 employees max, 1 payroll run max, PDF/QB/BURS locked.
//   - Send reminder emails at day 1, 3, 6, 7, and 8.
//   - Mark expired trials at day 7 + 1, then preserve data for 30 days.
//   - Support Super Admin conversion to paid plan, preserving all records.
// To be implemented.
