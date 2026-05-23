import React, { useState } from 'react';

const TrialsPage = () => {
  const [trials, setTrials] = useState([
    {
      id: '1',
      company_name: 'Demo Company Ltd',
      full_name: 'Tebogo Sithole',
      email: 'tebogo@democompany.co.bw',
      phone: '+267 74 123 456',
      plan_assigned: 'starter',
      employees_added: 3,
      payroll_runs_count: 1,
      trial_start: '2026-05-20',
      trial_end: '2026-05-27',
      status: 'active',
      days_left: 4,
    },
    {
      id: '2',
      company_name: 'Sunrise Trading (Pty) Ltd',
      full_name: 'Mpho Kgomotso',
      email: 'mpho@sunrisetrading.co.bw',
      phone: '+267 76 987 654',
      plan_assigned: 'growth',
      employees_added: 5,
      payroll_runs_count: 1,
      trial_start: '2026-05-15',
      trial_end: '2026-05-22',
      status: 'expired',
      days_left: 0,
    },
  ]);

  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({ plan: 'starter', max_employees: '10' });
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = trials.filter(t =>
    filterStatus === 'all' || t.status === filterStatus
  );

  const statusColors = {
    active: { bg: '#F0FFF4', color: '#38A169' },
    expired: { bg: '#FFF5F5', color: '#E53E3E' },
    converted: { bg: '#EBF8FF', color: '#2B6CB0' },
    deleted: { bg: '#F7FAFC', color: '#718096' },
  };

  const handleConvert = () => {
    setTrials(prev => prev.map(t =>
      t.id === selectedTrial.id ? { ...t, status: 'converted' } : t
    ));
    setShowConvertModal(false);
    setSelectedTrial(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Trials</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          Monitor and convert 7-day free trials
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Active Trials', value: trials.filter(t => t.status === 'active').length, color: '#38A169' },
          { label: 'Expired', value: trials.filter(t => t.status === 'expired').length, color: '#E53E3E' },
          { label: 'Converted', value: trials.filter(t => t.status === 'converted').length, color: '#2B6CB0' },
          { label: 'Ran Payroll', value: trials.filter(t => t.payroll_runs_count > 0).length, color: '#805AD5' },
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

      {/* Filter */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        padding: '12px 20px',
        marginBottom: '16px',
        display: 'flex',
        gap: '8px',
      }}>
        {['all', 'active', 'expired', 'converted'].map(s => (
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

      {/* Trials Table */}
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
              {['Company', 'Contact', 'Plan', 'Activity', 'Trial Period', 'Days Left', 'Status', 'Actions'].map(h => (
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
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#718096', fontSize: '14px' }}>
                  No trials found
                </td>
              </tr>
            ) : filtered.map((trial) => (
              <tr key={trial.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{trial.company_name}</div>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ fontSize: '13px', color: '#2D3748' }}>{trial.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>{trial.email}</div>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: '12px', padding: '2px 10px', borderRadius: '10px',
                    backgroundColor: '#EBF8FF', color: '#2B6CB0',
                    fontWeight: '500', textTransform: 'capitalize',
                  }}>{trial.plan_assigned}</span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ fontSize: '12px', color: '#4A5568' }}>👥 {trial.employees_added} employees</div>
                  <div style={{ fontSize: '12px', color: trial.payroll_runs_count > 0 ? '#38A169' : '#718096', marginTop: '2px' }}>
                    {trial.payroll_runs_count > 0 ? '✓ Ran payroll' : '✗ No payroll run'}
                  </div>
                </td>
                <td style={{ padding: '12px 20px', fontSize: '12px', color: '#4A5568' }}>
                  <div>{trial.trial_start}</div>
                  <div>{trial.trial_end}</div>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: trial.days_left <= 2 ? '#E53E3E' : trial.days_left <= 4 ? '#D69E2E' : '#38A169',
                  }}>
                    {trial.status === 'active' ? `${trial.days_left} days` : '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: '12px', padding: '2px 10px', borderRadius: '10px',
                    backgroundColor: statusColors[trial.status]?.bg,
                    color: statusColors[trial.status]?.color,
                    fontWeight: '500', textTransform: 'capitalize',
                  }}>{trial.status}</span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  {(trial.status === 'active' || trial.status === 'expired') && (
                    <button
                      onClick={() => { setSelectedTrial(trial); setShowConvertModal(true); }}
                      style={{
                        fontSize: '12px', color: '#38A169',
                        background: 'none', border: '1px solid #38A169',
                        borderRadius: '4px', padding: '3px 10px',
                        cursor: 'pointer', fontWeight: '500',
                      }}
                    >Convert</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Convert Modal */}
      {showConvertModal && selectedTrial && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '24px',
            width: '440px',
            maxWidth: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Convert Trial to Paid</h3>
              <button onClick={() => setShowConvertModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            <div style={{ backgroundColor: '#F7FAFC', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{selectedTrial.company_name}</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{selectedTrial.email}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>Select Plan</label>
              <select
                value={convertData.plan}
                onChange={e => setConvertData(prev => ({ ...prev, plan: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF' }}
              >
                <option value="starter">Starter (1-10 employees)</option>
                <option value="growth">Growth (11-50 employees)</option>
                <option value="business">Business (51-100 employees)</option>
                <option value="enterprise">Enterprise (100+)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>Max Employees</label>
              <input
                type="number"
                value={convertData.max_employees}
                onChange={e => setConvertData(prev => ({ ...prev, max_employees: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ backgroundColor: '#FFFFF0', border: '1px solid #D69E2E', borderRadius: '6px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#744210' }}>
              ⚠️ All trial data will be preserved. An invite code will be generated and emailed to the client.
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConvertModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleConvert} style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Convert to Paid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialsPage;