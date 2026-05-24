import React, { useState } from 'react';

const LeavePage = () => {
  const [activeTab, setActiveTab] = useState('requests');

  const [requests, setRequests] = useState([
    {
      id: '1',
      employee: 'Gorata Mosimanegape',
      number: 'EMP001',
      type: 'Annual Leave',
      start_date: '2026-06-02',
      end_date: '2026-06-06',
      days: 5,
      reason: 'Family vacation',
      applied_at: '2026-05-24',
      status: 'pending',
    },
    {
      id: '2',
      employee: 'Tshepiso Kgari',
      number: 'EMP002',
      type: 'Sick Leave',
      start_date: '2026-05-26',
      end_date: '2026-05-26',
      days: 1,
      reason: 'Not feeling well',
      applied_at: '2026-05-24',
      status: 'pending',
    },
    {
      id: '3',
      employee: 'Gorata Mosimanegape',
      number: 'EMP001',
      type: 'Annual Leave',
      start_date: '2026-04-01',
      end_date: '2026-04-03',
      days: 3,
      reason: 'Personal',
      applied_at: '2026-03-25',
      status: 'approved',
    },
  ]);

  const balances = [
    {
      employee: 'Gorata Mosimanegape',
      number: 'EMP001',
      annual: { entitled: 15, taken: 3, pending: 5, remaining: 7 },
      sick: { entitled: 20, taken: 0, pending: 0, remaining: 20 },
      family: { entitled: 3, taken: 0, pending: 0, remaining: 3 },
    },
    {
      employee: 'Tshepiso Kgari',
      number: 'EMP002',
      annual: { entitled: 15, taken: 0, pending: 0, remaining: 15 },
      sick: { entitled: 20, taken: 0, pending: 1, remaining: 19 },
      family: { entitled: 3, taken: 0, pending: 0, remaining: 3 },
    },
    {
      employee: 'Boitumelo Selwe',
      number: 'EMP003',
      annual: { entitled: 15, taken: 0, pending: 0, remaining: 15 },
      sick: { entitled: 20, taken: 0, pending: 0, remaining: 20 },
      family: { entitled: 3, taken: 0, pending: 0, remaining: 3 },
    },
  ];

  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = requests.filter(r =>
    filterStatus === 'all' || r.status === filterStatus
  );

  const statusColors = {
    pending: { bg: '#FFFFF0', color: '#D69E2E' },
    approved: { bg: '#F0FFF4', color: '#38A169' },
    rejected: { bg: '#FFF5F5', color: '#E53E3E' },
  };

  const typeColors = {
    'Annual Leave': { bg: '#EBF8FF', color: '#2B6CB0' },
    'Sick Leave': { bg: '#FFF5F5', color: '#E53E3E' },
    'Maternity Leave': { bg: '#FAF5FF', color: '#805AD5' },
    'Paternity Leave': { bg: '#F0FFF4', color: '#38A169' },
    'Family Responsibility': { bg: '#FFFAF0', color: '#DD6B20' },
  };

  const tabs = [
    { key: 'requests', label: 'Leave Requests' },
    { key: 'balances', label: 'Leave Balances' },
    { key: 'entitlements', label: 'Entitlements' },
  ];

  const BalanceBar = ({ taken, pending, entitled }) => {
    const takenPct = (taken / entitled) * 100;
    const pendingPct = (pending / entitled) * 100;
    return (
      <div style={{ backgroundColor: '#E2E8F0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: `${takenPct}%`, backgroundColor: '#2B6CB0' }} />
          <div style={{ width: `${pendingPct}%`, backgroundColor: '#D69E2E' }} />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Leave Management</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          Manage leave requests and balances — approval requires client password
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: '#D69E2E' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: '#38A169' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: '#E53E3E' },
          { label: 'Total Requests', value: requests.length, color: '#2B6CB0' },
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

      {/* Notice */}
      <div style={{
        backgroundColor: '#EBF8FF',
        border: '1px solid #BEE3F8',
        borderRadius: '8px',
        padding: '12px 20px',
        marginBottom: '16px',
        fontSize: '13px',
        color: '#2C5282',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span>🔐</span>
        <span>Leave approvals require the client's password. You can review and recommend but only the client can approve.</span>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
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

          {/* Leave Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: filterStatus === s ? '#2B6CB0' : '#E2E8F0',
                      backgroundColor: filterStatus === s ? '#EBF8FF' : 'transparent',
                      color: filterStatus === s ? '#2B6CB0' : '#718096',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: filterStatus === s ? '600' : '400',
                      textTransform: 'capitalize',
                    }}
                  >{s}</button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '14px' }}>
                    No {filterStatus === 'all' ? '' : filterStatus} leave requests
                  </div>
                ) : filtered.map(leave => (
                  <div key={leave.id} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FAFAFA',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{leave.employee}</span>
                          <span style={{ fontSize: '11px', color: '#718096' }}>{leave.number}</span>
                          <span style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                            backgroundColor: typeColors[leave.type]?.bg || '#F7FAFC',
                            color: typeColors[leave.type]?.color || '#718096',
                            fontWeight: '500',
                          }}>{leave.type}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#4A5568', display: 'flex', gap: '20px' }}>
                          <span>📅 {leave.start_date} to {leave.end_date}</span>
                          <span>⏱ {leave.days} day{leave.days > 1 ? 's' : ''}</span>
                        </div>
                        {leave.reason && (
                          <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>Reason: {leave.reason}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{
                          fontSize: '12px', padding: '3px 12px', borderRadius: '10px',
                          backgroundColor: statusColors[leave.status]?.bg,
                          color: statusColors[leave.status]?.color,
                          fontWeight: '500', textTransform: 'capitalize',
                        }}>{leave.status}</span>
                        {leave.status === 'pending' && (
                          <div style={{ fontSize: '12px', color: '#718096', textAlign: 'right' }}>
                            Awaiting client approval
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leave Balances Tab */}
          {activeTab === 'balances' && (
            <div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F7FAFC' }}>
                      {['Employee', 'Annual Leave', 'Sick Leave', 'Family Responsibility'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((b, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{b.employee}</div>
                          <div style={{ fontSize: '12px', color: '#718096' }}>{b.number}</div>
                        </td>
                        {[b.annual, b.sick, b.family].map((leave, j) => (
                          <td key={j} style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '13px', color: '#2D3748', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '600', color: '#2B6CB0' }}>{leave.remaining}</span>
                              <span style={{ color: '#718096' }}> / {leave.entitled} days remaining</span>
                            </div>
                            <BalanceBar taken={leave.taken} pending={leave.pending} entitled={leave.entitled} />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: '#718096' }}>
                              <span>Taken: {leave.taken}</span>
                              {leave.pending > 0 && <span style={{ color: '#D69E2E' }}>Pending: {leave.pending}</span>}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: '#718096' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '6px', backgroundColor: '#2B6CB0', borderRadius: '2px' }} />
                  Taken
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '6px', backgroundColor: '#D69E2E', borderRadius: '2px' }} />
                  Pending
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
                  Remaining
                </div>
              </div>
            </div>
          )}

          {/* Entitlements Tab */}
          {activeTab === 'entitlements' && (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '13px', color: '#718096' }}>
                Leave entitlements per Botswana Employment Act 2010
              </div>
              {[
                { type: 'Annual Leave', days: 15, paid: '100%', notes: '8 days must be taken in first 6 months. Balance carries over up to 3 years.', color: '#2B6CB0' },
                { type: 'Sick Leave', days: 20, paid: '100%', notes: 'Doctor certificate required. Excessive sick leave may trigger HR review.', color: '#E53E3E' },
                { type: 'Maternity Leave', days: 84, paid: '50%', notes: '12 weeks. 6 weeks before birth, 6 weeks after. Cannot be compelled to work during this period.', color: '#805AD5' },
                { type: 'Paternity Leave', days: 5, paid: '100%', notes: '5 working days at full pay. Must be taken within 1 month of birth.', color: '#38A169' },
                { type: 'Family Responsibility', days: 3, paid: '100%', notes: 'For serious illness or death of immediate family member.', color: '#DD6B20' },
              ].map((leave, i) => (
                <div key={i} style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '10px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '8px',
                    backgroundColor: `${leave.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '700', color: leave.color,
                    flexShrink: 0,
                  }}>{leave.days}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{leave.type}</div>
                      <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '10px', backgroundColor: '#F0FFF4', color: '#38A169', fontWeight: '500' }}>
                        {leave.paid} paid
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096' }}>{leave.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeavePage;