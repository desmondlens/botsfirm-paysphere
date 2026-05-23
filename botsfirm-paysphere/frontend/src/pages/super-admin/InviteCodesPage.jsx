import React, { useState } from 'react';

const InviteCodesPage = () => {
  const [codes, setCodes] = useState([
    {
      id: '1',
      code: 'KGABO-2026-X7K9',
      plan: 'growth',
      max_employees: 25,
      status: 'used',
      generated_at: '2026-03-20',
      expires_at: '2026-03-27',
      redeemed_at: '2026-03-24',
    },
    {
      id: '2',
      code: 'PETRA-2026-M3N8',
      plan: 'business',
      max_employees: 50,
      status: 'used',
      generated_at: '2026-02-18',
      expires_at: '2026-02-25',
      redeemed_at: '2026-02-22',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState({
    plan: 'starter',
    max_employees: '10',
    expiry_days: '7',
    client_name: '',
    client_email: '',
  });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const planOptions = [
    { value: 'starter', label: 'Starter (1-10 employees)' },
    { value: 'growth', label: 'Growth (11-50 employees)' },
    { value: 'business', label: 'Business (51-100 employees)' },
    { value: 'enterprise', label: 'Enterprise (100+ employees)' },
  ];

  const generateCode = () => {
    const prefix = newCode.client_name
      ? newCode.client_name.slice(0, 5).toUpperCase().replace(/\s/g, '')
      : 'CLIENT';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${prefix}-${year}-${random}`;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(newCode.expiry_days));

    const newEntry = {
      id: Date.now().toString(),
      code,
      plan: newCode.plan,
      max_employees: parseInt(newCode.max_employees),
      status: 'active',
      generated_at: new Date().toISOString().split('T')[0],
      expires_at: expiryDate.toISOString().split('T')[0],
      redeemed_at: null,
      client_name: newCode.client_name,
      client_email: newCode.client_email,
    };

    setCodes(prev => [newEntry, ...prev]);
    setGeneratedCode(newEntry);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeCode = (id) => {
    setCodes(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'revoked' } : c
    ));
  };

  const statusColors = {
    active: { bg: '#F0FFF4', color: '#38A169' },
    used: { bg: '#EBF8FF', color: '#2B6CB0' },
    expired: { bg: '#FFF5F5', color: '#E53E3E' },
    revoked: { bg: '#F7FAFC', color: '#718096' },
  };

  const planColors = {
    starter: { bg: '#F0FFF4', color: '#38A169' },
    growth: { bg: '#EBF8FF', color: '#2B6CB0' },
    business: { bg: '#FAF5FF', color: '#805AD5' },
    enterprise: { bg: '#FFFAF0', color: '#DD6B20' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Invite Codes</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
            Generate and manage client invite codes
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setGeneratedCode(null); }}
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
        >
          + Generate Code
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Generated', value: codes.length, color: '#2B6CB0' },
          { label: 'Active', value: codes.filter(c => c.status === 'active').length, color: '#38A169' },
          { label: 'Used', value: codes.filter(c => c.status === 'used').length, color: '#2B6CB0' },
          { label: 'Expired/Revoked', value: codes.filter(c => c.status === 'expired' || c.status === 'revoked').length, color: '#E53E3E' },
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

      {/* Codes Table */}
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
              {['Code', 'Plan', 'Max Employees', 'Generated', 'Expires', 'Redeemed', 'Status', 'Actions'].map(h => (
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
            {codes.map((code, i) => (
              <tr key={code.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ fontSize: '13px', fontWeight: '600', color: '#2D3748', backgroundColor: '#F7FAFC', padding: '2px 8px', borderRadius: '4px' }}>
                      {code.code}
                    </code>
                    <button
                      onClick={() => copyCode(code.code)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096', fontSize: '12px' }}
                    >📋</button>
                  </div>
                  {code.client_name && <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>{code.client_name}</div>}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: '12px', padding: '2px 10px', borderRadius: '10px',
                    backgroundColor: planColors[code.plan]?.bg,
                    color: planColors[code.plan]?.color,
                    fontWeight: '500', textTransform: 'capitalize',
                  }}>{code.plan}</span>
                </td>
                <td style={{ padding: '12px 20px', fontSize: '14px', color: '#4A5568' }}>{code.max_employees}</td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4A5568' }}>{code.generated_at}</td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4A5568' }}>{code.expires_at}</td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4A5568' }}>{code.redeemed_at || '—'}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: '12px', padding: '2px 10px', borderRadius: '10px',
                    backgroundColor: statusColors[code.status]?.bg,
                    color: statusColors[code.status]?.color,
                    fontWeight: '500', textTransform: 'capitalize',
                  }}>{code.status}</span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  {code.status === 'active' && (
                    <button
                      onClick={() => revokeCode(code.id)}
                      style={{
                        fontSize: '12px', color: '#E53E3E',
                        background: 'none', border: '1px solid #E53E3E',
                        borderRadius: '4px', padding: '3px 10px',
                        cursor: 'pointer', fontWeight: '500',
                      }}
                    >Revoke</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Code Modal */}
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
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>
                {generatedCode ? 'Code Generated!' : 'Generate Invite Code'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            {!generatedCode ? (
              <>
                {[
                  { label: 'Client Name', key: 'client_name', type: 'text', placeholder: 'e.g. Kgabo Construction' },
                  { label: 'Client Email', key: 'client_email', type: 'email', placeholder: 'client@company.com' },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={newCode[field.key]}
                      onChange={e => setNewCode(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>Plan</label>
                  <select
                    value={newCode.plan}
                    onChange={e => setNewCode(prev => ({ ...prev, plan: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF' }}
                  >
                    {planOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>Max Employees</label>
                  <input
                    type="number"
                    value={newCode.max_employees}
                    onChange={e => setNewCode(prev => ({ ...prev, max_employees: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' }}>Code Valid For (days)</label>
                  <input
                    type="number"
                    value={newCode.expiry_days}
                    onChange={e => setNewCode(prev => ({ ...prev, expiry_days: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                  <button onClick={generateCode} style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Generate</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #38A169', borderRadius: '8px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#38A169', marginBottom: '8px', fontWeight: '500' }}>INVITE CODE GENERATED</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#2D3748', letterSpacing: '2px' }}>{generatedCode.code}</div>
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>Expires: {generatedCode.expires_at}</div>
                </div>
                <button
                  onClick={() => copyCode(generatedCode.code)}
                  style={{
                    width: '100%', padding: '10px', backgroundColor: copied ? '#38A169' : '#2B6CB0',
                    color: '#FFFFFF', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '8px',
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}
                >Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteCodesPage;