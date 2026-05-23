// auth.controller.js
// HTTP handlers for the /api/auth/* endpoints.
// All business logic that touches more than one table lives in services;
// these handlers only orchestrate.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { supabaseAdmin } = require('../config/supabase');
const auditService = require('../services/audit.service');
const emailService = require('../services/email.service');
const inviteService = require('../services/invite.service');
const trialService = require('../services/trial.service');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCKOUT_DURATION_MINUTES = parseInt(
  process.env.LOCKOUT_DURATION_MINUTES || '30',
  10,
);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-memory store for password reset tokens.
// For multi-instance deployments this should be moved to a `password_resets`
// table or Redis. Acceptable for single-instance MVP and tests.
const resetTokens = new Map(); // token -> { userId, table, expiresAt }

function ipOf(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    null
  );
}

function uaOf(req) {
  return req.headers['user-agent'] || null;
}

function signToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function redirectFor(role) {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'client':
      return '/client/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'employee':
      return '/employee/dashboard';
    default:
      return '/';
  }
}

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { ok: false, reason: 'Password is required' };
  }
  if (password.length < 8) {
    return { ok: false, reason: 'Password must be at least 8 characters' };
  }
  if (!/\d/.test(password)) {
    return { ok: false, reason: 'Password must contain a number' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return { ok: false, reason: 'Password must contain a symbol' };
  }
  return { ok: true };
}

