import React, { useState } from 'react';

// BURS Tax Calculation Engine
// Centralized tax table — update here when BURS changes rates
const TAX_TABLES = {
  "2026": {
    citizen: [
      { min: 0, max: 48000, base: 0, rate: 0 },
      { min: 48000, max: 84000, base: 0, rate: 0.05 },
      { min: 84000, max: 120000, base: 1800, rate: 0.125 },
      { min: 120000, max: 156000, base: 6300, rate: 0.1875 },
      { min: 156000, max: Infinity, base: 13050, rate: 0.25 },
    ],
    non_resident: [
      { min: 0, max: 84000, base: 0, rate: 0.05 },
      { min: 84000, max: 120000, base: 4200, rate: 0.125 },
      { min: 120000, max: 156000, base: 8700, rate: 0.1875 },
      { min: 156000, max: Infinity, base: 15450, rate: 0.25 },
    ],
  },
};

const TAX_YEAR = "2026";

const calculatePAYE = (monthlySalary, nationalityStatus) => {
  const annual = monthlySalary * 12;
  const tableKey = (nationalityStatus === 'citizen' || nationalityStatus === 'resident_non_citizen')
    ? 'citizen'
    : 'non_resident';
  const brackets = TAX_TABLES[TAX_YEAR][tableKey];
  let annualTax = 0;
  for (const bracket of brackets) {
    if (annual > bracket.min) {
      const taxable = Math.min(annual, bracket.max) - bracket.min;
      annualTax = bracket.base + (taxable * bracket.rate);
      if (annual <= bracket.max) break;
    }
  }
  return Number((annualTax / 12).toFixed(2));
};

