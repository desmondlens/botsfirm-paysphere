/**
 * Botsfirm PaySphere — Reports Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { generateJournalEntries } = require('../services/payroll.service');

// ─── ITW-7 Monthly Return ─────────────────────────────────────────────────────

router.get('/itw7', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get tenant details
    const { data: tenant } = await req.supabase
      .from('tenants')
      .select('company_name, burs_number')
      .eq('id', req.user.tenant_id)
      .single();

    // Get payroll run
    const { data: payrollRun } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('pay_period_month', month)
      .eq('pay_period_year', year)
      .single();

    if (!payrollRun) {
      return res.status(404).json({ error: 'No payroll run found for this period' });
    }

    // Get payslips with employee details
    const { data: payslips } = await req.supabase
      .from('payslips')
      .select('*, employees(full_name, burs_tin, nationality_status)')
      .eq('payroll_run_id', payrollRun.id)
      .eq('tenant_id', req.user.tenant_id);

    const dueDate = new Date(year, month, 15);

    res.json({
      report_type: 'ITW-7',
      period: { month, year },
      due_date: dueDate.toLocaleDateString('en-BW'),
      company: {
        name: tenant?.company_name,
        burs_number: tenant?.burs_number,
      },
      employees: (payslips || []).map(p => ({
        full_name: p.employees?.full_name,
        burs_tin: p.employees?.burs_tin,
        nationality: p.employees?.nationality_status,
        gross_income: p.gross_taxable_income,
        paye_withheld: p.paye_amount,
      })),
      totals: {
        total_gross: payrollRun.total_gross,
        total_paye: payrollRun.total_paye,
        employee_count: payrollRun.employee_count,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ITW-10 Annual Return ─────────────────────────────────────────────────────

router.get('/itw10', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const { data: tenant } = await req.supabase
      .from('tenants')
      .select('company_name, burs_number')
      .eq('id', req.user.tenant_id)
      .single();

    const { data: runs } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('pay_period_year', year)
      .order('pay_period_month', { ascending: true });

    const totals = (runs || []).reduce((acc, run) => ({
      total_gross: acc.total_gross + (run.total_gross || 0),
      total_paye: acc.total_paye + (run.total_paye || 0),
      months_filed: acc.months_filed + 1,
    }), { total_gross: 0, total_paye: 0, months_filed: 0 });

    res.json({
      report_type: 'ITW-10',
      tax_year: `${year - 1}/${year}`,
      due_date: `30 September ${year}`,
      company: {
        name: tenant?.company_name,
        burs_number: tenant?.burs_number,
      },
      monthly_runs: runs || [],
      totals,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ITW-8 Employee Certificate ───────────────────────────────────────────────

router.get('/itw8/:employeeId', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const { data: tenant } = await req.supabase
      .from('tenants')
      .select('company_name, burs_number')
      .eq('id', req.user.tenant_id)
      .single();

    const { data: employee } = await req.supabase
      .from('employees')
      .select('full_name, burs_tin, id_number, nationality_status, job_title')
      .eq('id', req.params.employeeId)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const { data: payslips } = await req.supabase
      .from('payslips')
      .select('*, payroll_runs(pay_period_month, pay_period_year)')
      .eq('employee_id', req.params.employeeId)
      .eq('tenant_id', req.user.tenant_id)
      .filter('payroll_runs.pay_period_year', 'eq', year);

    const annualGross = (payslips || []).reduce((s, p) => s + (p.gross_taxable_income || 0), 0);
    const annualPAYE = (payslips || []).reduce((s, p) => s + (p.paye_amount || 0), 0);

    res.json({
      report_type: 'ITW-8',
      tax_year: `${year - 1}/${year}`,
      due_date: `30 September ${year}`,
      company: {
        name: tenant?.company_name,
        burs_number: tenant?.burs_number,
      },
      employee: {
        full_name: employee.full_name,
        burs_tin: employee.burs_tin,
        id_number: employee.id_number,
        nationality_status: employee.nationality_status,
        job_title: employee.job_title,
      },
      annual_gross: annualGross,
      annual_paye: annualPAYE,
      months: payslips?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── QuickBooks Journal Export ────────────────────────────────────────────────

router.get('/quickbooks', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const { data: payrollRun } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('pay_period_month', month)
      .eq('pay_period_year', year)
      .single();

    if (!payrollRun) {
      return res.status(404).json({ error: 'No payroll run found for this period' });
    }

    const payDate = new Date(year, month - 1, 28).toLocaleDateString('en-BW');

    const journal = generateJournalEntries({
      pay_period: `${month}/${year}`,
      total_gross_pay: payrollRun.total_gross,
      total_paye: payrollRun.total_paye,
      total_other_deductions: payrollRun.total_deductions,
      total_net_pay: payrollRun.total_net,
    }, payDate);

    res.json({ journal, pay_period: { month, year } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;