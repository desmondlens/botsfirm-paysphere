import React, { useState } from 'react';

const PayrollOverviewPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('May 2026');

  const months = ['May 2026', 'April 2026', 'March 2026', 'February 2026'];

  const payrollData = {
    'May 2026': {
      status: 'Pending',
      statusColor: '#D69E2E',
      statusBg: '#FFFFF0',
      run_date: null,
      employees: [
        { name: 'Gorata Mosimanegape', number: 'EMP001', nationality: 'Citizen', basic: 8000, taxable_allowances: 2000, non_taxable_allowances: 500, gross: 10000, paye: 900, deductions: 0, net: 9600 },
        { name: 'Tshepiso Kgari', number: 'EMP002', nationality: 'Non-Citizen', basic: 12000, taxable_allowances: 3000, non_taxable_allowances: 0, gross: 15000, paye: 2100, deductions: 500, net: 12400 },
        { name: 'Boitumelo Selwe', number: 'EMP003', nationality: 'Citizen', basic: 15000, taxable_allowances: 2500, non_taxable_allowances: 1000, gross: 17500, paye: 2850, deductions: 0, net: 15650 },
      ],
    },
    'April 2026': {
      status: 'Paid',
      statusColor: '#38A169',
      statusBg: '#F0FFF4',
      run_date: '2026-04-28',
      employees: [
        { name: 'Gorata Mosimanegape', number: 'EMP001', nationality: 'Citizen', basic: 8000, taxable_allowances: 2000, non_taxable_allowances: 500, gross: 10000, paye: 900, deductions: 0, net: 9600 },
        { name: 'Tshepiso Kgari', number: 'EMP002', nationality: 'Non-Citizen', basic: 12000, taxable_allowances: 3000, non_taxable_allowances: 0, gross: 15000, paye: 2100, deductions: 500, net: 12400 },
        { name: 'Boitumelo Selwe', number: 'EMP003', nationality: 'Citizen', basic: 15000, taxable_allowances: 2500, non_taxable_allowances: 1000, gross: 17500, paye: 2850, deductions: 0, net: 15650 },
      ],
    },
  };

  const current = payrollData[selectedMonth] || payrollData['May 2026'];
  const employees = current.employees;
  const totalGross = employees.reduce((s, e) => s + e.gross, 0);
  const totalPAYE = employees.reduce((s, e) => s + e.paye, 0);
  const totalDeductions = employees.reduce((s, e) => s + e.deductions, 0);
  const totalNet = employees.reduce((s, e) => s + e.net, 0);

  const fmt = (n) => `BWP ${n.toLocaleString()}`;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Payroll Overview</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>View and monitor payroll for each period</p>
        </div>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
        >
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Status Banner */}
      <div style={{
        backgroundColor: current.statusBg,
        border: `1px solid ${current.statusColor}`,
        borderRadius: '8px',
        padding: '12px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: current.statusColor }}>
            {selectedMonth} Payroll — {current.status}
          </span>
          {current.run_date && (
            <span style={{ fontSize: '13px', color: '#718096', marginLeft: '12px' }}>
              Processed on {current.run_date}
            </span>
          )}
        </div>
        {current.status === 'Paid' && (
          <button style={{
            padding: '6px 16px',
            backgroundColor: '#FFFFFF',
            color: '#2B6CB0',
            border: '1px solid #2B6CB0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}>Download Report</button>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Gross Pay', value: fmt(totalGross), color: '#2B6CB0' },
          { label: 'Total PAYE', value: fmt(totalPAYE), color: '#E53E3E' },
          { label: 'Total Deductions', value: fmt(totalDeductions), color: '#D69E2E' },
          { label: 'Total Net Pay', value: fmt(totalNet), color: '#38A169' },
        ].map((card, i) => (
          <div key={i} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ color: card.color, fontSize: '20px', fontWeight: '700' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflowX: 'auto',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Employee Breakdown — {selectedMonth}</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              {['Employee', 'Status', 'Basic', 'Taxable Allow.', 'Non-Tax Allow.', 'Gross', 'PAYE', 'Deductions', 'Net Pay'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: '11px',
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
            {employees.map((emp, i) => (
              <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{emp.name}</div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>{emp.number}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: emp.nationality === 'Citizen' ? '#F0FFF4' : '#EBF8FF',
                    color: emp.nationality === 'Citizen' ? '#38A169' : '#2B6CB0',
                    fontWeight: '500',
                  }}>{emp.nationality}</span>
                </td>
                {[emp.basic, emp.taxable_allowances, emp.non_taxable_allowances, emp.gross].map((val, j) => (
                  <td key={j} style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>BWP {val.toLocaleString()}</td>
                ))}
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#E53E3E', fontWeight: '500' }}>BWP {emp.paye.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#D69E2E' }}>BWP {emp.deductions.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#38A169', fontWeight: '600' }}>BWP {emp.net.toLocaleString()}</td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr style={{ borderTop: '2px solid #E2E8F0', backgroundColor: '#F7FAFC' }}>
              <td colSpan={5} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#2D3748' }}>TOTALS</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#2B6CB0' }}>{fmt(totalGross)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#E53E3E' }}>{fmt(totalPAYE)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#D69E2E' }}>{fmt(totalDeductions)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#38A169' }}>{fmt(totalNet)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollOverviewPage;