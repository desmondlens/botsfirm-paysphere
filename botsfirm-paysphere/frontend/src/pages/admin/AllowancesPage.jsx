import React, { useState } from 'react';

const AllowancesPage = () => {
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Housing Allowance', amount_type: 'fixed', default_amount: 2000, is_taxable: true, is_recurring: true, is_active: true, assigned_to: 3 },
    { id: '2', name: 'Transport Allowance', amount_type: 'fixed', default_amount: 500, is_taxable: false, is_recurring: true, is_active: true, assigned_to: 2 },
    { id: '3', name: 'Airtime Allowance', amount_type: 'fixed', default_amount: 1000, is_taxable: false, is_recurring: true, is_active: true, assigned_to: 1 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newAllowance, setNewAllowance] = useState({
    name: '',
    amount_type: 'fixed',
    default_amount: '',
    is_taxable: true,
    is_recurring: true,
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const e = {};
    if (!newAllowance.name.trim()) e.name = 'Required';
    if (!newAllowance.default_amount) e.default_amount = 'Required';
    if (parseFloat(newAllowance.default_amount) <= 0) e.default_amount = 'Must be greater than 0';
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setTemplates(prev => [...prev, {
      id: Date.now().toString(),
      name: newAllowance.name,
      amount_type: newAllowance.amount_type,
      default_amount: parseFloat(newAllowance.default_amount),
      is_taxable: newAllowance.is_taxable,
      is_recurring: newAllowance.is_recurring,
      is_active: true,
      assigned_to: 0,
    }]);
    setShowModal(false);
    setNewAllowance({ name: '', amount_type: 'fixed', default_amount: '', is_taxable: true, is_recurring: true });
    setErrors({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleActive = (id) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t));
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#4A5568', marginBottom: '6px' };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Allowances</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
            Create and manage allowance templates for your employees
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >+ New Allowance</button>
      </div>

      {saved && (
        <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '8px', padding: '12px 20px', marginBottom: '16px', fontSize: '13px', color: '#276749' }}>
          ✓ Allowance created successfully.
        </div>
      )}

      {/* Tax Notice */}
      <div style={{ backgroundColor: '#FFFFF0', border: '1px solid #D69E2E', borderRadius: '8px', padding: '12px 20px', marginBottom: '20px', fontSize: '13px', color: '#744210' }}>
        ⚠️ <strong>BURS Rule:</strong> Taxable allowances are added to basic salary before PAYE is calculated. Non-taxable allowances are added after PAYE. Ensure correct classification to remain compliant.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Templates', value: templates.length, color: '#2B6CB0' },
          { label: 'Active', value: templates.filter(t => t.is_active).length, color: '#38A169' },
          { label: 'Taxable', value: templates.filter(t => t.is_taxable).length, color: '#E53E3E' },
          { label: 'Non-Taxable', value: templates.filter(t => !t.is_taxable).length, color: '#38A169' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ color: stat.color, fontSize: '24px', fontWeight: '700' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Allowances List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {templates.map(template => (
          <div key={template.id} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: `1px solid ${template.is_active ? '#E2E8F0' : '#F7FAFC'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '16px 20px',
            opacity: template.is_active ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>{template.name}</div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: template.is_taxable ? '#FFF5F5' : '#F0FFF4',
                    color: template.is_taxable ? '#E53E3E' : '#38A169',
                    fontWeight: '500',
                  }}>{template.is_taxable ? 'Taxable' : 'Non-Taxable'}</span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: '#EBF8FF', color: '#2B6CB0', fontWeight: '500',
                  }}>{template.is_recurring ? 'Recurring' : 'Once-off'}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#718096' }}>
                  <span>Amount: <strong style={{ color: '#2D3748' }}>BWP {template.default_amount.toLocaleString()}</strong> ({template.amount_type})</span>
                  <span>Assigned to: <strong style={{ color: '#2D3748' }}>{template.assigned_to} employee{template.assigned_to !== 1 ? 's' : ''}</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '10px',
                  backgroundColor: template.is_active ? '#F0FFF4' : '#F7FAFC',
                  color: template.is_active ? '#38A169' : '#718096',
                  fontWeight: '500',
                }}>{template.is_active ? 'Active' : 'Inactive'}</span>
                <button
                  onClick={() => toggleActive(template.id)}
                  style={{
                    padding: '5px 12px',
                    backgroundColor: 'transparent',
                    color: template.is_active ? '#E53E3E' : '#38A169',
                    border: `1px solid ${template.is_active ? '#E53E3E' : '#38A169'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >{template.is_active ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Allowance Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '460px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>New Allowance Template</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Allowance Name</label>
              <input
                type="text"
                placeholder="e.g. Housing Allowance"
                value={newAllowance.name}
                onChange={e => setNewAllowance(prev => ({ ...prev, name: e.target.value }))}
                style={{ ...inputStyle, borderColor: errors.name ? '#E53E3E' : '#E2E8F0' }}
              />
              {errors.name && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.name}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Amount Type</label>
                <select
                  value={newAllowance.amount_type}
                  onChange={e => setNewAllowance(prev => ({ ...prev, amount_type: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">% of Basic Salary</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{newAllowance.amount_type === 'fixed' ? 'Amount (BWP)' : 'Percentage (%)'}</label>
                <input
                  type="number"
                  placeholder={newAllowance.amount_type === 'fixed' ? 'e.g. 2000' : 'e.g. 10'}
                  value={newAllowance.default_amount}
                  onChange={e => setNewAllowance(prev => ({ ...prev, default_amount: e.target.value }))}
                  style={{ ...inputStyle, borderColor: errors.default_amount ? '#E53E3E' : '#E2E8F0' }}
                />
                {errors.default_amount && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.default_amount}</div>}
              </div>
            </div>

            {/* Taxable Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Tax Treatment</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Taxable', value: true, desc: 'Added to gross before PAYE' },
                  { label: 'Non-Taxable', value: false, desc: 'Added after PAYE' },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setNewAllowance(prev => ({ ...prev, is_taxable: opt.value }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid',
                      borderColor: newAllowance.is_taxable === opt.value ? '#2B6CB0' : '#E2E8F0',
                      backgroundColor: newAllowance.is_taxable === opt.value ? '#EBF8FF' : '#FFFFFF',
                      color: newAllowance.is_taxable === opt.value ? '#2B6CB0' : '#718096',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring Toggle */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Frequency</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Recurring', value: true, desc: 'Every payroll run' },
                  { label: 'Once-off', value: false, desc: 'One time only' },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setNewAllowance(prev => ({ ...prev, is_recurring: opt.value }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid',
                      borderColor: newAllowance.is_recurring === opt.value ? '#2B6CB0' : '#E2E8F0',
                      backgroundColor: newAllowance.is_recurring === opt.value ? '#EBF8FF' : '#FFFFFF',
                      color: newAllowance.is_recurring === opt.value ? '#2B6CB0' : '#718096',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleAdd} style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Create Allowance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllowancesPage;