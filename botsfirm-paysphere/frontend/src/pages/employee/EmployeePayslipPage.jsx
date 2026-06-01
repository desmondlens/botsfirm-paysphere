import React, { useState } from 'react';

const EmployeePayslipPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  const months = ['April 2026', 'March 2026', 'February 2026', 'January 2026'];

  const payslips = {
    'April 2026': {
      month: 'April 2026',
      pay_date: '30 April 2026',
      employee: 'Gorata Mosimanegape',
      employee_number: 'EMP001',
      id_number: '900101-1234',
      job_title: 'Site Foreman',
      department: 'Operations',
      nationality: 'Citizen',
      company: 'Kgabo Construction (Pty) Ltd',
      burs_number: 'BURS-KGB-2024-001',
      bank: 'First National Bank',
      account: '****5678',
      basic: 8000,
      allowances: [
        { name: 'Housing Allowance', amount: 2000, taxable: true },
        { name: 'Transport Allowance', amount: 500, taxable: false },
      ],
      deductions: [],
      paye: 525,
      net: 9975,
    },
    'March 2026': {
      month: 'March 2026',
      pay_date: '31 March 2026',
      employee: 'Gorata Mosimanegape',
      employee_number: 'EMP001',
      id_number: '900101-1234',
      job_title: 'Site Foreman',
      department: 'Operations',
      nationality: 'Citizen',
      company: 'Kgabo Construction (Pty) Ltd',
      burs_number: 'BURS-KGB-2024-001',
      bank: 'First National Bank',
      account: '****5678',
      basic: 8000,
      allowances: [
        { name: 'Housing Allowance', amount: 2000, taxable: true },
        { name: 'Transport Allowance', amount: 500, taxable: false },
      ],
      deductions: [],
      paye: 525,
      net: 9975,
    },
  };

  const p = payslips[selectedMonth] || payslips['April 2026'];
  const taxableAllowances = p.allowances.filter(a => a.taxable).reduce((s, a) => s + a.amount, 0);
  const nonTaxableAllowances = p.allowances.filter(a => !a.taxable).reduce((s, a) => s + a.amount, 0);
  const grossTaxable = p.basic + taxableAllowances;
  const grossPay = grossTaxable + nonTaxableAllowances;
  const totalDeductions = p.deductions.reduce((s, d) => s + d.amount, 0);

  const fmt = (n) => `BWP ${n.toLocaleString()}`;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>My Payslip</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>View your payslip for each month</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF' }}
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button
            onClick={() => alert('PDF download will be available once payroll is processed by your admin.')}
            style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >⬇ Download PDF</button>
        </div>
      </div>

      {/* Payslip Document */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* Payslip Header */}
        <div style={{ backgroundColor: '#2B6CB0', color: '#FFFFFF', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>Botsfirm PaySphere</div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>Payroll Management Platform</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>PAYSLIP</div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>{p.month}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Company and Employee Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>Employer</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{p.company}</div>
              <div style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>BURS: {p.burs_number}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>Employee</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{p.employee}</div>
              <div style={{ fontSize: '13px', color: '#718096', marginTop: '2px' }}>{p.job_title} · {p.department}</div>
              <div style={{ fontSize: '13px', color: '#718096' }}>ID: {p.id_number} · {p.nationality}</div>
              <div style={{ fontSize: '13px', color: '#718096' }}>Emp No: {p.employee_number}</div>
            </div>
          </div>

          {/* Pay Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>Pay Period</div>
              <div style={{ fontSize: '14px', color: '#2D3748' }}>{p.month}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>Pay Date</div>
              <div style={{ fontSize: '14px', color: '#2D3748' }}>{p.pay_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>Bank</div>
              <div style={{ fontSize: '14px', color: '#2D3748' }}>{p.bank}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>Account Number</div>
              <div style={{ fontSize: '14px', color: '#2D3748' }}>{p.account}</div>
            </div>
          </div>

          {/* Earnings */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '12px' }}>Earnings</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F7FAFC' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>Description</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px', color: '#718096', fontWeight: '600' }}>Tax Treatment</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '12px', color: '#718096', fontWeight: '600' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#2D3748' }}>Basic Salary</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FFF5F5', color: '#E53E3E', fontWeight: '500' }}>Taxable</span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#2D3748' }}>{fmt(p.basic)}</td>
                </tr>
                {p.allowances.map((a, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#2D3748' }}>{a.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                        backgroundColor: a.taxable ? '#FFF5F5' : '#F0FFF4',
                        color: a.taxable ? '#E53E3E' : '#38A169',
                        fontWeight: '500',
                      }}>{a.taxable ? 'Taxable' : 'Non-Taxable'}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#2D3748' }}>{fmt(a.amount)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F7FAFC' }}>
                  <td colSpan={2} style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#2D3748' }}>Gross Pay</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#2B6CB0' }}>{fmt(grossPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '12px' }}>Deductions</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F7FAFC' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>Description</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '12px', color: '#718096', fontWeight: '600' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#2D3748' }}>PAYE (Income Tax)</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#E53E3E', fontWeight: '500' }}>- {fmt(p.paye)}</td>
                </tr>
                {p.deductions.map((d, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#2D3748' }}>{d.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#E53E3E' }}>- {fmt(d.amount)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F7FAFC' }}>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#2D3748' }}>Total Deductions</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#E53E3E' }}>- {fmt(p.paye + totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Pay */}
          <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#2D3748' }}>NET PAY</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Paid to {p.bank} {p.account}</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#38A169' }}>{fmt(p.net)}</div>
          </div>

          {/* Tax Summary */}
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#F7FAFC', borderRadius: '8px', fontSize: '12px', color: '#718096' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#4A5568' }}>Tax Summary</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span>Gross Taxable Income: <strong style={{ color: '#2D3748' }}>{fmt(grossTaxable)}</strong></span>
              <span>PAYE Withheld: <strong style={{ color: '#E53E3E' }}>{fmt(p.paye)}</strong></span>
              <span>Effective Rate: <strong style={{ color: '#2D3748' }}>{((p.paye / grossTaxable) * 100).toFixed(1)}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslipPage;