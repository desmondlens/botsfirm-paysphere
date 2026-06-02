/**
 * Botsfirm PaySphere — Payroll Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { calculatePayrollRun, generateJournalEntries } = require('../services/payroll.service');

// ─── Get current payroll ──────────────────────────────────────────────────────

router.get('/current', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check if payroll run exists for current period
    const { data: existing } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('pay_period_month', month)
      .eq('pay_period_year', year)
      .single();

    if (existing) {
      // Fetch payslips for this run
      const { data: payslips } = await req.supabase
        .from('payslips')
        .select('*, employees(full_name, employee_number, nationality_status)')
        .eq('payroll_run_id', existing.id)
        .eq('tenant_id', req.user.tenant_id);

      return res.json({
        pay_period: `${now.toLocaleString('en-BW', { month: 'long' })} ${year}`,
        status: existing.status,
        summary: {
          total_gross_pay: existing.total_gross,
          total_paye: existing.total_paye,
          total_other_deductions: existing.total_deductions,
          total_net_pay: existing.total_net,
          employee_count: existing.employee_count,
        },
        payslips: payslips || [],
        errors: [],
      });
    }

    // No payroll run yet — calculate preview
    const { data: employees, error: empError } = await req.supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true);

    if (empError) throw empError;

    // Fetch allowances and deductions for each employee
    const allowanceMap = {};
    const deductionMap = {};

    for (const emp of employees) {
      const { data: allowances } = await req.supabase
        .from('employee_allowances')
        .select('*, allowance_templates(name, is_taxable)')
        .eq('employee_id', emp.id)
        .eq('tenant_id', req.user.tenant_id)
        .eq('is_active', true);

      const { data: deductions } = await req.supabase
        .from('employee_deductions')
        .select('*, deduction_templates(name)')
        .eq('employee_id', emp.id)
        .eq('tenant_id', req.user.tenant_id)
        .eq('is_active', true);

      allowanceMap[emp.id] = (allowances || []).map(a => ({
        name: a.allowance_templates?.name || a.name,
        amount: a.amount,
        is_taxable: a.allowance_templates?.is_taxable ?? a.is_taxable,
        is_active: true,
      }));

      deductionMap[emp.id] = (deductions || []).map(d => ({
        name: d.deduction_templates?.name || d.name,
        amount: d.amount,
        is_active: true,
      }));
    }

    const payPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const result = calculatePayrollRun(employees, allowanceMap, deductionMap, payPeriod);

    res.json({
      pay_period: `${now.toLocaleString('en-BW', { month: 'long' })} ${year}`,
      status: 'draft',
      summary: {
        total_gross_pay: result.total_gross_pay,
        total_paye: result.total_paye,
        total_other_deductions: result.total_other_deductions,
        total_net_pay: result.total_net_pay,
        employee_count: result.employee_count,
      },
      payslips: result.payslips,
      errors: result.errors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Run payroll ──────────────────────────────────────────────────────────────

router.post('/run', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check payroll not already run
    const { data: existing } = await req.supabase
      .from('payroll_runs')
      .select('id, status')
      .eq('tenant_id', req.user.tenant_id)
      .eq('pay_period_month', month)
      .eq('pay_period_year', year)
      .single();

    if (existing) {
      return res.status(400).json({ error: `Payroll for this period already exists with status: ${existing.status}` });
    }

    // Fetch employees
    const { data: employees, error: empError } = await req.supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true);

    if (empError) throw empError;
    if (!employees || employees.length === 0) {
      return res.status(400).json({ error: 'No active employees found' });
    }

    // Fetch allowances and deductions
    const allowanceMap = {};
    const deductionMap = {};

    for (const emp of employees) {
      const { data: allowances } = await req.supabase
        .from('employee_allowances')
        .select('*, allowance_templates(name, is_taxable)')
        .eq('employee_id', emp.id)
        .eq('tenant_id', req.user.tenant_id)
        .eq('is_active', true);

      const { data: deductions } = await req.supabase
        .from('employee_deductions')
        .select('*, deduction_templates(name)')
        .eq('employee_id', emp.id)
        .eq('tenant_id', req.user.tenant_id)
        .eq('is_active', true);

      allowanceMap[emp.id] = (allowances || []).map(a => ({
        name: a.allowance_templates?.name || a.name,
        amount: a.amount,
        is_taxable: a.allowance_templates?.is_taxable ?? a.is_taxable,
        is_active: true,
      }));

      deductionMap[emp.id] = (deductions || []).map(d => ({
        name: d.deduction_templates?.name || d.name,
        amount: d.amount,
        is_active: true,
      }));
    }

    const payPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const result = calculatePayrollRun(employees, allowanceMap, deductionMap, payPeriod);

    if (result.errors.length > 0) {
      return res.status(400).json({
        error: 'Payroll calculation errors',
        details: result.errors,
      });
    }

    // Save payroll run
    const { data: payrollRun, error: runError } = await req.supabase
      .from('payroll_runs')
      .insert({
        tenant_id: req.user.tenant_id,
        pay_period_month: month,
        pay_period_year: year,
        run_date: new Date().toISOString(),
        status: 'processing',
        total_gross: result.total_gross_pay,
        total_paye: result.total_paye,
        total_sdl: 0,
        total_deductions: result.total_other_deductions,
        total_net: result.total_net_pay,
        employee_count: result.employee_count,
        run_by: req.user.id,
      })
      .select()
      .single();

    if (runError) throw runError;

    // Save individual payslips
    for (const payslip of result.payslips) {
      await req.supabase.from('payslips').insert({
        tenant_id: req.user.tenant_id,
        payroll_run_id: payrollRun.id,
        employee_id: payslip.employee_id,
        pay_period_month: month,
        pay_period_year: year,
        basic_salary: payslip.basic_salary,
        total_taxable_allowances: payslip.taxable_allowances,
        total_non_taxable_allowances: payslip.non_taxable_allowances,
        gross_taxable_income: payslip.gross_taxable_income,
        paye_amount: payslip.paye_amount,
        sdl_amount: 0,
        total_deductions: payslip.total_deductions,
        net_pay: payslip.net_pay,
        nationality_status: payslip.nationality_status,
        tax_table_used: payslip.nationality_status === 'citizen' || payslip.nationality_status === 'resident_non_citizen' ? 'resident' : 'non_resident',
        is_visible_to_employee: false,
      });
    }

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'PAYROLL_RUN',
      entity_type: 'payroll',
      entity_id: payrollRun.id,
      new_values: { month, year, total_net: result.total_net_pay },
      ip_address: req.ip,
      status: 'success',
    });

    res.status(201).json({
      message: 'Payroll run successfully',
      payroll_run_id: payrollRun.id,
      pay_period: `${now.toLocaleString('en-BW', { month: 'long' })} ${year}`,
      status: 'processing',
      summary: {
        total_gross_pay: result.total_gross_pay,
        total_paye: result.total_paye,
        total_other_deductions: result.total_other_deductions,
        total_net_pay: result.total_net_pay,
        employee_count: result.employee_count,
      },
      payslips: result.payslips,
      errors: [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Approve payroll ──────────────────────────────────────────────────────────

router.put('/:id/approve', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('payroll_runs')
      .update({
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;

    // Make payslips visible to employees
    await req.supabase
      .from('payslips')
      .update({ is_visible_to_employee: true })
      .eq('payroll_run_id', req.params.id)
      .eq('tenant_id', req.user.tenant_id);

    res.json({ message: 'Payroll approved', payroll_run: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Mark as paid ─────────────────────────────────────────────────────────────

router.put('/:id/paid', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('payroll_runs')
      .update({
        status: 'paid',
        locked_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Payroll marked as paid', payroll_run: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Payroll history ──────────────────────────────────────────────────────────

router.get('/history', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;
    res.json({ history: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── QuickBooks journal export ────────────────────────────────────────────────

router.get('/quickbooks/:id', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data: run, error } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error) throw error;
    if (!run) return res.status(404).json({ error: 'Payroll run not found' });

    const payDate = new Date(run.run_date).toLocaleDateString('en-BW');
    const journal = generateJournalEntries({
      pay_period: `${run.pay_period_month}/${run.pay_period_year}`,
      total_gross_pay: run.total_gross,
      total_paye: run.total_paye,
      total_other_deductions: run.total_deductions,
      total_net_pay: run.total_net,
    }, payDate);

    res.json({ journal, payroll_run: run });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Employee payslips ────────────────────────────────────────────────────────

router.get('/payslips/:id', verifyToken, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('payslips')
      .select('*, employees(full_name, employee_number, job_title, department, nationality_status, bank_name, bank_account_number, burs_tin, id_number)')
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Payslip not found' });

    res.json({ payslip: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;