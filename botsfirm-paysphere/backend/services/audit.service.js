// audit.service.js
// Append-only audit log writer. Records every mutating action across the platform.
//
// Recorded fields: tenant_id, user_id, role, action, resource_type, resource_id,
// before_snapshot, after_snapshot, ip_address, user_agent, timestamp.
// Audit rows are never updated or deleted — enforced by RLS and DB constraints.
// Retention: 5 years (per Botswana record-keeping requirement).
// To be implemented.
