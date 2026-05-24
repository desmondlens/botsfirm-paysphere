import React, { useState } from 'react';

const DeductionsPage = () => {
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Loan Repayment', amount_type: 'fixed', default_amount: 500, reduces_taxable_income: false, is_recurring: true, is_active: true, assigned_to: 1, balance: 3000 },
    { id: '2', name: 'Medical Aid', amount_type: 'fixed', default_amount: 800, reduces_taxable_income: false, is_recurring: true, is_active: true, assigned_to: 0, balance: null },
    { id: '3', name: 'Union Fee', amount_type: 'fixed', default_amount: 50, reduces_taxable_income: false, is_recurring: true, is_active: true, assigned_to: 0, balance: null },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newDeduction, setNewDeduction] = useState({
    name: '',
    amount_type: 'fixed',
    default_amount: '',
    reduces_taxable_income: false,
    is_recurring: true,
    has_balance: false,
    balance: '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const e = {};
    if (!newDeduction.name.trim()) e.name = 'Required';
    if (!newDeduction.default_amount) e.default_amount = 'Required';
    if (parseFloat(newDeduction.default_amount) <= 0) e.default_amount = 'Must be greater than 0';
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setTemplates(prev => [...prev, {
      id: Date.now().toString(),
      name: newDeduction.name,
      amount_type: newDeduction.amount_type,
      default_amount: parseFloat(newDeduction.default_amount),
      reduces_taxable_income: newDeduction.reduces_taxable_income,
      is_recurring: newDeduction.is_recurring,
      is_active: true,
      assigned_to: 0,
      balance: newDeduction.has_balance ? parseFloat(newDeduction.balance) : null,
    }]);
    setShowModal(false);
    setNewDeduction({ name: '', amount_type: 'fixed', default_amount: '', reduces_taxable_income: false, is_recurring: true, has_balance: false, balance: '' });
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
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Deductions</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
            Create and manage deduction templates for your employees
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >+ New Deduction</button>
      </div>

      {saved && (
        <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '8px', padding: '12px 20px', marginBottom: '16px', fontSize: '13px', color: '#276749' }}>
          ✓ Deduction created successfully.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Templates', value: templates.length, color: '#2B6CB0' },
          { label: 'Active', value: templates.filter(t => t.is_active).length, color: '#38A169' },
          { label: 'With Balance', value: templates.filter(t => t.balance !== null).length, color: '#D69E2E' },
          { label: 'Assigned', value: templates.reduce((s, t) => s + t.assigned_to, 0), color: '#805AD5' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ color: stat.color, fontSize: '24px', fontWeight: '700' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Deductions List */}
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
                    backgroundColor: template.is_recurring ? '#EBF8FF' : '#F7FAFC',
                    color: template.is_recurring ? '#2B6CB0' : '#718096',
                    fontWeight: '500',
                  }}>{template.is_recurring ? 'Recurring' : 'Once-off'}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#718096', flexWrap: 'wrap' }}>
                  <span>Amount: <strong style={{ color: '#2D3748' }}>BWP {template.default_amount.toLocaleString()}</strong></span>
                  <span>Assigned to: <strong style={{ color: '#2D3748' }}>{template.assigned_to} employee{template.assigned_to !== 1 ? 's' : ''}</strong></span>
                  {template.balance !== null && (
                    <span>Outstanding balance: <strong style={{ color: '#D69E2E' }}>BWP {template.balance.toLocaleString()}</strong></span>
                  )}
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
                    padding: '5px 12px', backgroundColor: 'transparent',
                    color: template.is_active ? '#E53E3E' : '#38A169',
                    border: `1px solid ${template.is_active ? '#E53E3E' : '#38A169'}`,
                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                  }}
                >{template.is_active ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Deduction Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '460px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>New Deduction Template</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Deduction Name</label>
              <input
                type="text"
                placeholder="e.g. Loan Repayment"
                value={newDeduction.name}
                onChange={e => setNewDeduction(prev => ({ ...prev, name: e.target.value }))}
                style={{ ...inputStyle, borderColor: errors.name ? '#E53E3E' : '#E2E8F0' }}
              />
              {errors.name && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.name}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Amount Type</label>
                <select value={newDeduction.amount_type} onChange={e => setNewDeduction(prev => ({ ...prev, amount_type: e.target.value }))} style={inputStyle}>
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">% of Basic Salary</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{newDeduction.amount_type === 'fixed' ? 'Amount (BWP)' : 'Percentage (%)'}</label>
                <input
                  type="number"
                  placeholder={newDeduction.amount_type === 'fixed' ? 'e.g. 500' : 'e.g. 5'}
                  value={newDeduction.default_amount}
                  onChange={e => setNewDeduction(prev => ({ ...prev, default_amount: e.target.value }))}
                  style={{ ...inputStyle, borderColor: errors.default_amount ? '#E53E3E' : '#E2E8F0' }}
                />
                {errors.default_amount && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.default_amount}</div>}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Frequency</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Recurring', value: true, desc: 'Every payroll run' },
                  { label: 'Once-off', value: false, desc: 'One time only' },
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setNewDeduction(prev => ({ ...prev, is_recurring: opt.value }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid',
                      borderColor: newDeduction.is_recurring === opt.value ? '#2B6CB0' : '#E2E8F0',
                      backgroundColor: newDeduction.is_recurring === opt.value ? '#EBF8FF' : '#FFFFFF',
                      color: newDeduction.is_recurring === opt.value ? '#2B6CB0' : '#718096',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Balance */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newDeduction.has_balance}
                  onChange={e => setNewDeduction(prev => ({ ...prev, has_balance: e.target.checked }))}
                />
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#4A5568' }}>This is a loan with outstanding balance</span>
              </label>
            </div>

            {newDeduction.has_balance && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Outstanding Balance (BWP)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newDeduction.balance}
                  onChange={e => setNewDeduction(prev => ({ ...prev, balance: e.target.value }))}
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>System will track remaining balance and stop deducting when paid off.</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleAdd} style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Create Deduction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeductionsPage;