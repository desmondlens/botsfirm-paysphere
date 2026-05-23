// trial.service.js
// Trial lifecycle management for Botsfirm PaySphere.
//
// Stages:
//   1. createTrial      — new self-service trial (7 days, 5 employees, 1 run).
//   2. sendTrialReminders — cron-driven reminder emails (days 3, 6, 7) and
//      expiry notice (day 8).
//   3. expireTrial      — mark trial expired; schedule data deletion +30 days.
//   4. convertTrialToPaid — promote trial tenant to paid plan via invite code.
//   5. deleteExpiredTrialData — hard-delete tenant after retention window.

const { supabaseAdmin } = require('../config/supabase');
const emailService = require('./email.service');
const inviteService = require('./invite.service');

const TRIAL_DURATION_DAYS = parseInt(process.env.TRIAL_DURATION_DAYS || '7', 10);
const TRIAL_DATA_RETENTION_DAYS = parseInt(
  process.env.TRIAL_DATA_RETENTION_DAYS || '30',
  10,
);
const TRIAL_MAX_EMPLOYEES = parseInt(process.env.TRIAL_MAX_EMPLOYEES || '5', 10);
const TRIAL_MAX_PAYROLL_RUNS = parseInt(
  process.env.TRIAL_MAX_PAYROLL_RUNS || '1',
  10,
);
const CONTACT_WHATSAPP = process.env.CONTACT_WHATSAPP || '+267 75 000 000';
const CONTACT_EMAIL =
  process.env.EMAIL_SUPPORT_ADDRESS || 'support@botsfirmpaysphere.com';

