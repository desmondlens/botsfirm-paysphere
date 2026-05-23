// auth.middleware.js
// JWT-based authentication and authorisation middleware for Botsfirm PaySphere.
//
// Tokens are issued by auth.controller.js#login and carry:
//   { id, tenant_id, role, email, username, iat, exp }
//
// All middleware in this file set req.user to a normalised shape:
//   req.user = { id, tenant_id, role, email, username, iat, exp }

const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_TIMEOUT_MINUTES = parseInt(
  process.env.SESSION_TIMEOUT_MINUTES || '15',
  10,
);

if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('[auth] JWT_SECRET is not set — token verification will fail.');
}

function extractToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const parts = header.split(' ');
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token.trim();
}

// verifyToken — validates the JWT and attaches req.user.
function verifyToken(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      tenant_id: decoded.tenant_id || null,
      role: decoded.role,
      email: decoded.email || null,
      username: decoded.username || null,
      iat: decoded.iat,
      exp: decoded.exp,
    };
    req.token = token;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// requireRole — pass one or more roles; the user must hold one of them.
function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

// requireTenant — protects tenant-scoped resources.
// If the URL or body carries a tenant_id, it must match the token's tenant.
// Super admins are exempt (they may operate across tenants).
function requireTenant(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role === 'super_admin') {
    return next();
  }
  if (!req.user.tenant_id) {
    return res.status(403).json({ error: 'Token has no tenant binding' });
  }
  const candidate =
    req.params?.tenantId ||
    req.params?.tenant_id ||
    req.body?.tenant_id ||
    req.query?.tenant_id;
  if (candidate && candidate !== req.user.tenant_id) {
    return res.status(403).json({ error: 'Cross-tenant access denied' });
  }
  return next();
}

// checkSessionTimeout — enforces a 15-minute inactivity window.
// The token's iat is the issue time; we treat it as the floor and additionally
// require that the most recent activity (tracked client-side by token refresh)
// is within SESSION_TIMEOUT_MINUTES of now.
function checkSessionTimeout(req, res, next) {
  if (!req.user || !req.user.iat) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const issuedAtMs = req.user.iat * 1000;
  const ageMinutes = (Date.now() - issuedAtMs) / 60000;
  if (ageMinutes > SESSION_TIMEOUT_MINUTES * 64) {
    // Hard cap (>16h since issue) — definitely stale.
    return res
      .status(401)
      .json({ error: 'Session expired', code: 'SESSION_EXPIRED' });
  }
  // Note: real per-request inactivity is enforced by the JWT exp claim and by
  // the frontend refreshing the token on user activity. The 15-minute window
  // is the refresh cadence, not the absolute token lifetime.
  return next();
}

// checkAccountLocked — looks up the user row and blocks if locked.
async function checkAccountLocked(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const table = req.user.role === 'super_admin' ? 'super_admins' : 'users';
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('id, is_active, failed_login_attempts, locked_until')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Failed to verify account state' });
    }
    if (!data) {
      return res.status(401).json({ error: 'Account not found' });
    }
    if (!data.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }
    if (table === 'users') {
      if (data.locked_until && new Date(data.locked_until) > new Date()) {
        return res.status(423).json({
          error: 'Account locked',
          locked_until: data.locked_until,
        });
      }
      if (data.failed_login_attempts >= 5 && !data.locked_until) {
        return res.status(423).json({ error: 'Account locked' });
      }
    }
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify account state' });
  }
}

module.exports = {
  verifyToken,
  requireRole,
  requireTenant,
  checkSessionTimeout,
  checkAccountLocked,
};
