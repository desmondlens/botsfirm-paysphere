import { useState } from 'react';
import theme from '../../../styles/theme';

function calculateAnnualPAYE(annualTaxable, status) {
  if (status === 'Citizen') {
    if (annualTaxable <= 48000) return 0;
    if (annualTaxable <= 84000) return (annualTaxable - 48000) * 0.05;
    if (annualTaxable <= 120000) return 1800 + (annualTaxable - 84000) * 0.125;
    if (annualTaxable <= 156000) return 6300 + (annualTaxable - 120000) * 0.1875;
    return 13050 + (annualTaxable - 156000) * 0.25;
  } else {
    if (annualTaxable <= 84000) return annualTaxable * 0.05;
    if (annualTaxable <= 120000) return 4200 + (annualTaxable - 84000) * 0.125;
    if (annualTaxable <= 156000) return 8700 + (annualTaxable - 120000) * 0.1875;
    return 15450 + (annualTaxable - 156000) * 0.25;
  }
}

function fmt(num) {
  return 'BWP ' + Number(num).toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const emptyAllowance = () => ({ name: '', amount: '', taxable: true });

export default function DemoCalculator() {
  const [basic, setBasic] = useState('');
  const [status, setStatus] = useState('Citizen');
  const [allowances, setAllowances] = useState([]);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  function addAllowance() {
    if (allowances.length < 2) setAllowances(a => [...a, emptyAllowance()]);
  }

  function updateAllowance(i, field, value) {
    setAllowances(a => a.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function removeAllowance(i) {
    setAllowances(a => a.filter((_, idx) => idx !== i));
  }

  function validate() {
    const errs = {};
    const b = parseFloat(basic);
    if (!basic || isNaN(b) || b <= 0) errs.basic = 'Please enter a valid basic salary.';
    allowances.forEach((al, i) => {
      if (!al.name.trim()) errs[`alName${i}`] = 'Name required.';
      const amt = parseFloat(al.amount);
      if (!al.amount || isNaN(amt) || amt < 0) errs[`alAmt${i}`] = 'Valid amount required.';
    });
    return errs;
  }

  function calculate() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const monthlyBasic = parseFloat(basic);
    const monthlyTaxableAllowances = allowances.filter(a => a.taxable).reduce((s, a) => s + parseFloat(a.amount || 0), 0);
    const monthlyNonTaxableAllowances = allowances.filter(a => !a.taxable).reduce((s, a) => s + parseFloat(a.amount || 0), 0);
    const monthlyGrossTaxable = monthlyBasic + monthlyTaxableAllowances;
    const annualGrossTaxable = monthlyGrossTaxable * 12;
    const annualPAYE = calculateAnnualPAYE(annualGrossTaxable, status);
    const monthlyPAYE = annualPAYE / 12;
    const grossTotal = monthlyGrossTaxable + monthlyNonTaxableAllowances;
    const netPay = grossTotal - monthlyPAYE;
    const effectiveTaxRate = grossTotal > 0 ? (monthlyPAYE / grossTotal) * 100 : 0;

    setResult({
      monthlyBasic,
      monthlyTaxableAllowances,
      monthlyNonTaxableAllowances,
      monthlyGrossTaxable,
      monthlyPAYE,
      netPay,
      effectiveTaxRate,
    });
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontFamily: theme.fonts.body,
    fontSize: '0.9375rem',
    color: theme.colors.text,
    backgroundColor: theme.colors.secondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.input,
    outline: 'none',
    lineHeight: 1.5,
    marginTop: '0.375rem',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 500,
    fontSize: '0.875rem',
    color: theme.colors.text,
    marginBottom: '0.25rem',
  };

  const errorStyle = {
    color: theme.colors.error,
    fontSize: '0.8125rem',
    marginTop: '0.25rem',
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.625rem 0',
    borderBottom: `1px solid ${theme.colors.border}`,
    fontSize: '0.9375rem',
  };

  return (
    <section id="demo" style={{ backgroundColor: theme.colors.background, padding: '5rem 0' }}>
      <div className="container">
        <h2 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>Try the PAYE Calculator</h2>
        <p className="section-subtitle text-center">
          See exactly how much PAYE your employees pay — based on Botswana's current tax brackets.
        </p>

        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Basic Salary (BWP)</label>
              <input
                style={{ ...inputStyle, border: `1px solid ${errors.basic ? theme.colors.error : theme.colors.border}` }}
                type="number"
                placeholder="e.g. 8000"
                value={basic}
                min="0"
                onChange={e => setBasic(e.target.value)}
              />
              {errors.basic && <p style={errorStyle}>{errors.basic}</p>}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Nationality Status</label>
              <select
                style={inputStyle}
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Citizen">Citizen (Resident)</option>
                <option value="Non-Citizen">Non-Citizen (Non-Resident)</option>
              </select>
            </div>

            {allowances.map((al, i) => (
              <div key={i} style={{ backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.card, padding: '1rem', marginBottom: '1rem', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: theme.colors.text }}>Allowance {i + 1}</span>
                  <button onClick={() => removeAllowance(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.error, fontSize: '0.875rem', fontWeight: 500 }}>
                    Remove
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Allowance Name</label>
                    <input
                      style={{ ...inputStyle, border: `1px solid ${errors[`alName${i}`] ? theme.colors.error : theme.colors.border}` }}
                      type="text"
                      placeholder="e.g. Housing"
                      value={al.name}
                      onChange={e => updateAllowance(i, 'name', e.target.value)}
                    />
                    {errors[`alName${i}`] && <p style={errorStyle}>{errors[`alName${i}`]}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Amount (BWP)</label>
                    <input
                      style={{ ...inputStyle, border: `1px solid ${errors[`alAmt${i}`] ? theme.colors.error : theme.colors.border}` }}
                      type="number"
                      placeholder="e.g. 1000"
                      value={al.amount}
                      min="0"
                      onChange={e => updateAllowance(i, 'amount', e.target.value)}
                    />
                    {errors[`alAmt${i}`] && <p style={errorStyle}>{errors[`alAmt${i}`]}</p>}
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id={`taxable-${i}`}
                    checked={al.taxable}
                    onChange={e => updateAllowance(i, 'taxable', e.target.checked)}
                    style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: theme.colors.primary }}
                  />
                  <label htmlFor={`taxable-${i}`} style={{ fontSize: '0.875rem', color: theme.colors.text, cursor: 'pointer' }}>
                    Taxable allowance
                  </label>
                </div>
              </div>
            ))}

            <div style={{ marginBottom: '1.5rem' }}>
              {allowances.length < 2 ? (
                <button
                  onClick={addAllowance}
                  style={{
                    background: 'none', border: `1px dashed ${theme.colors.primary}`,
                    color: theme.colors.primary, borderRadius: theme.borderRadius.button,
                    padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                    width: '100%', fontFamily: theme.fonts.body,
                  }}
                >
                  + Add Allowance
                </button>
              ) : (
                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: theme.colors.muted, padding: '0.5rem' }}>
                  Upgrade for unlimited allowances
                </p>
              )}
            </div>

            <button className="btn btn-primary" onClick={calculate} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
              Calculate PAYE
            </button>
          </div>

          {result && (
            <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.colors.text, marginBottom: '1rem' }}>
                Monthly Payroll Summary
              </h3>
              <div>
                {[
                  ['Basic Salary', fmt(result.monthlyBasic)],
                  ['Taxable Allowances', fmt(result.monthlyTaxableAllowances)],
                  ['Non-Taxable Allowances', fmt(result.monthlyNonTaxableAllowances)],
                  ['Gross Taxable Income (monthly)', fmt(result.monthlyGrossTaxable)],
                ].map(([label, value]) => (
                  <div key={label} style={rowStyle}>
                    <span style={{ color: theme.colors.muted }}>{label}</span>
                    <span style={{ fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <div style={{ ...rowStyle, color: theme.colors.error }}>
                  <span>PAYE Deduction (monthly)</span>
                  <span style={{ fontWeight: 600 }}>- {fmt(result.monthlyPAYE)}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: 'none', paddingTop: '0.875rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Net Pay</span>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem', color: theme.colors.success }}>{fmt(result.netPay)}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <span style={{ color: theme.colors.muted, fontSize: '0.875rem' }}>Effective Tax Rate</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{result.effectiveTaxRate.toFixed(2)}%</span>
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                backgroundColor: '#FEF5E7',
                border: `1px solid ${theme.colors.warning}`,
                borderRadius: theme.borderRadius.card,
                padding: '1.25rem',
              }}>
                <p style={{ fontSize: '0.9375rem', color: theme.colors.text, marginBottom: '1rem', lineHeight: 1.6 }}>
                  Want PDF payslips, leave management, QuickBooks export and full BURS reports? Contact us for your invite code.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://wa.me/267XXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                    style={{ fontSize: '0.875rem' }}
                  >
                    WhatsApp Us
                  </a>
                  <a
                    href="mailto:info@botsfirmpaysphere.com"
                    className="btn btn-outline"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
