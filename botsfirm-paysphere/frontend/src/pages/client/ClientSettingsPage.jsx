import React, { useState } from 'react';

const ClientSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [company, setCompany] = useState({
    company_name: 'Kgabo Construction (Pty) Ltd',
    registration_number: 'BW00001234567',
    burs_number: 'BURS-KGB-2024-001',
    hrdc_number: 'HRDC-KGB-2024-001',
    address: 'Plot 5421, Gaborone West Industrial',
    city: 'Gaborone',
    phone: '+267 71 234 567',
    email: 'admin@kgaboconstruction.co.bw',
  });
  const [profile, setProfile] = useState({
    full_name: 'Modisaotsile Kgabo',
    email: 'client@kgaboconstruction.co.bw',
    phone: '+267 71 000 000',
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [approvalPassword, setApprovalPassword] = useState({
    current_password: '',
    new_approval_password: '',
    confirm_approval_password: '',
  });
  const [saved, setSaved] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  const tabs = [
    { key: 'company', label: 'Company Details' },
    { key: 'profile', label: 'My Profile' },
    { key: 'password', label: 'Change Password' },
    { key: 'approval', label: 'Approval Password' },
    { key: 'subscription', label: 'Subscription' },
  ];

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#2D3748',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: '6px',
  };

  const fieldStyle = { marginBottom: '16px' };

  const SaveButton = ({ section, label }) => (
    <button
      onClick={() => handleSave(section)}
      style={{
        padding: '8px 24px',
        backgroundColor: saved === section ? '#38A169' : '#2B6CB0',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
      }}
    >{saved === section ? '✓ Saved' : label || 'Save Changes'}</button>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Settings</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>Manage your company and account settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>

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

          {/* Company Details */}
          {activeTab === 'company' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Company Details</h3>
              {[
                { label: 'Company Name', key: 'company_name' },
                { label: 'Registration Number', key: 'registration_number' },
                { label: 'BURS Number', key: 'burs_number' },
                { label: 'HRDC Number', key: 'hrdc_number' },
                { label: 'Address', key: 'address' },
                { label: 'City', key: 'city' },
                { label: 'Phone', key: 'phone' },
                { label: 'Email', key: 'email' },
              ].map(field => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    value={company[field.key]}
                    onChange={e => setCompany(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <SaveButton section="company" />
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>My Profile</h3>
              {[
                { label: 'Full Name', key: 'full_name' },
                { label: 'Email Address', key: 'email' },
                { label: 'Phone Number', key: 'phone' },
              ].map(field => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    value={profile[field.key]}
                    onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <SaveButton section="profile" />
            </div>
          )}

          {/* Change Password */}
          {activeTab === 'password' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Change Password</h3>
              {[
                { label: 'Current Password', key: 'current_password' },
                { label: 'New Password', key: 'new_password' },
                { label: 'Confirm New Password', key: 'confirm_password' },
              ].map(field => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="password"
                    value={passwords[field.key]}
                    onChange={e => setPasswords(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ backgroundColor: '#F7FAFC', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', fontSize: '12px', color: '#718096' }}>
                Password must be at least 8 characters and contain a number and a symbol.
              </div>
              <SaveButton section="password" label="Update Password" />
            </div>
          )}

          {/* Approval Password */}
          {activeTab === 'approval' && (
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Approval Password</h3>
              <p style={{ color: '#718096', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>
                This is the password required to approve leave requests. Keep it private — do not share it with your admins.
              </p>
              <div style={{ backgroundColor: '#EBF8FF', border: '1px solid #BEE3F8', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#2C5282' }}>
                🔐 Your approval password is separate from your login password for extra security.
              </div>
              {[
                { label: 'Current Login Password', key: 'current_password' },
                { label: 'New Approval Password', key: 'new_approval_password' },
                { label: 'Confirm Approval Password', key: 'confirm_approval_password' },
              ].map(field => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="password"
                    value={approvalPassword[field.key]}
                    onChange={e => setApprovalPassword(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </div>
              ))}
              <SaveButton section="approval" label="Update Approval Password" />
            </div>
          )}

          {/* Subscription */}
          {activeTab === 'subscription' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Subscription</h3>
              <div style={{ backgroundColor: '#F7FAFC', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                {[
                  { label: 'Current Plan', value: 'Growth' },
                  { label: 'Max Employees', value: '25' },
                  { label: 'Employees Used', value: '3 / 25' },
                  { label: 'Subscription Start', value: '24 March 2026' },
                  { label: 'Subscription End', value: '24 March 2027' },
                  { label: 'Status', value: 'Active' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid #E2E8F0' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#718096' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '600' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#FFFFF0', border: '1px solid #D69E2E', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#744210' }}>
                To upgrade your plan or renew your subscription, contact Botsfirm PaySphere.
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="https://wa.me/267XXXXXXXX" style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                  WhatsApp Us
                </a>
                <a href="mailto:info@botsfirmpaysphere.com" style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                  Email Us
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSettingsPage;