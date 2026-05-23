// leave.model.js
// Accessors for leave-related tables.
//
// Tables:
//   - leave_requests: id, tenant_id, employee_id, type (annual|sick|maternity|paternity|family),
//     start_date, end_date, days, status (pending|admin_approved|approved|rejected),
//     admin_approved_by, admin_approved_at, client_approved_by, client_approved_at.
//   - leave_balances: id, tenant_id, employee_id, type, accrued, used, available, year.
// To be implemented.
