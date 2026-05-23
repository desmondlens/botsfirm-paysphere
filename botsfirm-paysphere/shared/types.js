// types.js
// Shared data shapes used in API contracts between frontend and backend.
// Expressed as JSDoc typedefs so they work in plain JS on both sides.
//
// Typedefs to define:
//   - Role:           'super_admin' | 'client' | 'admin' | 'employee'
//   - PlanStatus:     'trial' | 'paid' | 'expired' | 'suspended'
//   - Tenant:         { id, name, plan, trialExpiresAt?, ... }
//   - User:           { id, tenantId?, role, email?, username?, ... }
//   - Employee:       { id, tenantId, userId, employeeNumber, citizen, baseSalary, ... }
//   - PayrollRun:     { id, tenantId, periodStart, periodEnd, status, totals, ... }
//   - Payslip:        { id, payrollRunId, employeeId, gross, paye, sdl, net, ... }
//   - LeaveType:      'annual' | 'sick' | 'maternity' | 'paternity' | 'family'
//   - LeaveRequest:   { id, tenantId, employeeId, type, startDate, endDate, status, ... }
//   - LeaveBalance:   { employeeId, type, accrued, used, available }
//   - AuditEntry:     { id, tenantId, userId, action, resourceType, resourceId, before, after, ... }
//   - TrialStatus:    { tenantId, startedAt, expiresAt, employeesUsed, payrollRunsUsed, locked: {...} }
// To be implemented.
