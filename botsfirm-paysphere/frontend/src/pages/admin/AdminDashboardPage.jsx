import React from 'react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subtitle, color, icon, onClick }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: '#718096', fontSize: '13px', marginBottom: '8px' }}>{title}</div>
        <div style={{ color: color || '#2D3748', fontSize: '28px', fontWeight: '700' }}>{value}</div>
        {subtitle && <div style={{ color: '#718096', fontSize: '12px', marginTop: '4px' }}>{subtitle}</div>}
      </div>
      <div style={{ fontSize: '28px' }}>{icon}</div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-BW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const recentEmployees = [
    { name: 'Gorata Mosimanegape', number: 'EMP001', title: 'Site Foreman', type: 'Permanent', added: '2026-03-24' },
    { name: 'Tshepiso Kgari', number: 'EMP002', title: 'Engineer', type: 'Permanent', added: '2026-03-24' },
    { name: 'Boitumelo Selwe', number: 'EMP003', title: 'Accountant', type: 'Permanent', added: '2026-03-24' },
  ];

  const pendingTasks = [
    { task: 'Run May 2026 Payroll', priority: 'high', link: '/admin/payroll' },
    { task: '2 leave requests pending client approval', priority: 'medium', link: '/admin/leave' },
    { task: 'ITW-7 due in 22 days', priority: 'medium', link: '/admin/reports' },
    { task: 'Work permit expiry — Tshepiso Kgari (83 days)', priority: 'low', link: '/admin/employees' },
  ];

  const priorityColors = {
    high: { bg: '#FFF5F5', color: '#E53E3E', dot: '#E53E3E' },
    medium: { bg: '#FFFFF0', color: '#D69E2E', dot: '#D69E2E' },
    low: { bg: '#F0FFF4', color: '#38A169', dot: '#38A169' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>{today}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Employees" value={3} subtitle="Active staff" color="#2B6CB0" icon="👥" onClick={() => navigate('/admin/employees')} />
        <StatCard title="Payroll Status" value="Pending" subtitle="May 2026" color="#D69E2E" icon="💰" onClick={() => navigate('/admin/payroll')} />
        <StatCard title="Leave Requests" value={2} subtitle="Pending approval" color="#D69E2E" icon="📅" onClick={() => navigate('/admin/leave')} />
        <StatCard title="Next BURS Due" value="22 days" subtitle="ITW-7 June 15" color="#38A169" icon="📋" onClick={() => navigate('/admin/reports')} />
      </div>

      {/* Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Pending Tasks */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Pending Tasks</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {pendingTasks.map((task, i) => (
              <div
                key={i}
                onClick={() => navigate(task.link)}
                style={{
                  padding: '12px 20px',
                  borderBottom: i < pendingTasks.length - 1 ? '1px solid #F7FAFC' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: priorityColors[task.priority].dot,
                  flexShrink: 0,
                }} />
                <div style={{ fontSize: '13px', color: '#2D3748' }}>{task.task}</div>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: priorityColors[task.priority].bg,
                  color: priorityColors[task.priority].color,
                  fontWeight: '500',
                  textTransform: 'capitalize',
                  flexShrink: 0,
                }}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Quick Actions</h3>
          </div>
          <div style={{ padding: '16px' }}>
            {[
              { label: '+ Add Employee', color: '#2B6CB0', link: '/admin/employees' },
              { label: '▶ Run Payroll', color: '#805AD5', link: '/admin/payroll' },
              { label: '📄 Generate ITW-7', color: '#38A169', link: '/admin/reports' },
              { label: '📅 View Leave Requests', color: '#D69E2E', link: '/admin/leave' },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.link)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  marginBottom: '8px',
                  backgroundColor: '#F7FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  color: action.color,
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >{action.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Employees</h3>
          <button
            onClick={() => navigate('/admin/employees')}
            style={{ fontSize: '13px', color: '#2B6CB0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >View all →</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                {['Employee', 'Number', 'Job Title', 'Type', 'Added'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map((emp, i) => (
                <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#2B6CB0',
                      }}>{emp.name.charAt(0)}</div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#718096' }}>{emp.number}</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4A5568' }}>{emp.title}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#F0FFF4', color: '#38A169', fontWeight: '500' }}>{emp.type}</span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#718096' }}>{emp.added}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;