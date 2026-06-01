import React, { useState } from 'react';

const EmployeeLeavePage = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [requests, setRequests] = useState([
    { id: '1', type: 'Annual Leave', start: '2026-04-01', end: '2026-04-03', days: 3, reason: 'Personal', status: 'approved', applied: '2026-03-25' },
    { id: '2', type: 'Annual Leave', start: '2026-06-02', end: '2026-06-06', days: 5, reason: 'Family vacation', status: 'pending', applied: '2026-05-24' },
  ]);

  const balances = [
    { type: 'Annual Leave', entitled: 15, taken: 3, pending: 5, remaining: 7, color: '#2B6CB0', carry_over: 0 },
    { type: 'Sick Leave', entitled: 20, taken: 0, pending: 0, remaining: 20, color: '#38A169', carry_over: 0 },
    { type: 'Maternity Leave', entitled: 84, taken: 0, pending: 0, remaining: 84, color: '#805AD5', carry_over: 0 },
    { type: 'Paternity Leave', entitled: 5, taken: 0, pending: 0, remaining: 5, color: '#38A169', carry_over: 0 },
    { type: 'Family Responsibility', entitled: 3, taken: 0, pending: 0, remaining: 3, color: '#D69E2E', carry_over: 0 },
  ];

  const [form, setForm] = useState({
    type: 'Annual Leave',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    let days = 0;
    const current = new Date(s);
    while (current <= e) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) days++;
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = calculateDays(form.start_date, form.end_date);

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Required';
    if (!form.start_date) e.start_date = 'Required';
    if (!form.end_date) e.end_date = 'Required';
    if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
      e.end_date = 'End date must be after start date';
    }
    if (!form.reason.trim()) e.reason = 'Please provide a reason';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setRequests(prev => [...prev, {
      id: Date.now().toString(),
      type: form.type,
      start: form.start_date,
      end: form.end_date,
      days,
      reason: form.reason,
      status: 'pending',
      applied: new Date().toISOString().split('T')[0],
    }]);
    setForm({ type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setActiveTab('history');
  };

  const statusColors = {
    pending: { bg: '#FFFFF0', color: '#D69E2E' },
    approved: { bg: '#F0FFF4', color: '#38A169' },
    rejected: { bg: '#FFF5F5', color: '#E53E3E' },
  };

  const tabs = [
    { key: 'apply', label: 'Apply for Leave' },
    { key: 'history', label: 'My Requests' },
    { key: 'balances', label: 'My Balances' },
  ];

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>My Leave</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>Apply for leave and view your balances</p>
      </div>

      {submitted && (
        <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '8px', padding: '12px 20px', marginBottom: '16px', fontSize: '13px', color: '#276749' }}>
          ✓ Leave request submitted successfully. Your manager will review it shortly.
        </div>
      )}

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 20px' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 20px', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #2B6CB0' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.key ? '#2B6CB0' : '#718096',
                fontWeight: activeTab === tab.key ? '600' : '400',
                fontSize: '14px', cursor: 'pointer', marginBottom: '-1px',
              }}
            >{tab.label}</button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>

          {/* Apply Tab */}
          {activeTab === 'apply' && (
            <div style={{ maxWidth: '500px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>New Leave Request</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Leave Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                  style={inputStyle}
                >
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Maternity Leave</option>
                  <option>Paternity Leave</option>
                  <option>Family Responsibility</option>
                  <option>Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                    style={{ ...inputStyle, borderColor: errors.start_date ? '#E53E3E' : '#E2E8F0' }}
                  />
                  {errors.start_date && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.start_date}</div>}
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                    style={{ ...inputStyle, borderColor: errors.end_date ? '#E53E3E' : '#E2E8F0' }}
                  />
                  {errors.end_date && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.end_date}</div>}
                </div>
              </div>

              {days > 0 && (
                <div style={{ backgroundColor: '#EBF8FF', border: '1px solid #BEE3F8', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#2C5282' }}>
                  📅 This request covers <strong>{days} working day{days !== 1 ? 's' : ''}</strong>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Reason</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a brief reason for your leave request..."
                  rows={3}
                  style={{ ...inputStyle, borderColor: errors.reason ? '#E53E3E' : '#E2E8F0', resize: 'vertical' }}
                />
                {errors.reason && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.reason}</div>}
              </div>

              {form.type === 'Sick Leave' && (
                <div style={{ backgroundColor: '#FFFFF0', border: '1px solid #D69E2E', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#744210' }}>
                  ⚠️ A doctor's certificate will be required for sick leave. Please ensure you obtain one.
                </div>
              )}

              <button
                onClick={handleSubmit}
                style={{ padding: '10px 24px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >Submit Leave Request</button>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No leave requests yet</div>
              ) : requests.map(req => (
                <div key={req.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '10px', backgroundColor: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748', marginBottom: '4px' }}>{req.type}</div>
                      <div style={{ fontSize: '13px', color: '#4A5568' }}>📅 {req.start} to {req.end} · {req.days} day{req.days !== 1 ? 's' : ''}</div>
                      <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Reason: {req.reason}</div>
                      <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Applied: {req.applied}</div>
                    </div>
                    <span style={{
                      fontSize: '12px', padding: '3px 12px', borderRadius: '10px',
                      backgroundColor: statusColors[req.status].bg,
                      color: statusColors[req.status].color,
                      fontWeight: '500', textTransform: 'capitalize',
                    }}>{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Balances Tab */}
          {activeTab === 'balances' && (
            <div>
              {balances.map((b, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{b.type}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: b.color }}>
                      {b.remaining} <span style={{ fontSize: '12px', color: '#718096', fontWeight: '400' }}>/ {b.entitled} days remaining</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#E2E8F0', borderRadius: '4px', height: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(b.taken / b.entitled) * 100}%`, backgroundColor: b.color }} />
                      <div style={{ width: `${(b.pending / b.entitled) * 100}%`, backgroundColor: '#D69E2E' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#718096' }}>
                    <span>Taken: <strong style={{ color: '#2D3748' }}>{b.taken}</strong></span>
                    {b.pending > 0 && <span>Pending: <strong style={{ color: '#D69E2E' }}>{b.pending}</strong></span>}
                    <span>Remaining: <strong style={{ color: b.color }}>{b.remaining}</strong></span>
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

export default EmployeeLeavePage;