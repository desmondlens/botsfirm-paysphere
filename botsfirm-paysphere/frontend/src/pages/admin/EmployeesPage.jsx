import React, { useState } from 'react';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([
    {
      id: '1',
      employee_number: 'EMP001',
      first_name: 'Gorata',
      last_name: 'Mosimanegape',
      full_name: 'Gorata Mosimanegape',
      id_number: '900101-1234',
      nationality_status: 'citizen',
      burs_tin: 'TIN-001-2024',
      department: 'Operations',
      job_title: 'Site Foreman',
      employment_type: 'permanent',
      contract_start_date: '2024-01-15',
      basic_salary: 8000,
      bank_name: 'First National Bank',
      bank_account_number: '62012345678',
      is_active: true,
      work_permit_number: null,
      work_permit_expiry: null,
    },
    {
      id: '2',
      employee_number: 'EMP002',
      first_name: 'Tshepiso',
      last_name: 'Kgari',
      full_name: 'Tshepiso Kgari',
      id_number: 'PP-ZA-123456',
      nationality_status: 'non_resident',
      burs_tin: 'TIN-002-2024',
      department: 'Engineering',
      job_title: 'Engineer',
      employment_type: 'permanent',
      contract_start_date: '2024-02-01',
      basic_salary: 12000,
      bank_name: 'Stanbic Bank',
      bank_account_number: '9040123456',
      is_active: true,
      work_permit_number: 'WP-2024-00123',
      work_permit_expiry: '2026-08-15',
    },
    {
      id: '3',
      employee_number: 'EMP003',
      first_name: 'Boitumelo',
      last_name: 'Selwe',
      full_name: 'Boitumelo Selwe',
      id_number: '950505-5678',
      nationality_status: 'citizen',
      burs_tin: 'TIN-003-2024',
      department: 'Finance',
      job_title: 'Accountant',
      employment_type: 'permanent',
      contract_start_date: '2024-03-01',
      basic_salary: 15000,
      bank_name: 'Barclays Bank',
      bank_account_number: '00123456789',
      is_active: true,
      work_permit_number: null,
      work_permit_expiry: null,
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    id_number: '',
    nationality_status: 'citizen',
    burs_tin: '',
    department: '',
    job_title: '',
    employment_type: 'permanent',
    contract_start_date: '',
    basic_salary: '',
    bank_name: '',
    bank_account_number: '',
    work_permit_number: '',
    work_permit_expiry: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const filtered = employees.filter(e => {
    const matchSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_number.toLowerCase().includes(search.toLowerCase()) ||
      e.job_title.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.employment_type === filterType;
    return matchSearch && matchType;
  });

  const nationalityLabels = {
    citizen: { label: 'Citizen', bg: '#F0FFF4', color: '#38A169' },
    resident_non_citizen: { label: 'Resident Non-Citizen', bg: '#EBF8FF', color: '#2B6CB0' },
    non_resident: { label: 'Non-Resident', bg: '#FFF5F5', color: '#E53E3E' },
  };

  const validate = () => {
    const e = {};
    if (!newEmployee.first_name.trim()) e.first_name = 'Required';
    if (!newEmployee.last_name.trim()) e.last_name = 'Required';
    if (!newEmployee.id_number.trim()) e.id_number = 'Required';
    if (!newEmployee.job_title.trim()) e.job_title = 'Required';
    if (!newEmployee.basic_salary) e.basic_salary = 'Required';
    if (parseFloat(newEmployee.basic_salary) < 1579.2) e.basic_salary = 'Below minimum wage (BWP 9.06/hr × 174hrs)';
    if (!newEmployee.username.trim()) e.username = 'Required';
    if (!newEmployee.password.trim()) e.password = 'Required';
    if (newEmployee.password.length < 8) e.password = 'Minimum 8 characters';
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const emp = {
      id: Date.now().toString(),
      employee_number: `EMP00${employees.length + 1}`,
      first_name: newEmployee.first_name,
      last_name: newEmployee.last_name,
      full_name: `${newEmployee.first_name} ${newEmployee.last_name}`,
      id_number: newEmployee.id_number,
      nationality_status: newEmployee.nationality_status,
      burs_tin: newEmployee.burs_tin,
      department: newEmployee.department,
      job_title: newEmployee.job_title,
      employment_type: newEmployee.employment_type,
      contract_start_date: newEmployee.contract_start_date,
      basic_salary: parseFloat(newEmployee.basic_salary),
      bank_name: newEmployee.bank_name,
      bank_account_number: newEmployee.bank_account_number,
      work_permit_number: newEmployee.work_permit_number || null,
      work_permit_expiry: newEmployee.work_permit_expiry || null,
      is_active: true,
    };
    setEmployees(prev => [...prev, emp]);
    setShowAddModal(false);
    setNewEmployee({
      first_name: '', last_name: '', id_number: '', nationality_status: 'citizen',
      burs_tin: '', department: '', job_title: '', employment_type: 'permanent',
      contract_start_date: '', basic_salary: '', bank_name: '', bank_account_number: '',
      work_permit_number: '', work_permit_expiry: '', username: '', password: '',
    });
    setErrors({});
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
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Employees</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>{employees.length} employees</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >+ Add Employee</button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, number or job title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
        >
          <option value="all">All Types</option>
          <option value="permanent">Permanent</option>
          <option value="fixed_term">Fixed Term</option>
          <option value="casual">Casual</option>
          <option value="contractor">Contractor</option>
        </select>
      </div>

      {/* Work Permit Alert */}
      {employees.some(e => e.work_permit_expiry) && (
        <div style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', padding: '12px 20px', marginBottom: '16px', fontSize: '13px', color: '#C53030', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️</span>
          <span>Tshepiso Kgari's work permit expires on 15 August 2026. Ensure renewal is processed in time.</span>
        </div>
      )}

      {/* Employees Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              {['Employee', 'Number', 'Department', 'Job Title', 'Nationality', 'Basic Salary', 'Type', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#2B6CB0', flexShrink: 0 }}>
                      {emp.first_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{emp.full_name}</div>
                      {emp.work_permit_expiry && <div style={{ fontSize: '11px', color: '#E53E3E' }}>⚠️ Permit expires {emp.work_permit_expiry}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#718096' }}>{emp.employee_number}</td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4A5568' }}>{emp.department || '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4A5568' }}>{emp.job_title}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: nationalityLabels[emp.nationality_status]?.bg, color: nationalityLabels[emp.nationality_status]?.color, fontWeight: '500' }}>
                    {nationalityLabels[emp.nationality_status]?.label}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4A5568' }}>BWP {emp.basic_salary.toLocaleString()}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#F0FFF4', color: '#38A169', fontWeight: '500', textTransform: 'capitalize' }}>
                    {emp.employment_type.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <button
                    onClick={() => { setSelectedEmployee(emp); setShowModal(true); }}
                    style={{ fontSize: '12px', color: '#2B6CB0', background: 'none', border: '1px solid #2B6CB0', borderRadius: '4px', padding: '3px 10px', cursor: 'pointer', fontWeight: '500' }}
                  >View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Employee Modal */}
      {showModal && selectedEmployee && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '540px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Employee Profile</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: '#2B6CB0' }}>
                {selectedEmployee.first_name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2D3748' }}>{selectedEmployee.full_name}</div>
                <div style={{ fontSize: '13px', color: '#718096' }}>{selectedEmployee.job_title} · {selectedEmployee.employee_number}</div>
              </div>
            </div>
            {[
              { section: 'Personal Information', fields: [
                { label: 'ID Number', value: selectedEmployee.id_number },
                { label: 'Nationality Status', value: nationalityLabels[selectedEmployee.nationality_status]?.label },
                { label: 'BURS TIN', value: selectedEmployee.burs_tin },
              ]},
              { section: 'Employment Details', fields: [
                { label: 'Department', value: selectedEmployee.department || '—' },
                { label: 'Job Title', value: selectedEmployee.job_title },
                { label: 'Employment Type', value: selectedEmployee.employment_type.replace('_', ' ') },
                { label: 'Start Date', value: selectedEmployee.contract_start_date },
                { label: 'Basic Salary', value: `BWP ${selectedEmployee.basic_salary.toLocaleString()}` },
              ]},
              { section: 'Banking Details', fields: [
                { label: 'Bank Name', value: selectedEmployee.bank_name },
                { label: 'Account Number', value: selectedEmployee.bank_account_number },
              ]},
              ...(selectedEmployee.work_permit_number ? [{ section: 'Work Permit', fields: [
                { label: 'Permit Number', value: selectedEmployee.work_permit_number },
                { label: 'Expiry Date', value: selectedEmployee.work_permit_expiry },
              ]}] : []),
            ].map((section, si) => (
              <div key={si} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{section.section}</div>
                {section.fields.map((field, fi) => (
                  <div key={fi} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F7FAFC' }}>
                    <span style={{ fontSize: '13px', color: '#718096' }}>{field.label}</span>
                    <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500', textTransform: 'capitalize' }}>{field.value}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '560px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            {/* Personal Info */}
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '12px' }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'First Name', key: 'first_name', type: 'text' },
                { label: 'Last Name', key: 'last_name', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input type={field.type} value={newEmployee[field.key]} onChange={e => setNewEmployee(prev => ({ ...prev, [field.key]: e.target.value }))} style={{ ...inputStyle, borderColor: errors[field.key] ? '#E53E3E' : '#E2E8F0' }} />
                  {errors[field.key] && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors[field.key]}</div>}
                </div>
              ))}
            </div>
            {[
              { label: 'ID Number / Passport Number', key: 'id_number', type: 'text' },
              { label: 'BURS Tax Reference Number (TIN)', key: 'burs_tin', type: 'text' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{field.label}</label>
                <input type={field.type} value={newEmployee[field.key]} onChange={e => setNewEmployee(prev => ({ ...prev, [field.key]: e.target.value }))} style={{ ...inputStyle, borderColor: errors[field.key] ? '#E53E3E' : '#E2E8F0' }} />
                {errors[field.key] && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors[field.key]}</div>}
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nationality Status</label>
              <select value={newEmployee.nationality_status} onChange={e => setNewEmployee(prev => ({ ...prev, nationality_status: e.target.value }))} style={inputStyle}>
                <option value="citizen">Citizen</option>
                <option value="resident_non_citizen">Resident Non-Citizen</option>
                <option value="non_resident">Non-Resident</option>
              </select>
            </div>

            {/* Employment Info */}
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '12px', marginTop: '8px' }}>Employment Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[
                { label: 'Department', key: 'department', type: 'text' },
                { label: 'Job Title', key: 'job_title', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input type={field.type} value={newEmployee[field.key]} onChange={e => setNewEmployee(prev => ({ ...prev, [field.key]: e.target.value }))} style={{ ...inputStyle, borderColor: errors[field.key] ? '#E53E3E' : '#E2E8F0' }} />
                  {errors[field.key] && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors[field.key]}</div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Employment Type</label>
                <select value={newEmployee.employment_type} onChange={e => setNewEmployee(prev => ({ ...prev, employment_type: e.target.value }))} style={inputStyle}>
                  <option value="permanent">Permanent</option>
                  <option value="fixed_term">Fixed Term</option>
                  <option value="casual">Casual</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Contract Start Date</label>
                <input type="date" value={newEmployee.contract_start_date} onChange={e => setNewEmployee(prev => ({ ...prev, contract_start_date: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Basic Salary (BWP/month)</label>
              <input type="number" value={newEmployee.basic_salary} onChange={e => setNewEmployee(prev => ({ ...prev, basic_salary: e.target.value }))} style={{ ...inputStyle, borderColor: errors.basic_salary ? '#E53E3E' : '#E2E8F0' }} placeholder="e.g. 8000" />
              {errors.basic_salary && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.basic_salary}</div>}
              <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>Minimum wage: BWP 9.06/hr (approx BWP 1,579/month)</div>
            </div>

            {/* Work Permit */}
            {newEmployee.nationality_status !== 'citizen' && (
              <>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '12px', marginTop: '8px' }}>Work Permit</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Permit Number</label>
                    <input type="text" value={newEmployee.work_permit_number} onChange={e => setNewEmployee(prev => ({ ...prev, work_permit_number: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Expiry Date</label>
                    <input type="date" value={newEmployee.work_permit_expiry} onChange={e => setNewEmployee(prev => ({ ...prev, work_permit_expiry: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
              </>
            )}

            {/* Banking */}
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '12px', marginTop: '8px' }}>Banking Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Bank Name</label>
                <select value={newEmployee.bank_name} onChange={e => setNewEmployee(prev => ({ ...prev, bank_name: e.target.value }))} style={inputStyle}>
                  <option value="">Select bank</option>
                  <option value="First National Bank">First National Bank</option>
                  <option value="Stanbic Bank">Stanbic Bank</option>
                  <option value="Barclays Bank">Barclays Bank</option>
                  <option value="Standard Chartered">Standard Chartered</option>
                  <option value="Bank of Botswana">Bank of Botswana</option>
                  <option value="BancABC">BancABC</option>
                  <option value="Bank Gaborone">Bank Gaborone</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Account Number</label>
                <input type="text" value={newEmployee.bank_account_number} onChange={e => setNewEmployee(prev => ({ ...prev, bank_account_number: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            {/* Portal Access */}
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '12px', marginTop: '8px' }}>Portal Access</div>
            <div style={{ backgroundColor: '#EBF8FF', border: '1px solid #BEE3F8', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: '#2C5282' }}>
              Assign a username and temporary password. The employee will be prompted to change their password on first login.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input type="text" value={newEmployee.username} onChange={e => setNewEmployee(prev => ({ ...prev, username: e.target.value }))} style={{ ...inputStyle, borderColor: errors.username ? '#E53E3E' : '#E2E8F0' }} placeholder="e.g. gorata.001" />
                {errors.username && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.username}</div>}
              </div>
              <div>
                <label style={labelStyle}>Temporary Password</label>
                <input type="password" value={newEmployee.password} onChange={e => setNewEmployee(prev => ({ ...prev, password: e.target.value }))} style={{ ...inputStyle, borderColor: errors.password ? '#E53E3E' : '#E2E8F0' }} placeholder="••••••••" />
                {errors.password && <div style={{ fontSize: '11px', color: '#E53E3E', marginTop: '2px' }}>{errors.password}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleAdd} style={{ padding: '8px 20px', backgroundColor: '#2B6CB0', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Add Employee</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;