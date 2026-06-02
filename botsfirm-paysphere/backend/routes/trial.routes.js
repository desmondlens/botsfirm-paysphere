/**
 * Botsfirm PaySphere — Trial Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Get trial status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('trials')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return res.json({ trial: null });

    const now = new Date();
    const end = new Date(data.trial_end);
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    res.json({
      trial: {
        ...data,
        days_left: daysLeft,
        is_active: data.status === 'active' && daysLeft > 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check trial limits
router.get('/limits', verifyToken, async (req, res) => {
  try {
    const { data: trial } = await req.supabase
      .from('trials')
      .select('*')
      .eq('tenant_id', req.user.tenant_id)
      .single();

    if (!trial) return res.json({ is_trial: false });

    const maxEmployees = parseInt(process.env.TRIAL_MAX_EMPLOYEES) || 5;
    const maxPayrollRuns = parseInt(process.env.TRIAL_MAX_PAYROLL_RUNS) || 1;

    res.json({
      is_trial: true,
      status: trial.status,
      employees_used: trial.employees_added || 0,
      employees_limit: maxEmployees,
      payroll_runs_used: trial.payroll_runs_count || 0,
      payroll_runs_limit: maxPayrollRuns,
      can_add_employee: (trial.employees_added || 0) < maxEmployees,
      can_run_payroll: (trial.payroll_runs_count || 0) < maxPayrollRuns,
      days_left: Math.max(0, Math.ceil(
        (new Date(trial.trial_end) - new Date()) / (1000 * 60 * 60 * 24)
      )),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;