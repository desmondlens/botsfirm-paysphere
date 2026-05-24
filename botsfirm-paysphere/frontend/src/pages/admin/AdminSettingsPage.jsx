import React, { useState } from 'react';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    full_name: 'Modisaotsile Kgabo',
    email: 'admin@kgaboconstruction.co.bw',
    phone: '+267 71 234 567',
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [notifications, setNotifications] = useState({
    payroll_reminders: true,
    burs_deadlines: true,
    leave_requests: true,
    work_permit_alerts: true,
    email_notifications: true,
  });
  const [saved, setSaved] = useState('');

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  const tabs = [
    { key: 'profile', label: 'My Profile' },
    { key: 'password', label: 'Change Password' },
    { key: 'notifications', label: 'Notifications' },
  ];

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0',
    borderRadius: '6px', fontSize: '14px', color: '#2D3748',
    boxSizing: 'border-box', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '500',
    color: '#4A5568', marginBottom: '6px',
  };

  const SaveButton = ({ section, label }) => (
    <button
      onClick={() => handleSave(section)}
      style={{
        padding: '8px 24px',
        backgroundColor: saved === section ? '#38A169' : '#2B6CB0',
        color: '#FFFFFF', border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontSize: '14px', fontWeight: '500',
      }}
    >{saved === section ? '✓ Saved' : label || 'Save Changes'}</button>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Settings</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>Manage your account settings</p>
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

          {/* Profile */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>My Profile</h3>
              {[
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'Email Address', key: 'email', type: 'email' },
                { label: 'Phone Number', key: 'phone', type: 'tel' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type={field.type}
                    value={profile[field.key]}
                    onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <SaveButton section="profile" />
            </div>
          )}

          {/* Password */}
          {activeTab === 'password' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Change Password</h3>
              {[
                { label: 'Current Password', key: 'current_password' },
                { label: 'New Password', key: 'new_password' },
                { label: 'Confirm New Password', key: 'confirm_password' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
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

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Notification Preferences</h3>
              {[
                { key: 'payroll_reminders', label: 'Payroll Reminders', desc: 'Get reminded when payroll is due to be run' },
                { key: 'burs_deadlines', label: 'BURS Deadlines', desc: 'Alerts before ITW-7 and ITW-10 due dates' },
                { key: 'leave_requests', label: 'Leave Requests', desc: 'Notify when employees apply for leave' },
                { key: 'work_permit_alerts', label: 'Work Permit Alerts', desc: 'Alerts 60 and 30 days before permit expiry' },
                { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive all notifications via email' },
              ].map((item, i) => (
                <div key={item.key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: i < 4 ? '1px solid #F7FAFC' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                      backgroundColor: notifications[item.key] ? '#2B6CB0' : '#CBD5E0',
                      cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#FFFFFF',
                      position: 'absolute', top: '3px',
                      left: notifications[item.key] ? '23px' : '3px',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              ))}
              <div style={{ marginTop: '20px' }}>
                <SaveButton section="notifications" label="Save Preferences" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;