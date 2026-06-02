/**
 * Botsfirm PaySphere — Download Routes
 * Handles PDF payslip and Excel report downloads
 */

'use strict';

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { generatePayslipPDF } = require('../services/pdf.service');
const { generateQuickBooksExcel, generateITW7Excel } = require('../services/excel.service');
const { generateJournalEntries } = require('../services/payroll.service');

// ─── Download Payslip PDF ─────────────────────────────────────────────────────

router.get('/payslip/:payslipId', verifyToken, async (req, res) => {
  try {
    const { payslipId } = req.params;

    // Fetch payslip
    const { data: payslip, error: payslipError } = await req.supabase
      .from('payslips')
      .select('*')
      .eq('id', payslipId)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (payslipError || !payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    // Employees can only download their own payslips
    if (req.user.role === 'employee') {
      const { data: employee } = await req.supabase
        .from('employees')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('tenant_id', req.user.tenant_id)
        .single();

      if (payslip.employee_id !== employee?.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!payslip.is_visible_to_employee) {
        return res.status(403).json({ error: 'Payslip not yet released' });
      }
    }

    // Fetch employee details
    const { data: employee } = await req.supabase
      .from('employees')
      .select('*')
      .eq('id', payslip.employee_id)
      .single();

    // Fetch tenant details
    const { data: tenant } = await req.supabase
      .from('tenants')
      .select('company_name, burs_number, address, city, phone')
      .eq('id', req.user.tenant_id)
      .single();

    // Fetch allowance and deduction breakdown
    const { data: empAllowances } = await req.supabase
      .from('employee_allowances')
      .select('*, allowance_templates(name, is_taxable)')
      .eq('employee_id', payslip.employee_id)
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true);

    const { data: empDeductions } = await req.supabase
      .from('employee_deductions')
      .select('*, deduction_templates(name)')
      .eq('employee_id', payslip.employee_id)
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true);

    const allowanceBreakdown = (empAllowances || []).map(a => ({
      name: a.allowance_templates?.name || 'Allowance',
      amount: a.amount,
      is_taxable: a.allowance_templates?.is_taxable ?? false,
    }));

    const deductionBreakdown = (empDeductions || []).map(d => ({
      name: d.deduction_templates?.name || 'Deduction',
      amount: d.amount,
    }));

    // Generate PDF
    const pdfBuffer = await generatePayslipPDF(
      payslip,
      employee,
      tenant,
      allowanceBreakdown,
      deductionBreakdown
    );

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'PAYSLIP_DOWNLOADED',
      entity_type: 'payslip',
      entity_id: payslipId,
      ip_address: req.ip,
      status: 'success',
    });

    // Send PDF
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const filename = `Payslip_${employee.full_name.replace(/\s/g, '_')}_${monthNames[(payslip.pay_period_month || 1) - 1]}_${payslip.pay_period_year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (err) {
    console.error('[download] payslip PDF error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Download QuickBooks Excel ────────────────────────────────────────────────

router.get('/quickbooks/:payrollRunId', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { payrollRunId } = req.params;

    // Fetch payroll run
    const { data: payrollRun, error } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', payrollRunId)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error || !payrollRun) {
      return res.status(404).json({ error: 'Payroll run not found' });
    }

    // Fetch tenant
    const { data: tenant } = await req.supabase
      .from('tenants')
      .select('company_name, burs_number')
      .eq('id', req.user.tenant_id)
      .single();

    const payDate = new Date(
      payrollRun.pay_period_year,
      payrollRun.pay_period_month - 1,
      28
    ).toLocaleDateString('en-BW');

    const journalData = generateJournalEntries({
      pay_period: `${payrollRun.pay_period_month}/${payrollRun.pay_period_year}`,
      total_gross_pay: payrollRun.total_gross,
      total_paye: payrollRun.total_paye,
      total_other_deductions: payrollRun.total_deductions,
      total_net_pay: payrollRun.total_net,
    }, payDate);

    const excelBuffer = await generateQuickBooksExcel(
      journalData,
      tenant,
      {
        month: payrollRun.pay_period_month,
        year: payrollRun.pay_period_year,
      }
    );

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'QUICKBOOKS_EXPORTED',
      entity_type: 'payroll_run',
      entity_id: payrollRunId,
      ip_address: req.ip,
      status: 'success',
    });

    const filename = `QuickBooks_Journal_${payrollRun.pay_period_month}_${payrollRun.pay_period_year}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    res.send(excelBuffer);

  } catch (err) {
    console.error('[download] quickbooks Excel error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Download ITW-7 Excel ─────────────────────────────────────────────────────

router.get('/itw7', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Fetch tenant
    const { data: tenant } = await req.supabase
      .from('tenants')
      .select('company_name, burs_number')
      .eq('id', req.user.tenant_id)
      .single();

    // Fetch payroll run
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

    // Fetch payslips with employee details
    const { data: payslips } = await req.supabase
      .from('payslips')
      .select('*, employees(full_name, burs_tin, nationality_status)')
      .eq('payroll_run_id', payrollRun.id)
      .eq('tenant_id', req.user.tenant_id);

    const reportData = {
      period: { month, year },
      due_date: new Date(year, month, 15).toLocaleDateString('en-BW'),
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
      },
    };

    const excelBuffer = await generateITW7Excel(reportData, tenant);

    const filename = `ITW7_${month}_${year}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    res.send(excelBuffer);

  } catch (err) {
    console.error('[download] ITW-7 Excel error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;