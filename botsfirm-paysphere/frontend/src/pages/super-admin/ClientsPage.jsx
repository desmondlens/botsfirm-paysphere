import React, { useState, useEffect } from 'react';

const ClientsPage = () => {
  const [clients, setClients] = useState([
    {
      id: '11111111-1111-1111-1111-111111111111',
      company_name: 'Kgabo Construction (Pty) Ltd',
      email: 'admin@kgaboconstruction.co.bw',
      phone: '+267 71 234 567',
      plan: 'growth',
      max_employees: 25,
      employees_used: 3,
      status: 'active',
      subscription_start: '2026-03-24',
      subscription_end: '2027-03-24',
      burs_number: 'BURS-KGB-2024-001',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      company_name: 'Petra Holdings (Pty) Ltd',
      email: 'admin@petraholdings.co.bw',
      phone: '+267 72 765 432',
      plan: 'business',
      max_employees: 50,
      employees_used: 3,
      status: 'active',
      subscription_start: '2026-02-22',
      subscription_end: '2027-02-22',
      burs_number: 'BURS-PET-2024-002',
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const filtered = clients.filter(c => {
    const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchPlan = filterPlan === 'all' || c.plan === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  const planColors = {
    starter: { bg: '#F0FFF4', color: '#38A169' },
    growth: { bg: '#EBF8FF', color: '#2B6CB0' },
    business: { bg: '#FAF5FF', color: '#805AD5' },
    enterprise: { bg: '#FFFAF0', color: '#DD6B20' },
    trial: { bg: '#FFFFF0', color: '#D69E2E' },
  };

  const statusColors = {
    active: { bg: '#F0FFF4', color: '#38A169' },
    expired: { bg: '#FFF5F5', color: '#E53E3E' },
    suspended: { bg: '#FFF5F5', color: '#E53E3E' },
    trial: { bg: '#FFFFF0', color: '#D69E2E' },
  };

  const handleSuspend = (clientId) => {
    setClients(prev => prev.map(c =>
      c.id === clientId
        ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' }
        : c
    ));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#2D3748', fontSize: '22px', fontWeight: '700', margin: 0 }}>Clients</h1>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '4px' }}>
            Manage all client accounts — {clients.length} total
          </p>
        </div>
        <button
          onClick={() => setShowNewClientModal(true)}
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
          + New Client
        </button>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search by company or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2D3748',
            outline: 'none',
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2D3748',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2D3748',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="business">Business</option>
          <option value="enterprise">Enterprise</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      {/* Clients Table */}
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
              {['Company', 'Plan', 'Employees', 'BURS Number', 'Subscription End', 'Status', 'Actions'].map(h => (
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#718096', fontSize: '14px' }}>
                  No clients found
                </td>
              </tr>
            ) : filtered.map((client, i) => (
              <tr key={client.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{client.company_name}</div>
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{client.email}</div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 10px',
                    borderRadius: '10px',
                    backgroundColor: planColors[client.plan]?.bg || '#F7FAFC',
                    color: planColors[client.plan]?.color || '#718096',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}>{client.plan}</span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#4A5568' }}>
                  {client.employees_used} / {client.max_employees}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4A5568' }}>
                  {client.burs_number}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4A5568' }}>
                  {new Date(client.subscription_end).toLocaleDateString('en-BW')}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 10px',
                    borderRadius: '10px',
                    backgroundColor: statusColors[client.status]?.bg || '#F7FAFC',
                    color: statusColors[client.status]?.color || '#718096',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}>{client.status}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedClient(client)}
                      style={{
                        fontSize: '12px',
                        color: '#2B6CB0',
                        background: 'none',
                        border: '1px solid #2B6CB0',
                        borderRadius: '4px',
                        padding: '3px 10px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >View</button>
                    <button
                      onClick={() => handleSuspend(client.id)}
                      style={{
                        fontSize: '12px',
                        color: client.status === 'active' ? '#E53E3E' : '#38A169',
                        background: 'none',
                        border: `1px solid ${client.status === 'active' ? '#E53E3E' : '#38A169'}`,
                        borderRadius: '4px',
                        padding: '3px 10px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >{client.status === 'active' ? 'Suspend' : 'Activate'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
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
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D3748' }}>Client Details</h3>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>
            {[
              { label: 'Company Name', value: selectedClient.company_name },
              { label: 'Email', value: selectedClient.email },
              { label: 'Phone', value: selectedClient.phone },
              { label: 'BURS Number', value: selectedClient.burs_number },
              { label: 'Plan', value: selectedClient.plan },
              { label: 'Employees', value: `${selectedClient.employees_used} / ${selectedClient.max_employees}` },
              { label: 'Subscription Start', value: new Date(selectedClient.subscription_start).toLocaleDateString('en-BW') },
              { label: 'Subscription End', value: new Date(selectedClient.subscription_end).toLocaleDateString('en-BW') },
              { label: 'Status', value: selectedClient.status },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F7FAFC' }}>
                <span style={{ fontSize: '13px', color: '#718096' }}>{item.label}</span>
                <span style={{ fontSize: '13px', color: '#2D3748', fontWeight: '500', textTransform: 'capitalize' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedClient(null)}
                style={{ padding: '8px 20px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#4A5568' }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;