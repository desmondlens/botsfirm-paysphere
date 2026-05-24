import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/employees', label: 'Employees', icon: '👥' },
    { path: '/admin/payroll', label: 'Payroll', icon: '💰' },
    { path: '/admin/leave', label: 'Leave', icon: '📅' },
    { path: '/admin/allowances', label: 'Allowances', icon: '➕' },
    { path: '/admin/deductions', label: 'Deductions', icon: '➖' },
    { path: '/admin/reports', label: 'Reports', icon: '📄' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
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
              <div style={{ color: '#718096', fontSize: '11px', marginTop: '2px' }}>Admin Portal</div>
            </div>
          ) : (
            <div style={{ color: '#2B6CB0', fontWeight: '700', fontSize: '16px' }}>BP</div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
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
            Welcome, {user?.full_name || 'Admin'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#FFFFF0',
              color: '#D69E2E',
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '10px',
              fontWeight: '500',
            }}>
              ITW-7 due in 22 days
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
            >Logout</button>
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

export default AdminLayout;