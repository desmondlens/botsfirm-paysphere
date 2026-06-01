import React, { useState, useEffect } from 'react';

/**
 * Botsfirm PaySphere — PayrollPage
 * DISPLAY ONLY — no payroll calculations allowed here.
 * All values come from backend API response.
 * Frontend rule: map and render only.
 */

// ─── Mock API response (replace with real API call in Phase 9) ───────────────
// This simulates what the backend payroll service will return.
// Shape matches backend canonical output exactly.
const MOCK_API_RESPONSE = {
  pay_period: 'May 2026',
  generated_at: '2026-05-31T08:00:00.000Z',
  status: 'completed',
  summary: {
    total_gross_pay: 44000,
    total_taxable_income: 42500,
    total_paye: 4526,
    total_other_deductions: 500,
    total_net_pay: 38974,
    employee_count: 3,
  },
  payslips: [
    {
      employee_id: '1',
      employee_number: 'EMP001',
      full_name: 'Gorata Mosimanegape',
      nationality_status: 'citizen',
      basic_salary: 8000,
      taxable_allowances: 2000,
      non_taxable_allowances: 500,
      gross_taxable_income: 10000,
      gross_pay: 10500,
      paye_amount: 525,
      annual_paye: 6300,
      effective_tax_rate: 5.25,
      other_deductions: 0,
      total_deductions: 525,
      net_pay: 9975,
      allowance_breakdown: [
        { name: 'Housing Allowance', amount: 2000, is_taxable: true },
        { name: 'Transport Allowance', amount: 500, is_taxable: false },
      ],
      deduction_breakdown: [],
    },
    {
      employee_id: '2',
      employee_number: 'EMP002',
      full_name: 'Tshepiso Kgari',
      nationality_status: 'non_resident',
      basic_salary: 12000,
      taxable_allowances: 3000,
      non_taxable_allowances: 0,
      gross_taxable_income: 15000,
      gross_pay: 15000,
      paye_amount: 1788,
      annual_paye: 21450,
      effective_tax_rate: 11.92,
      other_deductions: 500,
      total_deductions: 2288,
      net_pay: 12712,
      allowance_breakdown: [
        { name: 'Housing Allowance', amount: 3000, is_taxable: true },
      ],
      deduction_breakdown: [
        { name: 'Loan Repayment', amount: 500 },
      ],
    },
    {
      employee_id: '3',
      employee_number: 'EMP003',
      full_name: 'Boitumelo Selwe',
      nationality_status: 'citizen',
      basic_salary: 15000,
      taxable_allowances: 2500,
      non_taxable_allowances: 1000,
      gross_taxable_income: 17500,
      gross_pay: 18500,
      paye_amount: 2213,
      annual_paye: 26550,
      effective_tax_rate: 12.64,
      other_deductions: 0,
      total_deductions: 2213,
      net_pay: 16287,
      allowance_breakdown: [
        { name: 'Housing Allowance', amount: 2500, is_taxable: true },
        { name: 'Airtime Allowance', amount: 1000, is_taxable: false },
      ],
      deduction_breakdown: [],
    },
  ],
  errors: [],
};
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n) => `BWP ${Number(n || 0).toLocaleString()}`;

const NationalityBadge = ({ status }) => {
  const labels = {
    citizen: { label: 'Citizen', bg: '#F0FFF4', color: '#38A169' },
    resident_non_citizen: { label: 'Resident', bg: '#EBF8FF', color: '#2B6CB0' },
    non_resident: { label: 'Non-Resident', bg: '#FFF5F5', color: '#E53E3E' },
  };
  const style = labels[status] || { label: status, bg: '#F7FAFC', color: '#718096' };
  return (
    <span style={{
      fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
      backgroundColor: style.bg, color: style.color, fontWeight: '500',
    }}>{style.label}</span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    draft: { bg: '#F7FAFC', color: '#718096' },
    processing: { bg: '#FFFFF0', color: '#D69E2E' },
    approved: { bg: '#EBF8FF', color: '#2B6CB0' },
    paid: { bg: '#F0FFF4', color: '#38A169' },
    completed: { bg: '#F0FFF4', color: '#38A169' },
    completed_with_errors: { bg: '#FFF5F5', color: '#E53E3E' },
  };
  const s = styles[status] || styles.draft;
  return (
    <span style={{
      fontSize: '12px', padding: '3px 12px', borderRadius: '10px',
      backgroundColor: s.bg, color: s.color,
      fontWeight: '500', textTransform: 'capitalize',
    }}>{status?.replace(/_/g, ' ')}</span>
  );
};

