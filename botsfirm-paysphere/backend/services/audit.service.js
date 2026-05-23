// audit.service.js
// Append-only audit log writer.
//
// The `audit_logs` table is protected by database triggers that block UPDATE
// and DELETE — this service therefore only ever performs INSERT and SELECT.

const { supabaseAdmin } = require('../config/supabase');

const TABLE = 'audit_logs';

// logAction — insert a single audit row.
// `data` keys: user_id, tenant_id, user_role, action, entity_type, entity_id,
// old_values, new_values, ip_address, user_agent, status, notes.
async function logAction(data) {
  if (!data || !data.action || !data.entity_type) {
    throw new Error('audit.logAction requires action and entity_type');
  }
  const row = {
    user_id: data.user_id || null,
    tenant_id: data.tenant_id || null,
    user_role: data.user_role || null,
    action: data.action,
    entity_type: data.entity_type,
    entity_id: data.entity_id || null,
    old_values: data.old_values || null,
    new_values: data.new_values || null,
    ip_address: data.ip_address || null,
    user_agent: data.user_agent || null,
    status: data.status === 'failed' ? 'failed' : 'success',
    notes: data.notes || null,
  };

  const { data: inserted, error } = await supabaseAdmin
    .from(TABLE)
    .insert(row)
    .select('id, created_at')
    .single();

  if (error) {
    throw new Error(`audit.logAction failed: ${error.message}`);
  }
  return inserted;
}

// getAuditLogs — tenant-scoped query with optional filters.
// filters: { startDate, endDate, userId, action, entityType, limit, offset }
async function getAuditLogs(tenantId, filters = {}) {
  let query = supabaseAdmin
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const limit = Math.min(parseInt(filters.limit || '100', 10), 1000);
  const offset = parseInt(filters.offset || '0', 10);
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`audit.getAuditLogs failed: ${error.message}`);
  }
  return { logs: data || [], total: count || 0, limit, offset };
}

module.exports = {
  logAction,
  getAuditLogs,
};