const PayrollPage = () => {
  const [payPeriod] = useState('May 2026');
  const [status, setStatus] = useState('draft');
  const [showRunModal, setShowRunModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const employees = [
    {
      id: '1',
      name: 'Gorata Mosimanegape',
      number: 'EMP001',
      nationality: 'citizen',
      basic: 8000,
      allowances: [
        { name: 'Housing Allowance', amount: 2000, taxable: true },
        { name: 'Transport Allowance', amount: 500, taxable: false },
      ],
      deductions: [],
    },
    {
      id: '2',
      name: 'Tshepiso Kgari',
      number: 'EMP002',
      nationality: 'non_resident',
      basic: 12000,
      allowances: [
        { name: 'Housing Allowance', amount: 3000, taxable: true },
      ],
      deductions: [
        { name: 'Loan Repayment', amount: 500 },
      ],
    },
    {
      id: '3',
      name: 'Boitumelo Selwe',
      number: 'EMP003',
      nationality: 'citizen',
      basic: 15000,
      allowances: [
        { name: 'Housing Allowance', amount: 2500, taxable: true },
        { name: 'Airtime Allowance', amount: 1000, taxable: false },
      ],
      deductions: [],
    },
  ];

  const calculatePayslip = (emp) => {
    const taxableAllowances = emp.allowances.filter(a => a.taxable).reduce((s, a) => s + a.amount, 0);
    const nonTaxableAllowances = emp.allowances.filter(a => !a.taxable).reduce((s, a) => s + a.amount, 0);
    const grossTaxable = emp.basic + taxableAllowances;
    const paye = calculatePAYE(grossTaxable, emp.nationality);
    const totalDeductions = emp.deductions.reduce((s, d) => s + d.amount, 0);
    const grossPay = emp.basic + taxableAllowances + nonTaxableAllowances;
    const netPay = emp.basic + taxableAllowances + nonTaxableAllowances - paye - totalDeductions;
    return { taxableAllowances, nonTaxableAllowances, grossTaxable, grossPay, paye, totalDeductions, netPay };
  };

  const payslips = employees.map(emp => ({ ...emp, ...calculatePayslip(emp) }));
  const totalGross = payslips.reduce((s, p) => s + p.grossPay, 0);
  const totalPAYE = payslips.reduce((s, p) => s + p.paye, 0);
  const totalDeductions = payslips.reduce((s, p) => s + p.totalDeductions, 0);
  const totalNet = payslips.reduce((s, p) => s + p.netPay, 0);

  const fmt = (n) => `BWP ${n.toLocaleString()}`;

  const statusSteps = ['draft', 'processing', 'approved', 'paid'];
  const statusIndex = statusSteps.indexOf(status);

  const statusColors = {
    draft: { bg: '#F7FAFC', color: '#718096' },
    processing: { bg: '#FFFFF0', color: '#D69E2E' },
    approved: { bg: '#EBF8FF', color: '#2B6CB0' },
    paid: { bg: '#F0FFF4', color: '#38A169' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Payroll</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>Pay period: {payPeriod}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {status === 'draft' && (
            <button
              onClick={() => setShowRunModal(true)}
              style={{ padding: '8px 20px', backgroundColor: '#805AD5', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >▶ Run Payroll</button>
          )}
          {status === 'processing' && (
            <button
              onClick={() => setShowApproveModal(true)}
              style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >✓ Submit for Approval</button>
          )}
          {status === 'approved' && (
            <button
              onClick={() => setStatus('paid')}
              style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >Mark as Paid</button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {statusSteps.map((step, i) => (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: i <= statusIndex ? '#2B6CB0' : '#E2E8F0',
                  color: i <= statusIndex ? '#FFFFFF' : '#718096',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700',
                }}>{i < statusIndex ? '✓' : i + 1}</div>
                <div style={{ fontSize: '12px', color: i <= statusIndex ? '#2B6CB0' : '#718096', fontWeight: i === statusIndex ? '600' : '400', textTransform: 'capitalize' }}>{step}</div>
              </div>
              {i < statusSteps.length - 1 && (
                <div style={{ flex: 1, height: '2px', backgroundColor: i < statusIndex ? '#2B6CB0' : '#E2E8F0', margin: '0 8px', marginBottom: '20px' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Employees', value: employees.length, color: '#2B6CB0' },
          { label: 'Total Gross', value: fmt(totalGross), color: '#2B6CB0' },
          { label: 'Total PAYE', value: fmt(totalPAYE), color: '#E53E3E' },
          { label: 'Total Net Pay', value: fmt(totalNet), color: '#38A169' },
        ].map((card, i) => (
          <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ color: card.color, fontSize: '20px', fontWeight: '700' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Payslip Breakdown — {payPeriod}</h3>
          <span style={{
            fontSize: '12px', padding: '3px 12px', borderRadius: '10px',
            backgroundColor: statusColors[status].bg,
            color: statusColors[status].color,
            fontWeight: '500', textTransform: 'capitalize',
          }}>{status}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              {['Employee', 'Basic', 'Tax Allow.', 'Non-Tax Allow.', 'Gross', 'PAYE', 'Deductions', 'Net Pay'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payslips.map((p, i) => (
              <tr key={p.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>{p.number} · {p.nationality === 'citizen' ? 'Citizen' : 'Non-Resident'}</div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{fmt(p.basic)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{fmt(p.taxableAllowances)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{fmt(p.nonTaxableAllowances)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{fmt(p.grossPay)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#E53E3E', fontWeight: '500' }}>{fmt(p.paye)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#D69E2E' }}>{fmt(p.totalDeductions)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#38A169', fontWeight: '700' }}>{fmt(p.netPay)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #E2E8F0', backgroundColor: '#F7FAFC' }}>
              <td colSpan={4} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#2D3748' }}>TOTALS</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#2B6CB0' }}>{fmt(totalGross)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#E53E3E' }}>{fmt(totalPAYE)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#D69E2E' }}>{fmt(totalDeductions)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#38A169' }}>{fmt(totalNet)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Individual Payslips */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Individual Payslips</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {payslips.map((p, i) => (
            <div key={p.id} style={{ marginBottom: i < payslips.length - 1 ? '16px' : 0, padding: '16px', backgroundColor: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>{p.number} · {payPeriod}</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#38A169' }}>{fmt(p.netPay)}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Basic', value: fmt(p.basic) },
                  { label: 'PAYE', value: fmt(p.paye), red: true },
                  { label: 'Deductions', value: fmt(p.totalDeductions), amber: true },
                  { label: 'Net Pay', value: fmt(p.netPay), green: true },
                ].map((item, j) => (
                  <div key={j} style={{ backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#718096' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: item.red ? '#E53E3E' : item.amber ? '#D69E2E' : item.green ? '#38A169' : '#2D3748' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {p.allowances.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#718096' }}>
                  Allowances: {p.allowances.map(a => `${a.name} (BWP ${a.amount} — ${a.taxable ? 'Taxable' : 'Non-taxable'})`).join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Run Payroll Modal */}
      {showRunModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '440px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Run Payroll — {payPeriod}</h3>
            <div style={{ backgroundColor: '#F7FAFC', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Pay Period', value: payPeriod },
                { label: 'Employees', value: employees.length },
                { label: 'Total Gross', value: fmt(totalGross) },
                { label: 'Total PAYE', value: fmt(totalPAYE) },
                { label: 'Total Net Pay', value: fmt(totalNet) },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid #E2E8F0' : 'none' }}>
                  <span style={{ fontSize: '13px', color: '#718096' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '600' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: '#FFFFF0', border: '1px solid #D69E2E', borderRadius: '6px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#744210' }}>
              ⚠️ Running payroll will calculate all payslips. The client must approve before payslips are released to employees.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRunModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={() => { setStatus('processing'); setShowRunModal(false); }} style={{ padding: '8px 20px', backgroundColor: '#805AD5', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Confirm & Run</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit for Approval Modal */}
      {showApproveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '440px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Submit for Approval</h3>
            <div style={{ backgroundColor: '#EBF8FF', border: '1px solid #BEE3F8', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#2C5282' }}>
              This will notify the client to review and approve the {payPeriod} payroll. Once approved, payslips will be released to employees.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowApproveModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={() => { setStatus('approved'); setShowApproveModal(false); }} style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Submit for Approval</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;