import React, { useState } from 'react';

const EmployeeProfilePage = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [saved, setSaved] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const employee = {
    full_name: 'Gorata Mosimanegape',
    employee_number: 'EMP001',
    id_number: '900101-1234',
    nationality: 'Citizen',
    job_title: 'Site Foreman',
    department: 'Operations',
    employment_type: 'Permanent',
    start_date: '2024-01-15',
    burs_tin: 'TIN-001-2024',
    bank_name: 'First National Bank',
    bank_account: '****5678',
    basic_salary: 8000,
    company: 'Kgabo Construction (Pty) Ltd',
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    if (!passwords.current_password) { setPasswordError('Current password is required'); return; }
    if (passwords.new_password.length < 8) { setPasswordError('New password must be at least 8 characters'); return; }
    if (!/\d/.test(passwords.new_password)) { setPasswordError('Password must contain a number'); return; }
    if (passwords.new_password !== passwords.confirm_password) { setPasswordError('Passwords do not match'); return; }
    setSaved('password');
    setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    setTimeout(() => setSaved(''), 3000);
  };

  const tabs = [
    { key: 'details', label: 'My Details' },
    { key: 'password', label: 'Change Password' },
  ];

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0',
    borderRadius: '6px', fontSize: '14px', color: '#2D3748',
    boxSizing: 'border-box', outline: 'none', backgroundColor: '#F7FAFC',
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' };

  const months = Math.floor((new Date() - new Date(employee.start_date)) / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>My Profile</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>Your employment details and account settings</p>
      </div>

      {/* Profile Header */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#2B6CB0',
          flexShrink: 0,
        }}>
          {employee.full_name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#2D3748' }}>{employee.full_name}</div>
          <div style={{ fontSize: '14px', color: '#718096', marginTop: '4px' }}>{employee.job_title} · {employee.department}</div>
          <div style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>{employee.company}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#718096' }}>Employee Number</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#2B6CB0' }}>{employee.employee_number}</div>
          <div style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>Service</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>
            {years > 0 ? `${years}y ` : ''}{remainingMonths}m
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px' }}>
        {/* Tabs */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '8px', height: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'block', width: '100%', padding: '10px 14px',
                textAlign: 'left', border: 'none', borderRadius: '6px',
                backgroundColor: activeTab === tab.key ? '#EBF8FF' : 'transparent',
                color: activeTab === tab.key ? '#2B6CB0' : '#4A5568',
                fontWeight: activeTab === tab.key ? '600' : '400',
                fontSize: '14px', cursor: 'pointer', marginBottom: '2px',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px' }}>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>My Details</h3>

              {[
                { section: 'Personal Information', fields: [
                  { label: 'Full Name', value: employee.full_name },
                  { label: 'ID Number', value: employee.id_number },
                  { label: 'Nationality Status', value: employee.nationality },
                  { label: 'BURS Tax Reference (TIN)', value: employee.burs_tin },
                ]},
                { section: 'Employment Details', fields: [
                  { label: 'Job Title', value: employee.job_title },
                  { label: 'Department', value: employee.department },
                  { label: 'Employment Type', value: employee.employment_type },
                  { label: 'Start Date', value: employee.start_date },
                  { label: 'Basic Salary', value: `BWP ${employee.basic_salary.toLocaleString()}/month` },
                ]},
                { section: 'Banking Details', fields: [
                  { label: 'Bank Name', value: employee.bank_name },
                  { label: 'Account Number', value: employee.bank_account },
                ]},
              ].map((section, si) => (
                <div key={si} style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{section.section}</div>
                  {section.fields.map((field, fi) => (
                    <div key={fi} style={{ marginBottom: '12px' }}>
                      <label style={labelStyle}>{field.label}</label>
                      <input type="text" value={field.value} readOnly style={inputStyle} />
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ backgroundColor: '#EBF8FF', border: '1px solid #BEE3F8', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: '#2C5282' }}>
                ℹ️ To update your details, please contact your HR administrator.
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Change Password</h3>

              {saved === 'password' && (
                <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#276749' }}>
                  ✓ Password changed successfully.
                </div>
              )}

              {[
                { label: 'Current Password', key: 'current_password' },
                { label: 'New Password', key: 'new_password' },
                { label: 'Confirm New Password', key: 'confirm_password' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ ...labelStyle, backgroundColor: 'transparent' }}>{field.label}</label>
                  <input
                    type="password"
                    value={passwords[field.key]}
                    onChange={e => { setPasswords(prev => ({ ...prev, [field.key]: e.target.value })); setPasswordError(''); }}
                    placeholder="••••••••"
                    style={{ ...inputStyle, backgroundColor: '#FFFFFF' }}
                  />
                </div>
              ))}

              {passwordError && (
                <div style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#C53030' }}>
                  {passwordError}
                </div>
              )}

              <div style={{ backgroundColor: '#F7FAFC', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '6px' }}>Password requirements:</div>
                {[
                  { label: 'At least 8 characters', met: passwords.new_password.length >= 8 },
                  { label: 'Contains a number', met: /\d/.test(passwords.new_password) },
                  { label: 'Passwords match', met: passwords.new_password === passwords.confirm_password && passwords.new_password.length > 0 },
                ].map((req, i) => (
                  <div key={i} style={{ fontSize: '12px', color: req.met ? '#38A169' : '#718096', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span>{req.met ? '✓' : '○'}</span>
                    {req.label}
                  </div>
                ))}
              </div>

              <button
                onClick={handlePasswordChange}
                style={{ padding: '8px 24px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >Update Password</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;