// Look up a login candidate across super_admins and users tables.
async function findLoginUser({ email, username }) {
  if (email) {
    const { data: superAdmin } = await supabaseAdmin
      .from('super_admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (superAdmin) {
      return { table: 'super_admins', row: superAdmin, role: 'super_admin' };
    }
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (user) return { table: 'users', row: user, role: user.role };
  }
  if (username) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (user) return { table: 'users', row: user, role: user.role };
  }
  return null;
}

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
async function login(req, res) {
  const { email, username, password } = req.body || {};
  const loginIdentifier = email || username;

  if (!loginIdentifier || !password) {
    return res
      .status(400)
      .json({ error: 'Email/username and password are required' });
  }

  try {
    const found = await findLoginUser({ email, username });

    if (!found) {
      await auditService.logAction({
        action: 'auth.login',
        entity_type: 'user',
        ip_address: ipOf(req),
        user_agent: uaOf(req),
        status: 'failed',
        notes: 'Unknown account',
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { table, row, role } = found;

    if (!row.is_active) {
      await auditService.logAction({
        user_id: row.id,
        tenant_id: row.tenant_id || null,
        user_role: role,
        action: 'auth.login',
        entity_type: 'user',
        entity_id: row.id,
        ip_address: ipOf(req),
        user_agent: uaOf(req),
        status: 'failed',
        notes: 'Account inactive',
      });
      return res.status(403).json({ error: 'Account is inactive' });
    }

    if (table === 'users') {
      if (row.locked_until && new Date(row.locked_until) > new Date()) {
        return res.status(423).json({
          error: 'Account locked. Try again later.',
          locked_until: row.locked_until,
        });
      }
      if (row.failed_login_attempts >= MAX_LOGIN_ATTEMPTS && !row.locked_until) {
        return res.status(423).json({ error: 'Account locked' });
      }
    }

    const match = await bcrypt.compare(password, row.password_hash);

    if (!match) {
      if (table === 'users') {
        const attempts = (row.failed_login_attempts || 0) + 1;
        const update = { failed_login_attempts: attempts };
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          update.locked_until = new Date(
            Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
          ).toISOString();
        }
        await supabaseAdmin.from('users').update(update).eq('id', row.id);
      }
      await auditService.logAction({
        user_id: row.id,
        tenant_id: row.tenant_id || null,
        user_role: role,
        action: 'auth.login',
        entity_type: 'user',
        entity_id: row.id,
        ip_address: ipOf(req),
        user_agent: uaOf(req),
        status: 'failed',
        notes: 'Bad password',
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Success — clear lockout counters, update last_login.
    const successUpdate = {
      last_login: new Date().toISOString(),
    };
    if (table === 'users') {
      successUpdate.failed_login_attempts = 0;
      successUpdate.locked_until = null;
    }
    await supabaseAdmin.from(table).update(successUpdate).eq('id', row.id);

    const tokenPayload = {
      id: row.id,
      tenant_id: row.tenant_id || null,
      role,
      email: row.email || null,
      username: row.username || null,
    };
    const token = signToken(tokenPayload);

    await auditService.logAction({
      user_id: row.id,
      tenant_id: row.tenant_id || null,
      user_role: role,
      action: 'auth.login',
      entity_type: 'user',
      entity_id: row.id,
      ip_address: ipOf(req),
      user_agent: uaOf(req),
      status: 'success',
    });

    let redirect = redirectFor(role);
    if (role === 'employee' && row.first_login) {
      redirect = '/employee/set-password';
    }

    return res.json({
      token,
      user: {
        id: row.id,
        tenant_id: row.tenant_id || null,
        role,
        email: row.email || null,
        username: row.username || null,
        full_name: row.full_name,
        first_login: row.first_login || false,
      },
      redirect,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
async function logout(req, res) {
  // JWTs are stateless — logout is recorded for audit and the client clears
  // the in-memory token.
  if (req.user) {
    await auditService.logAction({
      user_id: req.user.id,
      tenant_id: req.user.tenant_id || null,
      user_role: req.user.role,
      action: 'auth.logout',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: ipOf(req),
      user_agent: uaOf(req),
      status: 'success',
    });
  }
  return res.json({ success: true });
}

// ---------------------------------------------------------------------------
// POST /api/auth/trial-signup
// ---------------------------------------------------------------------------
async function trialSignup(req, res) {
  const {
    company_name,
    registration_number,
    full_name,
    email,
    phone,
    employee_count_estimate,
    password,
    accept_terms,
  } = req.body || {};

  if (!company_name || !full_name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  if (!accept_terms) {
    return res.status(400).json({ error: 'You must accept the terms' });
  }

  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.ok) {
    return res.status(400).json({ error: pwCheck.reason });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const { trial, tenant } = await trialService.createTrial({
      email,
      full_name,
      company_name,
      phone,
      employee_count_estimate,
    });

    if (registration_number) {
      await supabaseAdmin
        .from('tenants')
        .update({ registration_number })
        .eq('id', tenant.id);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .insert({
        tenant_id: tenant.id,
        email,
        password_hash: passwordHash,
        full_name,
        role: 'client',
        is_active: true,
        first_login: false,
      })
      .select('*')
      .single();

    if (userErr) {
      throw new Error(`trialSignup user create: ${userErr.message}`);
    }

    try {
      await emailService.sendWelcomeEmail(
        email,
        full_name,
        `${FRONTEND_URL}/login`,
        trial.trial_end,
      );
    } catch (mailErr) {
      // eslint-disable-next-line no-console
      console.error('[auth.trialSignup] welcome email failed:', mailErr);
    }

    await auditService.logAction({
      user_id: user.id,
      tenant_id: tenant.id,
      user_role: 'client',
      action: 'auth.trial_signup',
      entity_type: 'tenant',
      entity_id: tenant.id,
      ip_address: ipOf(req),
      user_agent: uaOf(req),
      status: 'success',
    });

    return res.status(201).json({
      success: true,
      redirect: '/login',
      message: 'Trial created — check your email to get started.',
      tenant_id: tenant.id,
      trial_end: trial.trial_end,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.trialSignup]', err);
    return res.status(500).json({ error: 'Trial signup failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/redeem-invite
// ---------------------------------------------------------------------------
async function redeemInvite(req, res) {
  const {
    invite_code,
    company_name,
    burs_number,
    hrdc_number,
    address,
    phone,
    full_name,
    email,
    password,
  } = req.body || {};

  if (!invite_code || !company_name || !full_name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.ok) {
    return res.status(400).json({ error: pwCheck.reason });
  }

  try {
    const check = await inviteService.validateInviteCode(invite_code);
    if (!check.valid) {
      return res.status(400).json({ error: check.reason });
    }
    const invite = check.invite;

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const now = new Date();
    const subEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { data: tenant, error: tenantErr } = await supabaseAdmin
      .from('tenants')
      .insert({
        company_name,
        burs_number: burs_number || null,
        hrdc_number: hrdc_number || null,
        address: address || null,
        phone: phone || null,
        email,
        plan: invite.plan,
        max_employees: invite.max_employees,
        status: 'active',
        subscription_start: now.toISOString(),
        subscription_end: subEnd.toISOString(),
      })
      .select('*')
      .single();
    if (tenantErr) throw new Error(tenantErr.message);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .insert({
        tenant_id: tenant.id,
        email,
        password_hash: passwordHash,
        full_name,
        role: 'client',
        is_active: true,
        first_login: false,
      })
      .select('*')
      .single();
    if (userErr) throw new Error(userErr.message);

    await inviteService.redeemInviteCode(invite_code, tenant.id, user.id);

    try {
      await emailService.sendWelcomeEmail(
        email,
        full_name,
        `${FRONTEND_URL}/login`,
        subEnd,
      );
    } catch (mailErr) {
      // eslint-disable-next-line no-console
      console.error('[auth.redeemInvite] welcome email failed:', mailErr);
    }

    await auditService.logAction({
      user_id: user.id,
      tenant_id: tenant.id,
      user_role: 'client',
      action: 'auth.redeem_invite',
      entity_type: 'tenant',
      entity_id: tenant.id,
      ip_address: ipOf(req),
      user_agent: uaOf(req),
      status: 'success',
      notes: `Plan ${invite.plan}`,
    });

    const token = signToken({
      id: user.id,
      tenant_id: tenant.id,
      role: 'client',
      email: user.email,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        tenant_id: tenant.id,
        role: 'client',
        email: user.email,
        full_name: user.full_name,
      },
      redirect: '/client/dashboard',
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.redeemInvite]', err);
    return res.status(500).json({ error: 'Invite redemption failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------
async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    let target = null;
    const { data: superAdmin } = await supabaseAdmin
      .from('super_admins')
      .select('id, email, full_name')
      .eq('email', email)
      .maybeSingle();
    if (superAdmin) {
      target = { id: superAdmin.id, table: 'super_admins', name: superAdmin.full_name };
    } else {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name')
        .eq('email', email)
        .maybeSingle();
      if (user) {
        target = { id: user.id, table: 'users', name: user.full_name };
      }
    }

    if (target) {
      const token = crypto.randomBytes(32).toString('hex');
      resetTokens.set(token, {
        userId: target.id,
        table: target.table,
        expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
      });
      try {
        await emailService.sendPasswordReset(
          email,
          target.name,
          `${FRONTEND_URL}/reset-password?token=${token}`,
          '1 hour',
        );
      } catch (mailErr) {
        // eslint-disable-next-line no-console
        console.error('[auth.forgotPassword] email failed:', mailErr);
      }
      await auditService.logAction({
        user_id: target.id,
        user_role: target.table === 'super_admins' ? 'super_admin' : 'user',
        action: 'auth.forgot_password',
        entity_type: 'user',
        entity_id: target.id,
        ip_address: ipOf(req),
        user_agent: uaOf(req),
        status: 'success',
      });
    }

    // Always respond the same way — don't reveal account existence.
    return res.json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.forgotPassword]', err);
    return res.json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
    });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------
async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }
  const entry = resetTokens.get(token);
  if (!entry) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  if (entry.expiresAt < Date.now()) {
    resetTokens.delete(token);
    return res.status(400).json({ error: 'Token has expired' });
  }
  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.ok) {
    return res.status(400).json({ error: pwCheck.reason });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const update = { password_hash: passwordHash };
    if (entry.table === 'users') {
      update.failed_login_attempts = 0;
      update.locked_until = null;
    }
    const { error } = await supabaseAdmin
      .from(entry.table)
      .update(update)
      .eq('id', entry.userId);
    if (error) throw new Error(error.message);

    resetTokens.delete(token);

    await auditService.logAction({
      user_id: entry.userId,
      user_role: entry.table === 'super_admins' ? 'super_admin' : 'user',
      action: 'auth.reset_password',
      entity_type: 'user',
      entity_id: entry.userId,
      ip_address: ipOf(req),
      user_agent: uaOf(req),
      status: 'success',
    });

    return res.json({ success: true, message: 'Password updated. Please sign in.' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.resetPassword]', err);
    return res.status(500).json({ error: 'Password reset failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/change-password   (authenticated)
// ---------------------------------------------------------------------------
async function changePassword(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) {
    return res
      .status(400)
      .json({ error: 'Current and new password are required' });
  }
  const pwCheck = validatePasswordStrength(new_password);
  if (!pwCheck.ok) return res.status(400).json({ error: pwCheck.reason });

  try {
    const table = req.user.role === 'super_admin' ? 'super_admins' : 'users';
    const { data: row } = await supabaseAdmin
      .from(table)
      .select('id, password_hash')
      .eq('id', req.user.id)
      .maybeSingle();
    if (!row) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(current_password, row.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(new_password, SALT_ROUNDS);
    const { error } = await supabaseAdmin
      .from(table)
      .update({ password_hash: passwordHash })
      .eq('id', req.user.id);
    if (error) throw new Error(error.message);

    await auditService.logAction({
      user_id: req.user.id,
      tenant_id: req.user.tenant_id || null,
      user_role: req.user.role,
      action: 'auth.change_password',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: ipOf(req),
      user_agent: uaOf(req),
      status: 'success',
    });

    return res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.changePassword]', err);
    return res.status(500).json({ error: 'Password change failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/employee-first-login   (authenticated employee)
// ---------------------------------------------------------------------------
async function employeeFirstLogin(req, res) {
  if (!req.user || req.user.role !== 'employee') {
    return res.status(403).json({ error: 'Employee account required' });
  }
  const { new_password } = req.body || {};
  const pwCheck = validatePasswordStrength(new_password);
  if (!pwCheck.ok) return res.status(400).json({ error: pwCheck.reason });

  try {
    const passwordHash = await bcrypt.hash(new_password, SALT_ROUNDS);
    const { error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash, first_login: false })
      .eq('id', req.user.id);
    if (error) throw new Error(error.message);

    await auditService.logAction({
      user_id: req.user.id,
      tenant_id: req.user.tenant_id || null,
      user_role: 'employee',
      action: 'auth.employee_first_login',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: ipOf(req),
      user_agent: uaOf(req),
      status: 'success',
    });

    return res.json({ success: true, redirect: '/employee/dashboard' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.employeeFirstLogin]', err);
    return res.status(500).json({ error: 'Could not set password' });
  }
}

// ---------------------------------------------------------------------------
// GET /api/auth/me   (authenticated)
// ---------------------------------------------------------------------------
async function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const table = req.user.role === 'super_admin' ? 'super_admins' : 'users';
    const { data: row } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();
    if (!row) return res.status(404).json({ error: 'User not found' });

    let tenant = null;
    if (row.tenant_id) {
      const { data: t } = await supabaseAdmin
        .from('tenants')
        .select('id, company_name, plan, status, max_employees, trial_end, subscription_end')
        .eq('id', row.tenant_id)
        .maybeSingle();
      tenant = t || null;
    }

    const permissions = permissionsFor(req.user.role);

    return res.json({
      user: {
        id: row.id,
        tenant_id: row.tenant_id || null,
        role: req.user.role,
        email: row.email || null,
        username: row.username || null,
        full_name: row.full_name,
        first_login: row.first_login || false,
        last_login: row.last_login || null,
      },
      tenant,
      permissions,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auth.me]', err);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
}

function permissionsFor(role) {
  switch (role) {
    case 'super_admin':
      return [
        'tenants.read',
        'tenants.write',
        'invites.write',
        'audit.read',
        'trials.write',
      ];
    case 'client':
      return [
        'company.write',
        'admins.write',
        'employees.read',
        'payroll.read',
        'reports.read',
      ];
    case 'admin':
      return [
        'employees.write',
        'payroll.write',
        'leave.write',
        'reports.read',
      ];
    case 'employee':
      return ['profile.read', 'payslips.read', 'leave.request'];
    default:
      return [];
  }
}

module.exports = {
  login,
  logout,
  trialSignup,
  redeemInvite,
  forgotPassword,
  resetPassword,
  changePassword,
  employeeFirstLogin,
  me,
};
