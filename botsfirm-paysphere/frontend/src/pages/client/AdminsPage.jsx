import React, { useState } from 'react';

const AdminsPage = () => {
  const [admins, setAdmins] = useState([
    {
      id: '1',
      full_name: 'Modisaotsile Kgabo',
      email: 'admin@kgaboconstruction.co.bw',
      phone: '+267 71 234 567',
      is_active: true,
      last_login: '2026-05-24 08:15:00',
      created_at: '2026-03-24',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const e = {};
    if (!newAdmin.full_name.trim()) e.full_name = 'Full name is required';
    if (!newAdmin.email.trim()) e.email = 'Email is required';
    if (!newAdmin.password) e.password = 'Password is required';
    if (newAdmin.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (newAdmin.password !== newAdmin.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const handleCreate = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const admin = {
      id: Date.now().toString(),
      full_name: newAdmin.full_name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      is_active: true,
      last_login: 'Never',
      created_at: new Date().toISOString().split('T')[0],
    };
    setAdmins(prev => [...prev, admin]);
    setShowModal(false);
    setNewAdmin({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
    setErrors({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleActive = (id) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Admins</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
            Manage HR administrators for your company
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 20px',
            backgroundColor: '#2B6CB0',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >+ Add Admin</button>
      </div>

      {saved && (
        <div style={{
          backgroundColor: '#F0FFF4',
          border: '1px solid #9AE6B4',
          borderRadius: '8px',
          padding: '12px 20px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#276749',
        }}>
          ✓ Admin created successfully. They will receive a welcome email with login instructions.
        </div>
      )}

      {/* Admins List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {admins.map(admin => (
          <div key={admin.id} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#EBF8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                color: '#2B6CB0',
              }}>
                {admin.full_name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>{admin.full_name}</div>
                <div style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>{admin.email}</div>
                {admin.phone && <div style={{ fontSize: '12px', color: '#718096' }}>{admin.phone}</div>}
                <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                  Last login: {admin.last_login} · Added: {admin.created_at}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '12px',
                padding: '3px 12px',
                borderRadius: '10px',
                backgroundColor: admin.is_active ? '#F0FFF4' : '#FFF5F5',
                color: admin.is_active ? '#38A169' : '#E53E3E',
                fontWeight: '500',
              }}>{admin.is_active ? 'Active' : 'Inactive'}</span>
              <button
                onClick={() => toggleActive(admin.id)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: 'transparent',
                  color: admin.is_active ? '#E53E3E' : '#38A169',
                  border: `1px solid ${admin.is_active ? '#E53E3E' : '#38A169'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >{admin.is_active ? 'Deactivate' : 'Activate'}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Admin Modal */}
      {showModal && (
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
            width: '480px',
            maxWidth: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Add New Admin</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            {[
              { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'e.g. Kagiso Sithole' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'admin@company.com' },
              { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+267 71 000 000' },
              { label: 'Temporary Password', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Confirm Password', key: 'confirm_password', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={newAdmin[field.key]}
                  onChange={e => { setNewAdmin(prev => ({ ...prev, [field.key]: e.target.value })); setErrors(prev => ({ ...prev, [field.key]: '' })); }}
                  style={{ ...inputStyle, borderColor: errors[field.key] ? '#E53E3E' : '#E2E8F0' }}
                />
                {errors[field.key] && <div style={{ fontSize: '12px', color: '#E53E3E', marginTop: '4px' }}>{errors[field.key]}</div>}
              </div>
            ))}

            <div style={{ backgroundColor: '#FFFFF0', border: '1px solid #D69E2E', borderRadius: '6px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#744210' }}>
              ⚠️ The admin will be prompted to change this password on first login.
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleCreate} style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Create Admin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage;