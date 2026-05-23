// audit.model.js
// Accessor for the `audit_log` table — append-only.
// Fields: id, tenant_id, user_id, role, action, resource_type, resource_id,
// before_snapshot (jsonb), after_snapshot (jsonb), ip_address, user_agent, created_at.
// No UPDATE or DELETE operations — enforced by DB grants and RLS.
// Retained for 5 years.
// To be implemented.
