import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/client/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/client/admins', label: 'Admins', icon: '👤' },
    { path: '/client/leave-approvals', label: 'Leave Approvals', icon: '✅' },
    { path: '/client/payroll', label: 'Payroll Overview', icon: '💰' },
    { path: '/client/compliance', label: 'Compliance', icon: '📋' },
    { path: '/client/audit-logs', label: 'Audit Logs', icon: '🔍' },
    { path: '/client/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '240px' : '60px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #E2E8F0' }}>
          {sidebarOpen ? (
            <div>
              <div style={{ color: '#2B6CB0', fontWeight: '700', fontSize: '16px' }}>Botsfirm PaySphere</div>
              <div style={{ color: '#718096', fontSize: '11px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'Client Portal'}
              </div>
            </div>
          ) : (
            <div style={{ color: '#2B6CB0', fontWeight: '700', fontSize: '16px' }}>BP</div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '6px',
                marginBottom: '4px',
                textDecoration: 'none',
                color: isActive ? '#2B6CB0' : '#4A5568',
                backgroundColor: isActive ? '#EBF8FF' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '14px',
                transition: 'all 0.15s ease',
              })}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            margin: '8px',
            padding: '8px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: '#718096',
            fontSize: '12px',
          }}
        >
          {sidebarOpen ? '◀ Collapse' : '▶'}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: sidebarOpen ? '240px' : '60px', flex: 1, transition: 'margin-left 0.2s ease' }}>

        {/* Top Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <div style={{ color: '#2D3748', fontWeight: '600', fontSize: '14px' }}>
            Welcome, {user?.full_name || 'Client'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#F0FFF4',
              color: '#38A169',
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '10px',
              fontWeight: '500',
            }}>
              Active Subscription
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#4A5568',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;