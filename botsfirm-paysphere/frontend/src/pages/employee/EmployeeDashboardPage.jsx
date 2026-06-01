import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboardPage = () => {
  const navigate = useNavigate();

  const payslip = {
    month: 'April 2026',
    basic: 8000,
    taxableAllowances: 2000,
    nonTaxableAllowances: 500,
    grossPay: 10500,
    paye: 525,
    deductions: 0,
    netPay: 9975,
  };

  const leaveBalances = [
    { type: 'Annual Leave', remaining: 7, entitled: 15, color: '#2B6CB0' },
    { type: 'Sick Leave', remaining: 20, entitled: 20, color: '#38A169' },
    { type: 'Family Responsibility', remaining: 3, entitled: 3, color: '#D69E2E' },
  ];

  const recentLeave = [
    { type: 'Annual Leave', dates: '1 Apr — 3 Apr 2026', days: 3, status: 'approved' },
    { type: 'Annual Leave', dates: '2 Jun — 6 Jun 2026', days: 5, status: 'pending' },
  ];

  const statusColors = {
    pending: { bg: '#FFFFF0', color: '#D69E2E' },
    approved: { bg: '#F0FFF4', color: '#38A169' },
    rejected: { bg: '#FFF5F5', color: '#E53E3E' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>My Dashboard</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>Kgabo Construction (Pty) Ltd · EMP001</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Last Net Pay', value: 'BWP 9,975', subtitle: 'April 2026', color: '#38A169', icon: '💰', link: '/employee/payslip' },
          { label: 'Annual Leave Left', value: '7 days', subtitle: 'of 15 entitled', color: '#2B6CB0', icon: '📅', link: '/employee/leave' },
          { label: 'Pending Requests', value: '1', subtitle: 'Awaiting approval', color: '#D69E2E', icon: '⏱', link: '/employee/leave' },
          { label: 'Sick Leave Left', value: '20 days', subtitle: 'of 20 entitled', color: '#38A169', icon: '🏥', link: '/employee/leave' },
        ].map((card, i) => (
          <div
            key={i}
            onClick={() => navigate(card.link)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#718096', fontSize: '13px', marginBottom: '8px' }}>{card.label}</div>
                <div style={{ color: card.color, fontSize: '22px', fontWeight: '700' }}>{card.value}</div>
                <div style={{ color: '#718096', fontSize: '12px', marginTop: '4px' }}>{card.subtitle}</div>
              </div>
              <div style={{ fontSize: '24px' }}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Latest Payslip */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Latest Payslip — {payslip.month}</h3>
            <button
              onClick={() => navigate('/employee/payslip')}
              style={{ fontSize: '13px', color: '#2B6CB0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >View →</button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {[
              { label: 'Basic Salary', value: `BWP ${payslip.basic.toLocaleString()}` },
              { label: 'Taxable Allowances', value: `BWP ${payslip.taxableAllowances.toLocaleString()}` },
              { label: 'Non-Taxable Allowances', value: `BWP ${payslip.nonTaxableAllowances.toLocaleString()}` },
              { label: 'Gross Pay', value: `BWP ${payslip.grossPay.toLocaleString()}` },
              { label: 'PAYE Deduction', value: `- BWP ${payslip.paye.toLocaleString()}`, red: true },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid #F7FAFC' : 'none' }}>
                <span style={{ fontSize: '13px', color: '#718096' }}>{item.label}</span>
                <span style={{ fontSize: '13px', color: item.red ? '#E53E3E' : '#2D3748', fontWeight: '500' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#F0FFF4', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>Net Pay</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#38A169' }}>BWP {payslip.netPay.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => navigate('/employee/payslip')}
              style={{
                width: '100%', padding: '8px',
                backgroundColor: '#2B6CB0', color: '#FFFFFF',
                border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              }}
            >View & Download Payslip</button>
          </div>
        </div>

        {/* Leave Summary */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Leave Balances</h3>
            <button
              onClick={() => navigate('/employee/leave')}
              style={{ fontSize: '13px', color: '#2B6CB0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >Apply →</button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {leaveBalances.map((leave, i) => (
              <div key={i} style={{ marginBottom: i < leaveBalances.length - 1 ? '16px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500' }}>{leave.type}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: leave.color }}>{leave.remaining} <span style={{ color: '#718096', fontWeight: '400' }}>/ {leave.entitled} days</span></span>
                </div>
                <div style={{ backgroundColor: '#E2E8F0', borderRadius: '4px', height: '6px' }}>
                  <div style={{ width: `${(leave.remaining / leave.entitled) * 100}%`, backgroundColor: leave.color, height: '6px', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => navigate('/employee/leave')}
              style={{
                width: '100%', padding: '8px',
                backgroundColor: '#FFFFFF', color: '#2B6CB0',
                border: '1px solid #2B6CB0', borderRadius: '6px',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              }}
            >Apply for Leave</button>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Recent Leave Requests</h3>
        </div>
        <div>
          {recentLeave.map((leave, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < recentLeave.length - 1 ? '1px solid #F7FAFC' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{leave.type}</div>
                <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{leave.dates} · {leave.days} days</div>
              </div>
              <span style={{
                fontSize: '12px', padding: '3px 12px', borderRadius: '10px',
                backgroundColor: statusColors[leave.status].bg,
                color: statusColors[leave.status].color,
                fontWeight: '500', textTransform: 'capitalize',
              }}>{leave.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;