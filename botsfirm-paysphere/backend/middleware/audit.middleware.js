// audit.middleware.js
// Automatic audit-log writer.
//
// Usage:
//   router.post(
//     '/employees',
//     verifyToken,
//     auditLog('employee.create', 'employee'),
//     controller.createEmployee
//   );
//
// The middleware wraps res.json/res.send so it can capture the final status
// code and write a single audit row per request — covering both success
// and failure paths.

const auditService = require('../services/audit.service');

function extractIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
}

function auditLog(action, entityType) {
  return function auditMiddleware(req, res, next) {
    const startedAt = Date.now();
    let logged = false;

    const writeLog = (status, entityId, notes) => {
      if (logged) return;
      logged = true;
      const user = req.user || {};
      const payload = {
        user_id: user.id || null,
        tenant_id: user.tenant_id || req.body?.tenant_id || null,
        user_role: user.role || null,
        action,
        entity_type: entityType,
        entity_id: entityId || req.params?.id || null,
        ip_address: extractIp(req),
        user_agent: req.headers['user-agent'] || null,
        status,
        notes: notes || null,
      };
      // Fire-and-forget: an audit-write failure must not block the response.
      auditService.logAction(payload).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[audit] failed to write log:', err);
      });
    };

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = (body) => {
      const status =
        res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failed';
      const entityId =
        body && typeof body === 'object'
          ? body.id || body?.data?.id || null
          : null;
      const notes =
        status === 'failed' && body && typeof body === 'object' && body.error
          ? String(body.error).slice(0, 500)
          : null;
      writeLog(status, entityId, notes);
      return originalJson(body);
    };

    res.send = (body) => {
      const status =
        res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failed';
      writeLog(status, null, null);
      return originalSend(body);
    };

    res.on('finish', () => {
      if (!logged) {
        const status =
          res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failed';
        writeLog(status, null, null);
      }
    });

    // Suppress unused warning — startedAt is reserved for future latency logging.
    void startedAt;
    return next();
  };
}

module.exports = { auditLog };
