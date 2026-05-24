import React, { useState } from 'react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('itw7');
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [generating, setGenerating] = useState('');

  const months = ['May 2026', 'April 2026', 'March 2026', 'February 2026'];

  const handleGenerate = (report) => {
    setGenerating(report);
    setTimeout(() => setGenerating(''), 2000);
  };

  const payrollData = {
    month: 'May 2026',
    employees: [
      { name: 'Gorata Mosimanegape', tin: 'TIN-001-2024', gross: 10500, paye: 525, nationality: 'Citizen' },
      { name: 'Tshepiso Kgari', tin: 'TIN-002-2024', gross: 15000, paye: 1788, nationality: 'Non-Resident' },
      { name: 'Boitumelo Selwe', tin: 'TIN-003-2024', gross: 18500, paye: 2213, nationality: 'Citizen' },
    ],
    totalGross: 44000,
    totalPAYE: 4526,
    companyBURS: 'BURS-KGB-2024-001',
    companyName: 'Kgabo Construction (Pty) Ltd',
  };

  const tabs = [
    { key: 'itw7', label: 'ITW-7 Monthly' },
    { key: 'itw10', label: 'ITW-10 Annual' },
    { key: 'itw8', label: 'ITW-8 Certificates' },
    { key: 'quickbooks', label: 'QuickBooks Export' },
  ];

  const ReportButton = ({ label, report, color }) => (
    <button
      onClick={() => handleGenerate(report)}
      style={{
        padding: '8px 20px',
        backgroundColor: generating === report ? '#38A169' : (color || '#2B6CB0'),
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        minWidth: '140px',
      }}
    >
      {generating === report ? '✓ Generated!' : label}
    </button>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Reports</h1>
        <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
          Generate BURS compliance reports and QuickBooks exports
        </p>
      </div>

      {/* BURS Deadline Alert */}
      <div style={{
        backgroundColor: '#FFFFF0',
        border: '1px solid #D69E2E',
        borderRadius: '8px',
        padding: '12px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>📋</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#744210' }}>ITW-7 Due in 22 days</div>
            <div style={{ fontSize: '12px', color: '#D69E2E' }}>May 2026 PAYE return must be submitted to BURS by June 15, 2026</div>
          </div>
        </div>
        <ReportButton label="Generate ITW-7" report="itw7-quick" />
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 20px' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 20px',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #2B6CB0' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.key ? '#2B6CB0' : '#718096',
                fontWeight: activeTab === tab.key ? '600' : '400',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
              }}
            >{tab.label}</button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>

          {/* ITW-7 Tab */}
          {activeTab === 'itw7' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>ITW-7 Monthly PAYE Return</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#718096' }}>Submit to BURS by the 15th of the following month</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ReportButton label="Download ITW-7" report="itw7" />
                </div>
              </div>

              {/* ITW-7 Preview */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#2B6CB0', color: '#FFFFFF', padding: '16px 20px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>BOTSWANA UNIFIED REVENUE SERVICE</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>ITW-7 — Monthly PAYE Return — {selectedMonth}</div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    {[
                      { label: 'Employer Name', value: payrollData.companyName },
                      { label: 'BURS Reference Number', value: payrollData.companyBURS },
                      { label: 'Tax Period', value: selectedMonth },
                      { label: 'Due Date', value: 'June 15, 2026' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F7FAFC' }}>
                        {['Employee Name', 'TIN', 'Nationality', 'Gross Income', 'PAYE Withheld'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData.employees.map((emp, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '8px 12px', fontSize: '13px', color: '#2D3748' }}>{emp.name}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', color: '#718096' }}>{emp.tin}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', color: '#718096' }}>{emp.nationality}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', color: '#4A5568' }}>BWP {emp.gross.toLocaleString()}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '600', color: '#E53E3E' }}>BWP {emp.paye.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid #2B6CB0', backgroundColor: '#EBF8FF' }}>
                        <td colSpan={3} style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '700', color: '#2B6CB0' }}>TOTAL PAYE PAYABLE TO BURS</td>
                        <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '700', color: '#2D3748' }}>BWP {payrollData.totalGross.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '700', color: '#E53E3E' }}>BWP {payrollData.totalPAYE.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>
                    This return must be submitted and PAYE remitted to BURS by June 15, 2026. Late submission attracts 10% interest plus penalties.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ITW-10 Tab */}
          {activeTab === 'itw10' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>ITW-10 Annual PAYE Return</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#718096' }}>Annual reconciliation — due September 30 each year</p>
                </div>
                <ReportButton label="Download ITW-10" report="itw10" />
              </div>
              <div style={{ backgroundColor: '#F7FAFC', borderRadius: '8px', padding: '20px', border: '1px solid #E2E8F0' }}>
                {[
                  { label: 'Tax Year', value: '2025/2026 (July 2025 — June 2026)' },
                  { label: 'Due Date', value: 'September 30, 2026' },
                  { label: 'Total Annual Gross', value: 'BWP 528,000 (12 months)' },
                  { label: 'Total Annual PAYE', value: 'BWP 54,312 (12 months)' },
                  { label: 'Months Filed', value: '10 of 12' },
                  { label: 'Status', value: 'In Progress' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid #E2E8F0' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#718096' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ITW-8 Tab */}
          {activeTab === 'itw8' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>ITW-8 Employee Tax Certificates</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#718096' }}>Issue to all employees by September 30 each year</p>
                </div>
                <ReportButton label="Generate All ITW-8s" report="itw8-all" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {payrollData.employees.map((emp, i) => (
                  <div key={i} style={{ backgroundColor: '#F7FAFC', borderRadius: '8px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{emp.name}</div>
                      <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>TIN: {emp.tin} · {emp.nationality}</div>
                      <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>Annual PAYE: BWP {(emp.paye * 12).toLocaleString()}</div>
                    </div>
                    <ReportButton label="Download ITW-8" report={`itw8-${i}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QuickBooks Tab */}
          {activeTab === 'quickbooks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>QuickBooks Journal Entry Export</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#718096' }}>Download Excel file ready for QuickBooks import</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ReportButton label="Download Excel" report="quickbooks" color="#38A169" />
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#38A169', color: '#FFFFFF', padding: '12px 20px', fontSize: '14px', fontWeight: '600' }}>
                  Journal Entry Preview — {selectedMonth}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F7FAFC' }}>
                      {['Date', 'Account', 'Description', 'Debit', 'Credit'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { account: 'Salaries & Wages Expense', desc: 'Gross salaries May 2026', debit: 'BWP 44,000', credit: '' },
                      { account: 'PAYE Payable', desc: 'PAYE withheld May 2026', debit: '', credit: 'BWP 4,526' },
                      { account: 'Loan Deductions Payable', desc: 'Employee loan deductions', debit: '', credit: 'BWP 500' },
                      { account: 'Net Salaries Payable', desc: 'Net pay to employees', debit: '', credit: 'BWP 38,974' },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#718096' }}>31/05/2026</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{row.account}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#718096' }}>{row.desc}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#2B6CB0', fontWeight: row.debit ? '600' : '400' }}>{row.debit}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#38A169', fontWeight: row.credit ? '600' : '400' }}>{row.credit}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #E2E8F0', backgroundColor: '#F7FAFC' }}>
                      <td colSpan={3} style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '700', color: '#2D3748' }}>TOTALS</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '700', color: '#2B6CB0' }}>BWP 44,000</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '700', color: '#38A169' }}>BWP 44,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#718096' }}>
                ✓ Debits equal Credits — journal is balanced. Download Excel to import into QuickBooks.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;