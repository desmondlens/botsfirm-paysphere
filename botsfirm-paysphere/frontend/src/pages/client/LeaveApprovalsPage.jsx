import React, { useState } from 'react';

const LeaveApprovalsPage = () => {
  const [leaves, setLeaves] = useState([
    {
      id: '1',
      employee: 'Gorata Mosimanegape',
      employee_number: 'EMP001',
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
      employee_number: 'EMP002',
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
      employee_number: 'EMP001',
      type: 'Annual Leave',
      start_date: '2026-04-01',
      end_date: '2026-04-03',
      days: 3,
      reason: 'Personal',
      applied_at: '2026-03-25',
      status: 'approved',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [approvalPassword, setApprovalPassword] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const filtered = leaves.filter(l =>
    filterStatus === 'all' || l.status === filterStatus
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

  const openModal = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setApprovalPassword('');
    setRejectionReason('');
    setPasswordError('');
    setShowModal(true);
  };

  const handleAction = () => {
    // In production this checks against the real client password
    // For now we validate against Test@1234
    if (modalAction === 'approve') {
      if (approvalPassword !== 'Test@1234') {
        setPasswordError('Incorrect password. Only the account owner can approve leave.');
        return;
      }
      setLeaves(prev => prev.map(l =>
        l.id === selectedLeave.id ? { ...l, status: 'approved' } : l
      ));
    } else {
      if (!rejectionReason.trim()) {
        setPasswordError('Please provide a reason for rejection.');
        return;
      }
      setLeaves(prev => prev.map(l =>
        l.id === selectedLeave.id ? { ...l, status: 'rejected' } : l
      ));
    }
    setShowModal(false);
    setSelectedLeave(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Leave Approvals</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          Only you can approve or reject leave requests
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: '#D69E2E' },
          { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: '#38A169' },
          { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: '#E53E3E' },
          { label: 'Total', value: leaves.length, color: '#2B6CB0' },
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

      {/* Security Notice */}
      <div style={{
        backgroundColor: '#EBF8FF',
        border: '1px solid #BEE3F8',
        borderRadius: '8px',
        padding: '12px 20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '18px' }}>🔐</span>
        <div style={{ fontSize: '13px', color: '#2C5282' }}>
          <strong>Security:</strong> Approving leave requires your account password. This ensures only you can authorise leave for your employees.
        </div>
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
        {['pending', 'approved', 'rejected', 'all'].map(s => (
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

      {/* Leave Requests */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            padding: '40px',
            textAlign: 'center',
            color: '#718096',
            fontSize: '14px',
          }}>
            No {filterStatus === 'all' ? '' : filterStatus} leave requests
          </div>
        ) : filtered.map(leave => (
          <div key={leave.id} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>{leave.employee}</div>
                  <span style={{ fontSize: '11px', color: '#718096' }}>{leave.employee_number}</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: typeColors[leave.type]?.bg || '#F7FAFC',
                    color: typeColors[leave.type]?.color || '#718096',
                    fontWeight: '500',
                  }}>{leave.type}</span>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#4A5568' }}>
                  <span>📅 {leave.start_date} to {leave.end_date}</span>
                  <span>⏱ {leave.days} day{leave.days > 1 ? 's' : ''}</span>
                  <span>📝 Applied: {leave.applied_at}</span>
                </div>
                {leave.reason && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#718096' }}>
                    Reason: {leave.reason}
                  </div>
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
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => openModal(leave, 'approve')}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#38A169',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >Approve</button>
                    <button
                      onClick={() => openModal(leave, 'reject')}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#FFFFFF',
                        color: '#E53E3E',
                        border: '1px solid #E53E3E',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >Reject</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      {showModal && selectedLeave && (
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
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>
                {modalAction === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            {/* Leave Summary */}
            <div style={{ backgroundColor: '#F7FAFC', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{selectedLeave.employee}</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                {selectedLeave.type} — {selectedLeave.days} days ({selectedLeave.start_date} to {selectedLeave.end_date})
              </div>
            </div>

            {modalAction === 'approve' ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>
                    Enter your password to confirm approval
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={approvalPassword}
                      onChange={e => { setApprovalPassword(e.target.value); setPasswordError(''); }}
                      placeholder="Your account password"
                      style={{
                        width: '100%',
                        padding: '8px 40px 8px 12px',
                        border: `1px solid ${passwordError ? '#E53E3E' : '#E2E8F0'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}
                    >{showPassword ? '🙈' : '👁'}</button>
                  </div>
                  {passwordError && <div style={{ fontSize: '12px', color: '#E53E3E', marginTop: '4px' }}>{passwordError}</div>}
                </div>
                <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '6px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#276749' }}>
                  This action will approve the leave and notify the employee.
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>
                    Reason for rejection
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => { setRejectionReason(e.target.value); setPasswordError(''); }}
                    placeholder="Explain why this leave request is being rejected..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${passwordError ? '#E53E3E' : '#E2E8F0'}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  {passwordError && <div style={{ fontSize: '12px', color: '#E53E3E', marginTop: '4px' }}>{passwordError}</div>}
                </div>
                <div style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '6px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#C53030' }}>
                  This action will reject the leave and notify the employee.
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}
              >Cancel</button>
              <button
                onClick={handleAction}
                style={{
                  padding: '8px 20px',
                  backgroundColor: modalAction === 'approve' ? '#38A169' : '#E53E3E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >{modalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalsPage;