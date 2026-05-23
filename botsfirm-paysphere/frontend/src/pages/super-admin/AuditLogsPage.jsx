import React, { useState } from 'react';

const AuditLogsPage = () => {
  const [logs] = useState([
    { id: '1', user: 'superadmin@botsfirmpaysphere.com', role: 'super_admin', action: 'LOGIN', entity_type: 'auth', status: 'success', ip_address: '196.43.1.1', created_at: '2026-05-24 08:12:33' },
    { id: '2', user: 'client@kgaboconstruction.co.bw', role: 'client', action: 'LOGIN', entity_type: 'auth', status: 'success', ip_address: '196.43.1.2', created_at: '2026-05-24 08:15:10' },
    { id: '3', user: 'admin@kgaboconstruction.co.bw', role: 'admin', action: 'EMPLOYEE_CREATED', entity_type: 'employee', status: 'success', ip_address: '196.43.1.3', created_at: '2026-05-24 08:20:45' },
    { id: '4', user: 'admin@kgaboconstruction.co.bw', role: 'admin', action: 'PAYROLL_RUN', entity_type: 'payroll', status: 'success', ip_address: '196.43.1.3', created_at: '2026-05-24 08:45:00' },
    { id: '5', user: 'unknown', role: 'unknown', action: 'LOGIN_FAILED', entity_type: 'auth', status: 'failed', ip_address: '41.21.4.5', created_at: '2026-05-24 09:01:22' },
    { id: '6', user: 'client@petraholdings.co.bw', role: 'client', action: 'LOGIN', entity_type: 'auth', status: 'success', ip_address: '196.43.2.1', created_at: '2026-05-24 09:15:00' },
    { id: '7', user: 'admin@petraholdings.co.bw', role: 'admin', action: 'EMPLOYEE_CREATED', entity_type: 'employee', status: 'success', ip_address: '196.43.2.2', created_at: '2026-05-24 09:30:11' },
    { id: '8', user: 'admin@kgaboconstruction.co.bw', role: 'admin', action: 'PAYSLIP_DOWNLOADED', entity_type: 'payslip', status: 'success', ip_address: '196.43.1.3', created_at: '2026-05-24 10:00:05' },
  ]);

  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = logs.filter(log => {
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchRole = filterRole === 'all' || log.role === filterRole;
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address.includes(search);
    return matchAction && matchStatus && matchRole && matchSearch;
  });

  const actionColors = {
    LOGIN: { bg: '#F0FFF4', color: '#38A169' },
    LOGIN_FAILED: { bg: '#FFF5F5', color: '#E53E3E' },
    LOGOUT: { bg: '#F7FAFC', color: '#718096' },
    EMPLOYEE_CREATED: { bg: '#EBF8FF', color: '#2B6CB0' },
    EMPLOYEE_UPDATED: { bg: '#EBF8FF', color: '#2B6CB0' },
    PAYROLL_RUN: { bg: '#FAF5FF', color: '#805AD5' },
    PAYSLIP_DOWNLOADED: { bg: '#FFFFF0', color: '#D69E2E' },
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Audit Logs</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
            Complete activity trail — {logs.length} records. Logs cannot be deleted.
          </p>
        </div>
        <button
          onClick={() => alert('Export functionality coming soon')}
          style={{
            padding: '8px 20px',
            backgroundColor: '#FFFFFF',
            color: '#2B6CB0',
            border: '1px solid #2B6CB0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Events', value: logs.length, color: '#2B6CB0' },
          { label: 'Successful', value: logs.filter(l => l.status === 'success').length, color: '#38A169' },
          { label: 'Failed', value: logs.filter(l => l.status === 'failed').length, color: '#E53E3E' },
          { label: 'Unique IPs', value: [...new Set(logs.map(l => l.ip_address))].length, color: '#805AD5' },
        ].map((stat, i) => (
          <div key={i} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ color: stat.color, fontSize: '24px', fontWeight: '700' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Search user, action, IP..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2D3748',
            outline: 'none',
          }}
        />
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
        >
          <option value="all">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Logs Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              {['Time', 'User', 'Role', 'Action', 'Entity', 'IP Address', 'Status'].map(h => (
                <th key={h} style={{
                  padding: '10px 20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#718096',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#718096', fontSize: '14px' }}>
                  No logs found
                </td>
              </tr>
            ) : filtered.map((log) => (
              <tr key={log.id} style={{ borderTop: '1px solid #E2E8F0', backgroundColor: log.status === 'failed' ? '#FFFAFA' : 'transparent' }}>
                <td style={{ padding: '10px 20px', fontSize: '12px', color: '#718096', whiteSpace: 'nowrap' }}>{log.created_at}</td>
                <td style={{ padding: '10px 20px', fontSize: '13px', color: '#2D3748' }}>{log.user}</td>
                <td style={{ padding: '10px 20px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: '#F7FAFC', color: '#4A5568',
                    fontWeight: '500', textTransform: 'capitalize',
                  }}>{log.role.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '10px 20px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: actionColors[log.action]?.bg || '#F7FAFC',
                    color: actionColors[log.action]?.color || '#718096',
                    fontWeight: '500',
                  }}>{log.action}</span>
                </td>
                <td style={{ padding: '10px 20px', fontSize: '12px', color: '#718096', textTransform: 'capitalize' }}>{log.entity_type}</td>
                <td style={{ padding: '10px 20px', fontSize: '12px', color: '#4A5568', fontFamily: 'monospace' }}>{log.ip_address}</td>
                <td style={{ padding: '10px 20px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: log.status === 'success' ? '#F0FFF4' : '#FFF5F5',
                    color: log.status === 'success' ? '#38A169' : '#E53E3E',
                    fontWeight: '500',
                  }}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;