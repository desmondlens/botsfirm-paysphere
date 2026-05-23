import React, { useState } from 'react';

const StatCard = ({ title, value, subtitle, color, icon, alert }) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    border: `1px solid ${alert ? '#FEB2B2' : '#E2E8F0'}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    backgroundColor: alert ? '#FFF5F5' : '#FFFFFF',
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

const ClientDashboardPage = () => {
  const companyName = 'Kgabo Construction (Pty) Ltd';
  const today = new Date().toLocaleDateString('en-BW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const daysUntilITW7 = () => {
    const now = new Date();
    const due = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  const pendingLeave = [
    { employee: 'Gorata Mosimanegape', type: 'Annual Leave', dates: '2 Jun - 6 Jun 2026', days: 5 },
    { employee: 'Tshepiso Kgari', type: 'Sick Leave', dates: '26 May 2026', days: 1 },
  ];

  const payrollSummary = {
    month: 'May 2026',
    status: 'Pending',
    total_gross: 'BWP 45,000',
    total_paye: 'BWP 7,850',
    total_net: 'BWP 37,150',
    employees: 3,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>{companyName}</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>{today}</p>
      </div>

      {/* BURS Alert */}
      {daysUntilITW7() <= 10 && (
        <div style={{
          backgroundColor: '#FFF5F5',
          border: '1px solid #FEB2B2',
          borderRadius: '8px',
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#C53030' }}>BURS Deadline Alert</div>
            <div style={{ fontSize: '13px', color: '#E53E3E' }}>ITW-7 monthly return is due in {daysUntilITW7()} days. Submit your PAYE to BURS by the 15th.</div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Employees" value={3} subtitle="Active staff" color="#2B6CB0" icon="👥" />
        <StatCard title="Pending Leave" value={pendingLeave.length} subtitle="Awaiting your approval" color="#D69E2E" icon="✅" alert={pendingLeave.length > 0} />
        <StatCard title="May Payroll" value="BWP 37,150" subtitle="Net pay — Pending" color="#805AD5" icon="💰" />
        <StatCard title="ITW-7 Due" value={`${daysUntilITW7()} days`} subtitle="June 15, 2026" color={daysUntilITW7() <= 10 ? '#E53E3E' : '#38A169'} icon="📋" />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Pending Leave Approvals */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Pending Leave Approvals</h3>
            <a href="/client/leave-approvals" style={{ fontSize: '13px', color: '#2B6CB0', textDecoration: 'none' }}>View all</a>
          </div>
          <div>
            {pendingLeave.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#718096', fontSize: '14px' }}>No pending approvals</div>
            ) : pendingLeave.map((leave, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: i < pendingLeave.length - 1 ? '1px solid #F7FAFC' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{leave.employee}</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{leave.type} — {leave.dates}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{leave.days} day{leave.days > 1 ? 's' : ''}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FFFFF0', color: '#D69E2E', fontWeight: '500' }}>Pending</span>
                </div>
              </div>
            ))}
          </div>
          {pendingLeave.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0' }}>
              <a href="/client/leave-approvals" style={{
                display: 'block',
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#2B6CB0',
                color: '#FFFFFF',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
              }}>Review & Approve Leave</a>
            </div>
          )}
        </div>

        {/* Payroll Summary */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Payroll — {payrollSummary.month}</h3>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FFFFF0', color: '#D69E2E', fontWeight: '500' }}>{payrollSummary.status}</span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {[
              { label: 'Employees', value: payrollSummary.employees },
              { label: 'Total Gross Pay', value: payrollSummary.total_gross },
              { label: 'Total PAYE', value: payrollSummary.total_paye },
              { label: 'Total Net Pay', value: payrollSummary.total_net },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid #F7FAFC' : 'none' }}>
                <span style={{ fontSize: '13px', color: '#718096' }}>{item.label}</span>
                <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '600' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0' }}>
            <a href="/client/payroll" style={{
              display: 'block',
              textAlign: 'center',
              padding: '8px',
              backgroundColor: '#FFFFFF',
              color: '#2B6CB0',
              border: '1px solid #2B6CB0',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
            }}>View Full Payroll</a>
          </div>
        </div>
      </div>

      {/* Compliance Calendar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>BURS Compliance Calendar</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {[
            { label: 'ITW-7 Monthly Return (May 2026)', due: 'June 15, 2026', days: daysUntilITW7(), status: 'pending' },
            { label: 'ITW-7 Monthly Return (Jun 2026)', due: 'July 15, 2026', days: daysUntilITW7() + 30, status: 'upcoming' },
            { label: 'ITW-10 Annual Return', due: 'September 30, 2026', days: 129, status: 'upcoming' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid #F7FAFC' : 'none' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Due: {item.due}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: item.days <= 10 ? '#E53E3E' : item.days <= 20 ? '#D69E2E' : '#38A169' }}>
                  {item.days} days left
                </div>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                  backgroundColor: item.status === 'pending' ? '#FFFFF0' : '#F7FAFC',
                  color: item.status === 'pending' ? '#D69E2E' : '#718096',
                  fontWeight: '500', textTransform: 'capitalize',
                }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;