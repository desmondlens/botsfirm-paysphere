import React, { useState } from 'react';

const CompliancePage = () => {
  const [activeTab, setActiveTab] = useState('calendar');

  const now = new Date();
  const daysUntil = (month, day) => {
    const due = new Date(now.getFullYear(), month - 1, day);
    if (due < now) due.setFullYear(due.getFullYear() + 1);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  const compliance = [
    { label: 'ITW-7 Monthly Return (May 2026)', type: 'PAYE', due: 'June 15, 2026', days: daysUntil(6, 15), status: 'pending' },
    { label: 'ITW-7 Monthly Return (Jun 2026)', type: 'PAYE', due: 'July 15, 2026', days: daysUntil(7, 15), status: 'upcoming' },
    { label: 'ITW-7 Monthly Return (Jul 2026)', type: 'PAYE', due: 'August 15, 2026', days: daysUntil(8, 15), status: 'upcoming' },
    { label: 'ITW-10 Annual Return', type: 'Annual', due: 'September 30, 2026', days: daysUntil(9, 30), status: 'upcoming' },
    { label: 'ITW-8 Employee Certificates', type: 'Annual', due: 'September 30, 2026', days: daysUntil(9, 30), status: 'upcoming' },
  ];

  const history = [
    { label: 'ITW-7 Monthly Return (Apr 2026)', type: 'PAYE', submitted: 'May 12, 2026', reference: 'BURS-2026-04-KGB', status: 'submitted' },
    { label: 'ITW-7 Monthly Return (Mar 2026)', type: 'PAYE', submitted: 'April 14, 2026', reference: 'BURS-2026-03-KGB', status: 'submitted' },
    { label: 'ITW-7 Monthly Return (Feb 2026)', type: 'PAYE', submitted: 'March 13, 2026', reference: 'BURS-2026-02-KGB', status: 'submitted' },
  ];

  const workPermits = [
    { employee: 'Tshepiso Kgari', permit: 'WP-2024-00123', expiry: '2026-08-15', days: 83, status: 'warning' },
  ];

  const tabs = [
    { key: 'calendar', label: 'BURS Calendar' },
    { key: 'history', label: 'Submission History' },
    { key: 'permits', label: 'Work Permits' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Compliance</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          BURS deadlines, submission history and work permit alerts
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Next Deadline', value: `${daysUntil(6, 15)} days`, subtitle: 'ITW-7 June 15', color: daysUntil(6, 15) <= 10 ? '#E53E3E' : '#D69E2E' },
          { label: 'Submitted This Year', value: history.length, subtitle: 'On time returns', color: '#38A169' },
          { label: 'Work Permit Alerts', value: workPermits.length, subtitle: 'Expiring soon', color: workPermits.length > 0 ? '#E53E3E' : '#38A169' },
          { label: 'Compliance Score', value: '100%', subtitle: 'All returns on time', color: '#38A169' },
        ].map((card, i) => (
          <div key={i} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ color: card.color, fontSize: '22px', fontWeight: '700' }}>{card.value}</div>
            <div style={{ color: '#718096', fontSize: '11px', marginTop: '4px' }}>{card.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 20px' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 20px',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #2B6CB0' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.key ? '#2B6CB0' : '#718096',
                fontWeight: activeTab === tab.key ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >{tab.label}</button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>

          {/* BURS Calendar */}
          {activeTab === 'calendar' && (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '13px', color: '#718096' }}>
                PAYE must be remitted to BURS by the 15th of the following month. Failure attracts 10% interest plus penalties.
              </div>
              {compliance.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: item.days <= 10 ? '#FEB2B2' : '#E2E8F0',
                  backgroundColor: item.days <= 10 ? '#FFF5F5' : '#FFFFFF',
                  marginBottom: '8px',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Due: {item.due} · Type: {item.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: item.days <= 10 ? '#E53E3E' : item.days <= 20 ? '#D69E2E' : '#38A169' }}>
                      {item.days} days
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
          )}

          {/* Submission History */}
          {activeTab === 'history' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7FAFC' }}>
                    {['Return', 'Type', 'Submitted', 'Reference', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{item.label}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{item.type}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{item.submitted}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4A5568', fontFamily: 'monospace' }}>{item.reference}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#F0FFF4', color: '#38A169', fontWeight: '500' }}>
                          ✓ {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Work Permits */}
          {activeTab === 'permits' && (
            <div>
              {workPermits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '14px' }}>
                  ✓ No work permit alerts
                </div>
              ) : workPermits.map((permit, i) => (
                <div key={i} style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #FEB2B2',
                  backgroundColor: '#FFF5F5',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{permit.employee}</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                      Permit: {permit.permit} · Expires: {permit.expiry}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#E53E3E' }}>{permit.days} days</div>
                    <div style={{ fontSize: '11px', color: '#E53E3E' }}>until expiry</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#718096', backgroundColor: '#F7FAFC', padding: '12px 16px', borderRadius: '6px' }}>
                Work permit alerts are sent automatically 60 and 30 days before expiry. Ensure permits are renewed on time to avoid legal issues.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;