const PayrollPage = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workflowStatus, setWorkflowStatus] = useState('draft');
  const [showRunModal, setShowRunModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [expandedPayslip, setExpandedPayslip] = useState(null);

  // Phase 9: replace this with real API call
  // const response = await fetch('/api/payroll/run', { method: 'POST', ... });
  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600)); // simulate network
      setPayrollData(MOCK_API_RESPONSE);
      setLoading(false);
    };
    fetchPayroll();
  }, []);

  const statusSteps = ['draft', 'processing', 'approved', 'paid'];
  const statusIndex = statusSteps.indexOf(workflowStatus);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#718096', fontSize: '14px' }}>
        Loading payroll data...
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#E53E3E', fontSize: '14px' }}>
        Failed to load payroll data. Please try again.
      </div>
    );
  }

  // ── Display only — values come directly from backend response ──
  const { summary, payslips, pay_period, errors } = payrollData;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Payroll</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>Pay period: {pay_period}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {workflowStatus === 'draft' && (
            <button
              onClick={() => setShowRunModal(true)}
              style={{ padding: '8px 20px', backgroundColor: '#805AD5', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >▶ Run Payroll</button>
          )}
          {workflowStatus === 'processing' && (
            <button
              onClick={() => setShowApproveModal(true)}
              style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >✓ Submit for Approval</button>
          )}
          {workflowStatus === 'approved' && (
            <button
              onClick={() => setWorkflowStatus('paid')}
              style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >Mark as Paid</button>
          )}
        </div>
      </div>

      {/* Errors from backend */}
      {errors?.length > 0 && (
        <div style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', padding: '12px 20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#C53030', marginBottom: '6px' }}>⚠️ Payroll Errors</div>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#E53E3E' }}>{e.full_name}: {e.error}</div>
          ))}
        </div>
      )}

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

      {/* Summary Cards — backend summary object ONLY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Employees', value: summary.employee_count, color: '#2B6CB0' },
          { label: 'Total Gross Pay', value: fmt(summary.total_gross_pay), color: '#2B6CB0' },
          { label: 'Total PAYE', value: fmt(summary.total_paye), color: '#E53E3E' },
          { label: 'Total Net Pay', value: fmt(summary.total_net_pay), color: '#38A169' },
        ].map((card, i) => (
          <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '16px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ color: card.color, fontSize: '20px', fontWeight: '700' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Payroll Table — backend payslips only */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Payslip Breakdown — {pay_period}</h3>
          <StatusBadge status={workflowStatus} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              {['Employee', 'Nationality', 'Basic', 'Tax Allow.', 'Non-Tax Allow.', 'Gross', 'PAYE', 'Deductions', 'Net Pay'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payslips.map((p) => (
              <tr key={p.employee_id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{p.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>{p.employee_number}</div>
                </td>
                <td style={{ padding: '12px 16px' }}><NationalityBadge status={p.nationality_status} /></td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{fmt(p.basic_salary)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{fmt(p.taxable_allowances)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4A5568' }}>{fmt(p.non_taxable_allowances)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#2D3748' }}>{fmt(p.gross_pay)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#E53E3E', fontWeight: '500' }}>{fmt(p.paye_amount)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#D69E2E' }}>{fmt(p.other_deductions)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#38A169', fontWeight: '700' }}>{fmt(p.net_pay)}</td>
              </tr>
            ))}
            {/* Totals row — backend summary only, no frontend computation */}
            <tr style={{ borderTop: '2px solid #E2E8F0', backgroundColor: '#F7FAFC' }}>
              <td colSpan={5} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#2D3748' }}>TOTALS ({summary.employee_count} employees)</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#2B6CB0' }}>{fmt(summary.total_gross_pay)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#E53E3E' }}>{fmt(summary.total_paye)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#D69E2E' }}>{fmt(summary.total_other_deductions)}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#38A169' }}>{fmt(summary.total_net_pay)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Individual Payslips — expandable, backend data only */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#2D3748' }}>Individual Payslips</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {payslips.map((p, i) => (
            <div key={p.employee_id} style={{ marginBottom: i < payslips.length - 1 ? '12px' : 0 }}>
              {/* Payslip Header — clickable to expand */}
              <div
                onClick={() => setExpandedPayslip(expandedPayslip === p.employee_id ? null : p.employee_id)}
                style={{ padding: '14px 16px', backgroundColor: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#2B6CB0' }}>
                    {p.full_name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{p.full_name}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{p.employee_number} · {pay_period}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#718096' }}>Net Pay</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#38A169' }}>{fmt(p.net_pay)}</div>
                  </div>
                  <div style={{ fontSize: '16px', color: '#718096' }}>{expandedPayslip === p.employee_id ? '▲' : '▼'}</div>
                </div>
              </div>

              {/* Expanded Payslip Detail */}
              {expandedPayslip === p.employee_id && (
                <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 8px 8px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { label: 'Basic Salary', value: fmt(p.basic_salary), color: '#2D3748' },
                      { label: 'Taxable Allow.', value: fmt(p.taxable_allowances), color: '#2D3748' },
                      { label: 'Non-Tax Allow.', value: fmt(p.non_taxable_allowances), color: '#2D3748' },
                      { label: 'Gross Pay', value: fmt(p.gross_pay), color: '#2B6CB0' },
                      { label: 'PAYE', value: `- ${fmt(p.paye_amount)}`, color: '#E53E3E' },
                      { label: 'Other Deductions', value: `- ${fmt(p.other_deductions)}`, color: '#D69E2E' },
                      { label: 'Effective Tax Rate', value: `${p.effective_tax_rate}%`, color: '#718096' },
                      { label: 'Net Pay', value: fmt(p.net_pay), color: '#38A169' },
                    ].map((item, j) => (
                      <div key={j} style={{ backgroundColor: '#F7FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', color: '#718096', marginBottom: '2px' }}>{item.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Allowance breakdown */}
                  {p.allowance_breakdown?.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#718096' }}>
                      <strong style={{ color: '#4A5568' }}>Allowances: </strong>
                      {p.allowance_breakdown.map((a, j) => (
                        <span key={j}>
                          {a.name} ({fmt(a.amount)} — {a.is_taxable ? 'Taxable' : 'Non-taxable'})
                          {j < p.allowance_breakdown.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Deduction breakdown */}
                  {p.deduction_breakdown?.length > 0 && (
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#718096' }}>
                      <strong style={{ color: '#4A5568' }}>Deductions: </strong>
                      {p.deduction_breakdown.map((d, j) => (
                        <span key={j}>
                          {d.name} ({fmt(d.amount)})
                          {j < p.deduction_breakdown.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
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
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Run Payroll — {pay_period}</h3>
            <div style={{ backgroundColor: '#F7FAFC', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Pay Period', value: pay_period },
                { label: 'Employees', value: summary.employee_count },
                { label: 'Total Gross Pay', value: fmt(summary.total_gross_pay) },
                { label: 'Total PAYE', value: fmt(summary.total_paye) },
                { label: 'Total Net Pay', value: fmt(summary.total_net_pay) },
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
              <button onClick={() => { setWorkflowStatus('processing'); setShowRunModal(false); }} style={{ padding: '8px 20px', backgroundColor: '#805AD5', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Confirm & Run</button>
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
              This will notify the client to review and approve the {pay_period} payroll. Once approved, payslips will be released to employees.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowApproveModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={() => { setWorkflowStatus('approved'); setShowApproveModal(false); }} style={{ padding: '8px 20px', backgroundColor: '#38A169', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Submit for Approval</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;