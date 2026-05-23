import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, subtitle, color, icon }) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  }}>
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

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalClients: 2,
    activeTrials: 0,
    totalEmployees: 6,
    expiringSoon: 0,
  });

  const recentActivity = [
    { action: 'New client registered', detail: 'Kgabo Construction (Pty) Ltd', time: 'Today', status: 'success' },
    { action: 'New client registered', detail: 'Petra Holdings (Pty) Ltd', time: 'Today', status: 'success' },
    { action: 'Database initialized', detail: 'Seed data loaded successfully', time: 'Today', status: 'success' },
  ];

  const clients = [
    { name: 'Kgabo Construction (Pty) Ltd', plan: 'Growth', employees: 3, status: 'Active', since: 'Mar 2026' },
    { name: 'Petra Holdings (Pty) Ltd', plan: 'Business', employees: 3, status: 'Active', since: 'Feb 2026' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>
          Super Admin Dashboard
        </h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          Platform overview — {new Date().toLocaleDateString('en-BW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Clients" value={stats.totalClients} subtitle="Active subscriptions" color="#2B6CB0" icon="🏢" />
        <StatCard title="Active Trials" value={stats.activeTrials} subtitle="7-day free trials" color="#D69E2E" icon="⏱️" />
        <StatCard title="Total Employees" value={stats.totalEmployees} subtitle="Across all clients" color="#38A169" icon="👥" />
        <StatCard title="Expiring Soon" value={stats.expiringSoon} subtitle="Work permits this month" color="#E53E3E" icon="⚠️" />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Recent Activity */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Recent Activity</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentActivity.map((item, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: i < recentActivity.length - 1 ? '1px solid #F7FAFC' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{item.action}</div>
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{item.detail}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#718096' }}>{item.time}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: item.status === 'success' ? '#F0FFF4' : '#FFF5F5',
                    color: item.status === 'success' ? '#38A169' : '#E53E3E',
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BURS Compliance Countdown */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Compliance Calendar</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {[
              { label: 'ITW-7 Due (May 2026)', date: 'June 15, 2026', daysLeft: 23, color: '#38A169' },
              { label: 'ITW-7 Due (Jun 2026)', date: 'July 15, 2026', daysLeft: 53, color: '#2B6CB0' },
              { label: 'ITW-10 Annual Return', date: 'September 30, 2026', daysLeft: 130, color: '#2B6CB0' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#2D3748' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: item.daysLeft <= 30 ? '#E53E3E' : '#718096' }}>
                    {item.daysLeft} days left
                  </span>
                </div>
                <div style={{ backgroundColor: '#F7FAFC', borderRadius: '4px', height: '6px' }}>
                  <div style={{
                    backgroundColor: item.color,
                    width: `${Math.max(5, 100 - (item.daysLeft / 180 * 100))}%`,
                    height: '6px',
                    borderRadius: '4px',
                  }} />
                </div>
                <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>Due: {item.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>All Clients</h3>
          <button style={{
            padding: '6px 16px',
            backgroundColor: '#2B6CB0',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}>
            + New Client
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                {['Company', 'Plan', 'Employees', 'Status', 'Member Since', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{client.name}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '10px', backgroundColor: '#EBF8FF', color: '#2B6CB0', fontWeight: '500' }}>{client.plan}</span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '14px', color: '#4A5568' }}>{client.employees}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '10px', backgroundColor: '#F0FFF4', color: '#38A169', fontWeight: '500' }}>{client.status}</span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '14px', color: '#4A5568' }}>{client.since}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <button style={{ fontSize: '12px', color: '#2B6CB0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;