// createTrial — creates a trial row plus matching tenant.
// data: { email, full_name, company_name, phone, employee_count_estimate }
async function createTrial(data) {
  if (!data?.email || !data?.full_name || !data?.company_name) {
    throw new Error('createTrial: email, full_name, company_name required');
  }
  const now = new Date();
  const trialEnd = new Date(
    now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  // Insert tenant first (FK from trials.tenant_id → tenants.id).
  const { data: tenant, error: tenantErr } = await supabaseAdmin
    .from('tenants')
    .insert({
      company_name: data.company_name,
      email: data.email,
      phone: data.phone || null,
      plan: 'trial',
      status: 'trial',
      max_employees: TRIAL_MAX_EMPLOYEES,
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
    })
    .select('*')
    .single();

  if (tenantErr) {
    throw new Error(`createTrial (tenant): ${tenantErr.message}`);
  }

  const { data: trial, error: trialErr } = await supabaseAdmin
    .from('trials')
    .insert({
      email: data.email,
      full_name: data.full_name,
      company_name: data.company_name,
      phone: data.phone || null,
      employee_count_estimate: data.employee_count_estimate || null,
      plan_assigned: 'trial',
      tenant_id: tenant.id,
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      status: 'active',
    })
    .select('*')
    .single();

  if (trialErr) {
    // Roll back the tenant insert if trial creation fails.
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
    throw new Error(`createTrial (trial): ${trialErr.message}`);
  }

  return { trial, tenant };
}

// getTrialStatus — current status, days remaining, and limits used.
async function getTrialStatus(trialId) {
  const { data: trial, error } = await supabaseAdmin
    .from('trials')
    .select('*')
    .eq('id', trialId)
    .maybeSingle();

  if (error) throw new Error(`getTrialStatus: ${error.message}`);
  if (!trial) return null;

  const now = Date.now();
  const end = new Date(trial.trial_end).getTime();
  const daysRemaining = Math.max(0, Math.ceil((end - now) / 86400000));

  return {
    id: trial.id,
    status: trial.status,
    trialStart: trial.trial_start,
    trialEnd: trial.trial_end,
    daysRemaining,
    employeesAdded: trial.employees_added || 0,
    payrollRunsCount: trial.payroll_runs_count || 0,
    limits: {
      maxEmployees: TRIAL_MAX_EMPLOYEES,
      maxPayrollRuns: TRIAL_MAX_PAYROLL_RUNS,
    },
  };
}

// checkTrialLimits — used by upstream guards before allowing an action.
async function checkTrialLimits(tenantId) {
  const { data: tenant, error: tenantErr } = await supabaseAdmin
    .from('tenants')
    .select('id, status, plan')
    .eq('id', tenantId)
    .maybeSingle();

  if (tenantErr || !tenant) {
    return { allowed: false, reason: 'Tenant not found' };
  }
  if (tenant.plan !== 'trial' && tenant.status !== 'trial') {
    return { allowed: true };
  }

  const { count: employeeCount } = await supabaseAdmin
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  const { count: payrollRunCount } = await supabaseAdmin
    .from('payroll_runs')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  return {
    allowed: true,
    employees: employeeCount || 0,
    payrollRuns: payrollRunCount || 0,
    employeeLimit: TRIAL_MAX_EMPLOYEES,
    payrollRunLimit: TRIAL_MAX_PAYROLL_RUNS,
    employeeLimitReached: (employeeCount || 0) >= TRIAL_MAX_EMPLOYEES,
    payrollRunLimitReached: (payrollRunCount || 0) >= TRIAL_MAX_PAYROLL_RUNS,
  };
}

// expireTrial — flips status to expired and schedules data deletion.
async function expireTrial(trialId) {
  const deletionDate = new Date(
    Date.now() + TRIAL_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  const { data: trial, error } = await supabaseAdmin
    .from('trials')
    .update({
      status: 'expired',
      data_delete_scheduled_at: deletionDate.toISOString(),
    })
    .eq('id', trialId)
    .select('*')
    .single();

  if (error) throw new Error(`expireTrial: ${error.message}`);

  if (trial?.tenant_id) {
    await supabaseAdmin
      .from('tenants')
      .update({ status: 'expired' })
      .eq('id', trial.tenant_id);
  }
  return trial;
}

// convertTrialToPaid — promotes trial to paid plan by redeeming an invite code.
// Preserves all tenant data (employees, payroll runs, etc.).
async function convertTrialToPaid(trialId, inviteCode) {
  const { data: trial, error: trialErr } = await supabaseAdmin
    .from('trials')
    .select('*')
    .eq('id', trialId)
    .maybeSingle();
  if (trialErr) throw new Error(`convertTrialToPaid: ${trialErr.message}`);
  if (!trial) throw new Error('Trial not found');
  if (trial.status === 'converted') throw new Error('Trial already converted');
  if (!trial.tenant_id) throw new Error('Trial has no tenant');

  const invite = await inviteService.validateInviteCode(inviteCode);
  if (!invite.valid) throw new Error(invite.reason);

  const now = new Date();
  // Default 30-day subscription window; payment process refreshes this.
  const subEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { error: tenantErr } = await supabaseAdmin
    .from('tenants')
    .update({
      plan: invite.invite.plan,
      status: 'active',
      max_employees: invite.invite.max_employees,
      subscription_start: now.toISOString(),
      subscription_end: subEnd.toISOString(),
      trial_converted: true,
    })
    .eq('id', trial.tenant_id);

  if (tenantErr) throw new Error(`convertTrialToPaid: ${tenantErr.message}`);

  await inviteService.redeemInviteCode(inviteCode, trial.tenant_id, null);

  const { data: updatedTrial } = await supabaseAdmin
    .from('trials')
    .update({
      status: 'converted',
      converted_at: now.toISOString(),
      plan_assigned: invite.invite.plan,
      data_delete_scheduled_at: null,
    })
    .eq('id', trialId)
    .select('*')
    .single();

  return updatedTrial;
}

// scheduleDataDeletion — explicit scheduling helper (called by expireTrial,
// exposed for manual super-admin use).
async function scheduleDataDeletion(trialId) {
  const deletionDate = new Date(
    Date.now() + TRIAL_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  const { data, error } = await supabaseAdmin
    .from('trials')
    .update({ data_delete_scheduled_at: deletionDate.toISOString() })
    .eq('id', trialId)
    .select('*')
    .single();
  if (error) throw new Error(`scheduleDataDeletion: ${error.message}`);
  return data;
}

// deleteExpiredTrialData — hard-delete the tenant; FKs cascade.
async function deleteExpiredTrialData(trialId) {
  const { data: trial, error } = await supabaseAdmin
    .from('trials')
    .select('*')
    .eq('id', trialId)
    .maybeSingle();
  if (error) throw new Error(`deleteExpiredTrialData: ${error.message}`);
  if (!trial) return { deleted: false };
  if (trial.status === 'converted') {
    return { deleted: false, reason: 'Trial was converted' };
  }

  if (trial.tenant_id) {
    const { error: delErr } = await supabaseAdmin
      .from('tenants')
      .delete()
      .eq('id', trial.tenant_id);
    if (delErr) throw new Error(`deleteExpiredTrialData: ${delErr.message}`);
  }

  await supabaseAdmin
    .from('trials')
    .update({ status: 'deleted' })
    .eq('id', trialId);

  return { deleted: true };
}

// sendTrialReminders — cron entry point. Walks all active trials and dispatches
// emails based on days remaining. Idempotent via reminder_*_sent flags.
async function sendTrialReminders() {
  const { data: trials, error } = await supabaseAdmin
    .from('trials')
    .select('*')
    .in('status', ['active', 'expired'])
    .order('trial_end', { ascending: true });

  if (error) throw new Error(`sendTrialReminders: ${error.message}`);
  if (!trials || trials.length === 0) return { processed: 0 };

  let sent = 0;
  for (const trial of trials) {
    const now = Date.now();
    const end = new Date(trial.trial_end).getTime();
    const msUntilEnd = end - now;
    const daysUntilEnd = Math.ceil(msUntilEnd / 86400000);

    try {
      if (
        trial.status === 'active' &&
        daysUntilEnd === 4 &&
        !trial.reminder_3_sent
      ) {
        await emailService.sendTrialReminder(
          trial.email,
          trial.full_name,
          daysUntilEnd,
          CONTACT_WHATSAPP,
          CONTACT_EMAIL,
        );
        await supabaseAdmin
          .from('trials')
          .update({ reminder_3_sent: true })
          .eq('id', trial.id);
        sent += 1;
      } else if (
        trial.status === 'active' &&
        daysUntilEnd === 1 &&
        !trial.reminder_6_sent
      ) {
        await emailService.sendTrialReminder(
          trial.email,
          trial.full_name,
          daysUntilEnd,
          CONTACT_WHATSAPP,
          CONTACT_EMAIL,
        );
        await supabaseAdmin
          .from('trials')
          .update({ reminder_6_sent: true })
          .eq('id', trial.id);
        sent += 1;
      } else if (
        trial.status === 'active' &&
        daysUntilEnd <= 0 &&
        !trial.reminder_7_sent
      ) {
        await emailService.sendTrialReminder(
          trial.email,
          trial.full_name,
          0,
          CONTACT_WHATSAPP,
          CONTACT_EMAIL,
        );
        await supabaseAdmin
          .from('trials')
          .update({ reminder_7_sent: true })
          .eq('id', trial.id);
        sent += 1;
      } else if (
        msUntilEnd < -24 * 60 * 60 * 1000 &&
        !trial.reminder_8_sent
      ) {
        await expireTrial(trial.id);
        await emailService.sendTrialExpired(
          trial.email,
          trial.full_name,
          CONTACT_WHATSAPP,
          CONTACT_EMAIL,
        );
        await supabaseAdmin
          .from('trials')
          .update({ reminder_8_sent: true })
          .eq('id', trial.id);
        sent += 1;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[trial] reminder failed for ${trial.id}:`, err);
    }
  }
  return { processed: trials.length, sent };
}

module.exports = {
  createTrial,
  getTrialStatus,
  checkTrialLimits,
  expireTrial,
  convertTrialToPaid,
  scheduleDataDeletion,
  deleteExpiredTrialData,
  sendTrialReminders,
  TRIAL_DURATION_DAYS,
  TRIAL_MAX_EMPLOYEES,
  TRIAL_MAX_PAYROLL_RUNS,
};
