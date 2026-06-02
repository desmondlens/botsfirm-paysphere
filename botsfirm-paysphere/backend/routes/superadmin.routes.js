/**
 * Botsfirm PaySphere — Super Admin Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const crypto = require('crypto');

// ─── Clients ──────────────────────────────────────────────────────────────────

router.get('/clients', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get employee count per tenant
    const enriched = await Promise.all(data.map(async (tenant) => {
      const { count } = await req.supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('is_active', true);

      return { ...tenant, employees_used: count || 0 };
    }));

    res.json({ clients: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/clients/:id/suspend', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('tenants')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await req.supabase.from('audit_logs').insert({
      tenant_id: req.params.id,
      user_id: req.user.id,
      user_role: 'super_admin',
      action: 'CLIENT_SUSPENDED',
      entity_type: 'tenant',
      entity_id: req.params.id,
      ip_address: req.ip,
      status: 'success',
    });

    res.json({ client: data, message: 'Client suspended' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/clients/:id/activate', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('tenants')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ client: data, message: 'Client activated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Invite Codes ─────────────────────────────────────────────────────────────

router.get('/invite-codes', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ codes: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/invite-codes', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { plan, max_employees, expiry_days, client_name, client_email } = req.body;

    if (!plan || !max_employees) {
      return res.status(400).json({ error: 'Plan and max employees required' });
    }

    // Generate unique code
    const prefix = client_name
      ? client_name.slice(0, 5).toUpperCase().replace(/\s/g, '')
      : 'CLIENT';
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `${prefix}-${year}-${random}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiry_days || 7));

    const { data, error } = await req.supabase
      .from('invite_codes')
      .insert({
        code,
        plan,
        max_employees,
        generated_by: req.user.id,
        generated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_used: false,
      })
      .select()
      .single();

    if (error) throw error;

    await req.supabase.from('audit_logs').insert({
      user_id: req.user.id,
      user_role: 'super_admin',
      action: 'INVITE_CODE_GENERATED',
      entity_type: 'invite_code',
      entity_id: data.id,
      new_values: { code, plan, client_name, client_email },
      ip_address: req.ip,
      status: 'success',
    });

    res.status(201).json({ code: data, message: 'Invite code generated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/invite-codes/:id/revoke', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('invite_codes')
      .update({ is_used: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ code: data, message: 'Invite code revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Trials ───────────────────────────────────────────────────────────────────

router.get('/trials', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('trials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add days remaining
    const enriched = data.map(trial => {
      const now = new Date();
      const end = new Date(trial.trial_end);
      const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
      return { ...trial, days_left: daysLeft };
    });

    res.json({ trials: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/trials/:id/convert', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { plan, max_employees } = req.body;

    if (!plan || !max_employees) {
      return res.status(400).json({ error: 'Plan and max employees required' });
    }

    // Get trial
    const { data: trial, error: trialError } = await req.supabase
      .from('trials')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (trialError) throw trialError;
    if (!trial) return res.status(404).json({ error: 'Trial not found' });

    // Update tenant plan
    const subscriptionEnd = new Date();
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

    const { error: tenantError } = await req.supabase
      .from('tenants')
      .update({
        plan,
        max_employees,
        status: 'active',
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        trial_converted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trial.tenant_id);

    if (tenantError) throw tenantError;

    // Mark trial as converted
    const { data, error } = await req.supabase
      .from('trials')
      .update({
        status: 'converted',
        converted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await req.supabase.from('audit_logs').insert({
      user_id: req.user.id,
      user_role: 'super_admin',
      action: 'TRIAL_CONVERTED',
      entity_type: 'trial',
      entity_id: req.params.id,
      new_values: { plan, max_employees },
      ip_address: req.ip,
      status: 'success',
    });

    res.json({ trial: data, message: 'Trial converted to paid successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

router.get('/audit-logs', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { tenant_id, action, status, limit = 100 } = req.query;

    let query = req.supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (tenant_id) query = query.eq('tenant_id', tenant_id);
    if (action) query = query.eq('action', action);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ logs: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Platform stats ───────────────────────────────────────────────────────────

router.get('/stats', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const [
      { count: totalClients },
      { count: activeTrials },
      { count: totalEmployees },
    ] = await Promise.all([
      req.supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      req.supabase.from('trials').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      req.supabase.from('employees').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    res.json({
      total_clients: totalClients || 0,
      active_trials: activeTrials || 0,
      total_employees: totalEmployees || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;