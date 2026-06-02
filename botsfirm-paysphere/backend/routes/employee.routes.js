/**
 * Botsfirm PaySphere — Employee Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');

// ─── Get employee profile ─────────────────────────────────────────────────────

router.get('/profile', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('employees')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Employee profile not found' });

    res.json({ employee: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get current payslip ──────────────────────────────────────────────────────

router.get('/payslip/current', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    // Get employee record
    const { data: employee, error: empError } = await req.supabase
      .from('employees')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (empError) throw empError;

    // Get most recent visible payslip
    const { data, error } = await req.supabase
      .from('payslips')
      .select(`
        *,
        payroll_runs(pay_period_month, pay_period_year, run_date, status),
        employees(full_name, employee_number, job_title, department,
          nationality_status, bank_name, bank_account_number,
          burs_tin, id_number)
      `)
      .eq('employee_id', employee.id)
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_visible_to_employee', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return res.json({ payslip: null, message: 'No payslip available yet' });

    res.json({ payslip: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get payslip history ──────────────────────────────────────────────────────

router.get('/payslip/history', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { data: employee } = await req.supabase
      .from('employees')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    const { data, error } = await req.supabase
      .from('payslips')
      .select('*, payroll_runs(pay_period_month, pay_period_year, run_date)')
      .eq('employee_id', employee.id)
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_visible_to_employee', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ payslips: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get leave requests ───────────────────────────────────────────────────────

router.get('/leave', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { data: employee } = await req.supabase
      .from('employees')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    const { data, error } = await req.supabase
      .from('leave_requests')
      .select('*, leave_types(name, code)')
      .eq('employee_id', employee.id)
      .eq('tenant_id', req.user.tenant_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ requests: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Apply for leave ──────────────────────────────────────────────────────────

router.post('/leave', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { leave_type_id, start_date, end_date, days_requested, reason } = req.body;

    if (!leave_type_id || !start_date || !end_date || !days_requested) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: employee } = await req.supabase
      .from('employees')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    // Check leave balance
    const { data: balance } = await req.supabase
      .from('leave_balances')
      .select('remaining_balance')
      .eq('employee_id', employee.id)
      .eq('leave_type_id', leave_type_id)
      .eq('year', new Date().getFullYear())
      .single();

    if (balance && balance.remaining_balance < days_requested) {
      return res.status(400).json({
        error: `Insufficient leave balance. Available: ${balance.remaining_balance} days`,
      });
    }

    const { data, error } = await req.supabase
      .from('leave_requests')
      .insert({
        tenant_id: req.user.tenant_id,
        employee_id: employee.id,
        leave_type_id,
        start_date,
        end_date,
        days_requested,
        reason,
        status: 'pending',
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ request: data, message: 'Leave request submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get leave balances ───────────────────────────────────────────────────────

router.get('/leave/balances', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { data: employee } = await req.supabase
      .from('employees')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    const { data, error } = await req.supabase
      .from('leave_balances')
      .select('*, leave_types(name, code, days_entitlement)')
      .eq('employee_id', employee.id)
      .eq('tenant_id', req.user.tenant_id)
      .eq('year', new Date().getFullYear());

    if (error) throw error;
    res.json({ balances: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Change password ──────────────────────────────────────────────────────────

router.post('/change-password', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain a number' });
    }

    // Get current password hash
    const { data: user, error: userError } = await req.supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (userError) throw userError;

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error: updateError } = await req.supabase
      .from('users')
      .update({
        password_hash,
        first_login: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'PASSWORD_CHANGED',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: req.ip,
      status: 'success',
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;