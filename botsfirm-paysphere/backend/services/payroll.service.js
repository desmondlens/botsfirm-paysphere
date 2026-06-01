/**
 * Botsfirm PaySphere — Payroll Service
 * Full payroll computation layer.
 * Calls paye.service.js for all PAYE calculations.
 * MUST NOT define tax brackets or calculate PAYE manually.
 *
 * NAMING STANDARD (backend canonical):
 * employee_id, employee_number, full_name,
 * nationality_status, basic_salary
 * Frontend must adapt to this standard.
 */

const { calculateMonthlyPAYE } = require('./paye.service');
const { validateMinimumWage } = require('../utils/taxBrackets');

/**
 * Calculate a single employee payslip
 * @param {object} employee - Employee record (backend canonical naming)
 * @param {Array} allowances - Employee allowances
 * @param {Array} deductions - Employee deductions
 * @returns {object} Complete payslip data
 */
const calculatePayslip = (employee, allowances, deductions) => {

  // FIX 1 — Defensive input validation
  allowances = Array.isArray(allowances) ? allowances : [];
  deductions = Array.isArray(deductions) ? deductions : [];

  // Validate minimum wage
  const wageCheck = validateMinimumWage(employee.basic_salary);
  if (!wageCheck.valid) {
    console.warn(`Warning: ${employee.full_name} — ${wageCheck.message}`);
  }

  // Split allowances into taxable and non-taxable
  const taxableAllowances = allowances
    .filter(a => a.is_taxable === true && a.is_active !== false)
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  const nonTaxableAllowances = allowances
    .filter(a => a.is_taxable === false && a.is_active !== false)
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  // Gross taxable income — PAYE base only
  // Rule: basic_salary + taxable allowances
  // Non-taxable allowances are excluded from PAYE base
  const grossTaxableIncome = Number(employee.basic_salary || 0) + taxableAllowances;

  // FIX 2 — Safe PAYE extraction with fallback
  const payeResult = calculateMonthlyPAYE(grossTaxableIncome, employee.nationality_status);
  const paye = payeResult?.monthlyPAYE || 0;
  const annualPAYE = payeResult?.annualPAYE || 0;
  const effectiveRate = payeResult?.effectiveRate || 0;

  // Other deductions — loans, medical aid, union fees etc
  const totalOtherDeductions = deductions
    .filter(d => d.is_active !== false)
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  // Gross pay — basic + all allowances (taxable and non-taxable)
  const grossPay = grossTaxableIncome + nonTaxableAllowances;

  // Net pay — gross minus PAYE minus other deductions
  const netPay = grossPay - paye - totalOtherDeductions;

  // Prevent negative net pay
  if (netPay < 0) {
    throw new Error(
      `Net pay for ${employee.full_name} is negative (BWP ${netPay.toFixed(2)}). Review deductions.`
    );
  }

  return {
    // FIX 3 — Canonical naming used throughout
    employee_id: employee.id,
    employee_number: employee.employee_number,
    full_name: employee.full_name,
    nationality_status: employee.nationality_status,
    basic_salary: Number(employee.basic_salary),
    taxable_allowances: Number(taxableAllowances.toFixed(2)),
    non_taxable_allowances: Number(nonTaxableAllowances.toFixed(2)),
    gross_taxable_income: Number(grossTaxableIncome.toFixed(2)),
    gross_pay: Number(grossPay.toFixed(2)),
    paye_amount: paye,
    annual_paye: annualPAYE,
    effective_tax_rate: effectiveRate,
    other_deductions: Number(totalOtherDeductions.toFixed(2)),
    total_deductions: Number((paye + totalOtherDeductions).toFixed(2)),
    net_pay: Number(netPay.toFixed(2)),
    allowance_breakdown: allowances
      .filter(a => a.is_active !== false)
      .map(a => ({
        name: a.name,
        amount: Number(a.amount || 0),
        is_taxable: a.is_taxable,
      })),
    deduction_breakdown: deductions
      .filter(d => d.is_active !== false)
      .map(d => ({
        name: d.name,
        amount: Number(d.amount || 0),
      })),
  };
};

