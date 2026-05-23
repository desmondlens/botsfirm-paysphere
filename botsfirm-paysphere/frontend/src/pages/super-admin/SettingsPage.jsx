import React, { useState } from 'react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    full_name: 'Platform Super Admin',
    email: 'superadmin@botsfirmpaysphere.com',
    phone: '+267 71 000 000',
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [platform, setPlatform] = useState({
    platform_name: 'Botsfirm PaySphere',
    support_email: 'info@botsfirmpaysphere.com',
    support_whatsapp: '+267XXXXXXXX',
    trial_duration_days: '7',
    trial_max_employees: '5',
    trial_max_payroll_runs: '1',
    data_retention_days: '30',
  });
  const [pricing, setPricing] = useState({
    starter_price: '500',
    growth_price: '1200',
    business_price: '2500',
    enterprise_price: 'Custom',
    currency: 'BWP',
  });
  const [saved, setSaved] = useState('');

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  const tabs = [
    { key: 'profile', label: 'My Profile' },
    { key: 'password', label: 'Change Password' },
    { key: 'platform', label: 'Platform Settings' },
    { key: 'pricing', label: 'Pricing' },
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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Settings</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          Manage your profile and platform configuration
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>

        {/* Tabs */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '8px',
          height: 'fit-content',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                textAlign: 'left',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === tab.key ? '#EBF8FF' : 'transparent',
                color: activeTab === tab.key ? '#2B6CB0' : '#4A5568',
                fontWeight: activeTab === tab.key ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '2px',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '24px',
        }}>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>My Profile</h3>
              {[
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'Email Address', key: 'email', type: 'email' },
                { label: 'Phone Number', key: 'phone', type: 'tel' },
              ].map(field => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type={field.type}
                    value={profile[field.key]}
                    onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <button
                onClick={() => handleSave('profile')}
                style={{
                  padding: '8px 24px',
                  backgroundColor: saved === 'profile' ? '#38A169' : '#2B6CB0',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >{saved === 'profile' ? '✓ Saved' : 'Save Changes'}</button>
            </div>
          )}

          {/* Password Tab */}
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
                    style={inputStyle}
                    placeholder="••••••••"
                  />
                </div>
              ))}
              <div style={{
                backgroundColor: '#F7FAFC',
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#718096',
              }}>
                Password must be at least 8 characters and contain a number and a symbol.
              </div>
              <button
                onClick={() => handleSave('password')}
                style={{
                  padding: '8px 24px',
                  backgroundColor: saved === 'password' ? '#38A169' : '#2B6CB0',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >{saved === 'password' ? '✓ Saved' : 'Update Password'}</button>
            </div>
          )}

          {/* Platform Tab */}
          {activeTab === 'platform' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Platform Settings</h3>
              {[
                { label: 'Platform Name', key: 'platform_name' },
                { label: 'Support Email', key: 'support_email' },
                { label: 'Support WhatsApp', key: 'support_whatsapp' },
                { label: 'Trial Duration (days)', key: 'trial_duration_days' },
                { label: 'Trial Max Employees', key: 'trial_max_employees' },
                { label: 'Trial Max Payroll Runs', key: 'trial_max_payroll_runs' },
                { label: 'Data Retention After Expiry (days)', key: 'data_retention_days' },
              ].map(field => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    value={platform[field.key]}
                    onChange={e => setPlatform(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <button
                onClick={() => handleSave('platform')}
                style={{
                  padding: '8px 24px',
                  backgroundColor: saved === 'platform' ? '#38A169' : '#2B6CB0',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >{saved === 'platform' ? '✓ Saved' : 'Save Settings'}</button>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Pricing Configuration</h3>
              <p style={{ color: '#718096', fontSize: '13px', marginTop: '0', marginBottom: '20px' }}>
                These prices appear on your landing page pricing section.
              </p>
              {[
                { label: 'Starter Plan Price (BWP/month)', key: 'starter_price' },
                { label: 'Growth Plan Price (BWP/month)', key: 'growth_price' },
                { label: 'Business Plan Price (BWP/month)', key: 'business_price' },
                { label: 'Enterprise Plan Price', key: 'enterprise_price' },
                { label: 'Currency', key: 'currency' },
              ].map(field => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type="text"
                    value={pricing[field.key]}
                    onChange={e => setPricing(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <button
                onClick={() => handleSave('pricing')}
                style={{
                  padding: '8px 24px',
                  backgroundColor: saved === 'pricing' ? '#38A169' : '#2B6CB0',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >{saved === 'pricing' ? '✓ Saved' : 'Save Pricing'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;