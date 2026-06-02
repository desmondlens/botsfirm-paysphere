import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../services/api';

const ClientAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await clientAPI.getAuditLogs();
        setLogs(data.logs || []);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.user_role?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const actionColors = {
    LOGIN: { bg: '#F0FFF4', color: '#38A169' },
    LOGIN_FAILED: { bg: '#FFF5F5', color: '#E53E3E' },
    LOGOUT: { bg: '#F7FAFC', color: '#718096' },
    EMPLOYEE_CREATED: { bg: '#EBF8FF', color: '#2B6CB0' },
    PAYROLL_RUN: { bg: '#FAF5FF', color: '#805AD5' },
    LEAVE_APPROVED: { bg: '#F0FFF4', color: '#38A169' },
    LEAVE_REJECTED: { bg: '#FFF5F5', color: '#E53E3E' },
    PAYSLIP_DOWNLOADED: { bg: '#FFFFF0', color: '#D69E2E' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#718096' }}>
      Loading audit logs...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Audit Logs</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          Complete activity trail for your company — {logs.length} records
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Events', value: logs.length, color: '#2B6CB0' },
          { label: 'Successful', value: logs.filter(l => l.status === 'success').length, color: '#38A169' },
          { label: 'Failed', value: logs.filter(l => l.status === 'failed').length, color: '#E53E3E' },
          { label: 'Today', value: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, color: '#805AD5' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ color: stat.color, fontSize: '24px', fontWeight: '700' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search action or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF' }}
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Logs Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              {['Time', 'Role', 'Action', 'Entity', 'IP Address', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#718096', fontSize: '14px' }}>
                  No audit logs found
                </td>
              </tr>
            ) : filtered.map((log, i) => (
              <tr key={i} style={{ borderTop: '1px solid #E2E8F0', backgroundColor: log.status === 'failed' ? '#FFFAFA' : 'transparent' }}>
                <td style={{ padding: '10px 20px', fontSize: '12px', color: '#718096', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString('en-BW')}
                </td>
                <td style={{ padding: '10px 20px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#F7FAFC', color: '#4A5568', fontWeight: '500', textTransform: 'capitalize' }}>
                    {log.user_role?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '10px 20px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: actionColors[log.action]?.bg || '#F7FAFC',
                    color: actionColors[log.action]?.color || '#718096',
                    fontWeight: '500',
                  }}>{log.action}</span>
                </td>
                <td style={{ padding: '10px 20px', fontSize: '12px', color: '#718096', textTransform: 'capitalize' }}>{log.entity_type || '—'}</td>
                <td style={{ padding: '10px 20px', fontSize: '12px', color: '#4A5568', fontFamily: 'monospace' }}>{log.ip_address || '—'}</td>
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

export default ClientAuditLogsPage;