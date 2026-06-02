/**
 * Botsfirm PaySphere — Admin Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// ─── Employees ────────────────────────────────────────────────────────────────

router.get('/employees', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ employees: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/employees/:id', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('employees')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Employee not found' });
    res.json({ employee: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/employees', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      first_name, last_name, id_number, nationality_status,
      burs_tin, department, job_title, employment_type,
      contract_start_date, basic_salary, bank_name,
      bank_account_number, work_permit_number, work_permit_expiry,
      username, password,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !id_number || !job_title || !basic_salary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 12);

    // Generate employee number
    const { count } = await req.supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', req.user.tenant_id);

    const employee_number = `EMP${String((count || 0) + 1).padStart(3, '0')}`;

    // Create user account for employee
    const userId = require('crypto').randomUUID();
    const { error: userError } = await req.supabase
      .from('users')
      .insert({
        id: userId,
        tenant_id: req.user.tenant_id,
        username,
        password_hash,
        full_name: `${first_name} ${last_name}`,
        role: 'employee',
        is_active: true,
        first_login: true,
      });

    if (userError) throw userError;

    // Create employee profile
    const { data, error } = await req.supabase
      .from('employees')
      .insert({
        tenant_id: req.user.tenant_id,
        user_id: userId,
        employee_number,
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        id_number,
        nationality_status,
        burs_tin,
        department,
        job_title,
        employment_type,
        contract_start_date,
        basic_salary,
        bank_name,
        bank_account_number,
        work_permit_number: work_permit_number || null,
        work_permit_expiry: work_permit_expiry || null,
        is_active: true,
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await req.supabase.from('audit_logs').insert({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      user_role: req.user.role,
      action: 'EMPLOYEE_CREATED',
      entity_type: 'employee',
      entity_id: data.id,
      new_values: { employee_number, full_name: data.full_name },
      ip_address: req.ip,
      status: 'success',
    });

    res.status(201).json({ employee: data, message: 'Employee created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/employees/:id/deactivate', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ employee: data, message: 'Employee deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Leave ────────────────────────────────────────────────────────────────────

router.get('/leave', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('leave_requests')
      .select(`*, employees(full_name, employee_number), leave_types(name, code)`)
      .eq('tenant_id', req.user.tenant_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ requests: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leave/balances', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('leave_balances')
      .select(`*, employees(full_name, employee_number), leave_types(name, code)`)
      .eq('tenant_id', req.user.tenant_id)
      .eq('year', new Date().getFullYear());

    if (error) throw error;
    res.json({ balances: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Allowances ───────────────────────────────────────────────────────────────

router.get('/allowances', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('allowance_templates')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ allowances: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/allowances', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, amount_type, default_amount, is_taxable, is_recurring } = req.body;
    if (!name || !default_amount) return res.status(400).json({ error: 'Name and amount required' });

    const { data, error } = await req.supabase
      .from('allowance_templates')
      .insert({
        tenant_id: req.user.tenant_id,
        name,
        amount_type,
        default_amount,
        is_taxable,
        is_recurring,
        is_active: true,
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ allowance: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/allowances/:id/toggle', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { data: existing } = await req.supabase
      .from('allowance_templates')
      .select('is_active')
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    const { data, error } = await req.supabase
      .from('allowance_templates')
      .update({ is_active: !existing.is_active })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ allowance: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Deductions ───────────────────────────────────────────────────────────────

router.get('/deductions', verifyToken, requireRole('admin', 'client'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('deduction_templates')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ deductions: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deductions', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, amount_type, default_amount, reduces_taxable_income, is_recurring, balance } = req.body;
    if (!name || !default_amount) return res.status(400).json({ error: 'Name and amount required' });

    const { data, error } = await req.supabase
      .from('deduction_templates')
      .insert({
        tenant_id: req.user.tenant_id,
        name,
        amount_type,
        default_amount,
        reduces_taxable_income: reduces_taxable_income || false,
        is_recurring,
        is_active: true,
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ deduction: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/deductions/:id/toggle', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { data: existing } = await req.supabase
      .from('deduction_templates')
      .select('is_active')
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .single();

    const { data, error } = await req.supabase
      .from('deduction_templates')
      .update({ is_active: !existing.is_active })
      .eq('id', req.params.id)
      .eq('tenant_id', req.user.tenant_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ deduction: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;