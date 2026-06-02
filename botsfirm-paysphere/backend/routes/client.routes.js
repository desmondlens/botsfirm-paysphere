/**
 * Botsfirm PaySphere — Client Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const bcrypt = require('bcryptjs');

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get('/dashboard', verifyToken, requireRole('client'), async (req, res) => {
  try {
    // Employee count
    const { count: employeeCount } = await req.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true);

    // Pending leave count
    const { count: pendingLeave } = await req.supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.user.tenant_id)
      .eq('status', 'pending');

    // Current payroll run
    const now = new Date();
    const { data: payrollRun } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('pay_period_month', now.getMonth() + 1)
      .eq('pay_period_year', now.getFullYear())
      .single();

    // Expiring work permits
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { count: expiringPermits } = await req.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true)
      .not('work_permit_expiry', 'is', null)
      .lte('work_permit_expiry', thirtyDaysFromNow.toISOString().split('T')[0]);

    res.json({
      employee_count: employeeCount || 0,
      pending_leave: pendingLeave || 0,
      expiring_permits: expiringPermits || 0,
      current_payroll: payrollRun || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admins ───────────────────────────────────────────────────────────────────

router.get('/admins', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('users')
      .select('id, full_name, email, is_active, last_login, created_at')
      .eq('tenant_id', req.user.tenant_id)
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ admins: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admins', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check email not already in use
    const { data: existing } = await req.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data, error } = await req.supabase
      .from('users')
      .insert({
        tenant_id: req.user.tenant_id,
        email,
        full_name,
        password_hash,
        role: 'admin',
        is_active: true,
        first_login: true,
      })
      .select('id, full_name, email, is_active, created_at')
      .single();

    if (error) throw error;

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'ADMIN_CREATED',
      entity_type: 'user',
      entity_id: data.id,
      new_values: { full_name, email },
      ip_address: req.ip,
      status: 'success',
    });

    res.status(201).json({ admin: data, message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admins/:id/toggle', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { data: existing } = await req.supabase
      .from('users')
      .select('is_active, full_name')
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .eq('role', 'admin')
      .single();

    if (!existing) return res.status(404).json({ error: 'Admin not found' });

    const { data, error } = await req.supabase
      .from('users')
      .update({ is_active: !existing.is_active })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select('id, full_name, email, is_active')
      .single();

    if (error) throw error;
    res.json({ admin: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Leave approvals ──────────────────────────────────────────────────────────

router.put('/leave/:id/approve', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { approvalPassword } = req.body;

    if (!approvalPassword) {
      return res.status(400).json({ error: 'Approval password required' });
    }

    // Verify client password
    const { data: user } = await req.supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    const valid = await bcrypt.compare(approvalPassword, user.password_hash);
    if (!valid) {
      // Log failed attempt
      await req.supabase.from('audit_logs').insert({
        tenant_id: req.user.tenant_id,
        user_id: req.user.id,
        user_role: req.user.role,
        action: 'LEAVE_APPROVAL_FAILED',
        entity_type: 'leave_request',
        entity_id: req.params.id,
        ip_address: req.ip,
        status: 'failed',
        notes: 'Incorrect approval password',
      });
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Approve leave
    const { data, error } = await req.supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
        approval_password_used: true,
      })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;

    // Update leave balance
    await req.supabase.rpc('deduct_leave_balance', {
      p_employee_id: data.employee_id,
      p_leave_type_id: data.leave_type_id,
      p_days: data.days_requested,
      p_year: new Date().getFullYear(),
    });

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'LEAVE_APPROVED',
      entity_type: 'leave_request',
      entity_id: req.params.id,
      ip_address: req.ip,
      status: 'success',
    });

    res.json({ request: data, message: 'Leave approved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/leave/:id/reject', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const { data, error } = await req.supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'LEAVE_REJECTED',
      entity_type: 'leave_request',
      entity_id: req.params.id,
      ip_address: req.ip,
      status: 'success',
      notes: reason,
    });

    res.json({ request: data, message: 'Leave rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Payroll overview ─────────────────────────────────────────────────────────

router.get('/payroll', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('payroll_runs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    res.json({ payroll_runs: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Compliance ───────────────────────────────────────────────────────────────

router.get('/compliance', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('compliance_calendar')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .order('due_date', { ascending: true });

    if (error) throw error;

    // Work permit alerts
    const { data: permits } = await req.supabase
      .from('employees')
      .select('full_name, work_permit_number, work_permit_expiry')
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true)
      .not('work_permit_expiry', 'is', null)
      .order('work_permit_expiry', { ascending: true });

    res.json({
      compliance: data || [],
      work_permits: permits || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Audit logs ───────────────────────────────────────────────────────────────

router.get('/audit-logs', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ logs: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Settings ─────────────────────────────────────────────────────────────────

router.put('/settings/company', verifyToken, requireRole('client'), async (req, res) => {
  try {
    const {
      company_name, registration_number, burs_number,
      hrdc_number, address, city, phone, email,
    } = req.body;

    const { data, error } = await req.supabase
      .from('tenants')
      .update({
        company_name,
        registration_number,
        burs_number,
        hrdc_number,
        address,
        city,
        phone,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ tenant: data, message: 'Company details updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;