/**
 * Calculate full payroll run for all employees
 * @param {Array} employees - Array of employee records
 * @param {object} allowanceMap - { employee_id: [allowances] }
 * @param {object} deductionMap - { employee_id: [deductions] }
 * @param {string} payPeriodMonth - e.g. "2026-05"
 * @returns {object} Complete payroll run data
 */
const calculatePayrollRun = (employees, allowanceMap, deductionMap, payPeriodMonth) => {

  // FIX 1 — Defensive input validation
  employees = Array.isArray(employees) ? employees : [];
  allowanceMap = allowanceMap && typeof allowanceMap === 'object' ? allowanceMap : {};
  deductionMap = deductionMap && typeof deductionMap === 'object' ? deductionMap : {};

  const payslips = [];
  const errors = [];

  for (const employee of employees) {
    try {
      const allowances = allowanceMap[employee.id] || [];
      const deductions = deductionMap[employee.id] || [];
      const payslip = calculatePayslip(employee, allowances, deductions);
      payslips.push(payslip);
    } catch (err) {
      errors.push({
        employee_id: employee.id,
        full_name: employee.full_name,
        error: err.message,
      });
    }
  }

  // Payroll totals
  const totals = payslips.reduce((acc, p) => ({
    total_gross_pay: Number((acc.total_gross_pay + p.gross_pay).toFixed(2)),
    total_taxable_income: Number((acc.total_taxable_income + p.gross_taxable_income).toFixed(2)),
    total_paye: Number((acc.total_paye + p.paye_amount).toFixed(2)),
    total_other_deductions: Number((acc.total_other_deductions + p.other_deductions).toFixed(2)),
    total_net_pay: Number((acc.total_net_pay + p.net_pay).toFixed(2)),
    employee_count: acc.employee_count + 1,
  }), {
    total_gross_pay: 0,
    total_taxable_income: 0,
    total_paye: 0,
    total_other_deductions: 0,
    total_net_pay: 0,
    employee_count: 0,
  });

  return {
    pay_period: payPeriodMonth,
    generated_at: new Date().toISOString(),
    status: errors.length > 0 ? 'completed_with_errors' : 'completed',
    ...totals,
    payslips,
    errors,
  };
};

/**
 * Generate QuickBooks journal entry for a payroll run
 * @param {object} payrollRun - Result of calculatePayrollRun
 * @param {string} payDate - Payment date string
 * @returns {object} { entries, total_debits, total_credits, balanced }
 */
const generateJournalEntries = (payrollRun, payDate) => {
  const entries = [
    {
      date: payDate,
      account: 'Salaries & Wages Expense',
      description: `Gross salaries ${payrollRun.pay_period}`,
      debit: payrollRun.total_gross_pay,
      credit: 0,
    },
    {
      date: payDate,
      account: 'PAYE Payable',
      description: `PAYE withheld ${payrollRun.pay_period}`,
      debit: 0,
      credit: payrollRun.total_paye,
    },
    {
      date: payDate,
      account: 'Other Deductions Payable',
      description: `Employee deductions ${payrollRun.pay_period}`,
      debit: 0,
      credit: payrollRun.total_other_deductions,
    },
    {
      date: payDate,
      account: 'Net Salaries Payable',
      description: `Net pay to employees ${payrollRun.pay_period}`,
      debit: 0,
      credit: payrollRun.total_net_pay,
    },
  ];

  const totalDebits = Number(entries.reduce((s, e) => s + e.debit, 0).toFixed(2));
  const totalCredits = Number(entries.reduce((s, e) => s + e.credit, 0).toFixed(2));

  return {
    entries,
    total_debits: totalDebits,
    total_credits: totalCredits,
    balanced: Math.abs(totalDebits - totalCredits) < 0.01,
  };
};

module.exports = {
  calculatePayslip,
  calculatePayrollRun,
  generateJournalEntries,
};