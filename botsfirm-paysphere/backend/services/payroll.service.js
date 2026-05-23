// payroll.service.js
// End-to-end payroll processing for a single tenant per pay period.
//
// Responsibilities:
//   - Gather active employees, allowances, deductions for the period.
//   - Compute gross pay, taxable income, PAYE (via paye.service), SDL, net pay.
//   - Apply overtime rules: 150% multiplier, capped at 14 hrs/week.
//   - Enforce minimum wage: BWP 9.06/hour.
//   - Persist payroll run + payslips with full audit trail.
//   - Honor trial caps: max 1 payroll run during trial.
// To be implemented.
