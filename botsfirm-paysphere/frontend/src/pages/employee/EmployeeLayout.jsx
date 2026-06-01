import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmployeeLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/employee/payslip', label: 'My Payslip', icon: '💰' },
    { path: '/employee/leave', label: 'My Leave', icon: '📅' },
    { path: '/employee/profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <div style={{
        width: '220px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ color: '#2B6CB0', fontWeight: '700', fontSize: '16px' }}>Botsfirm PaySphere</div>
          <div style={{ color: '#718096', fontSize: '11px', marginTop: '2px' }}>Employee Portal</div>
        </div>

        {/* Employee Info */}
        <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F7FAFC' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px', fontWeight: '700',
            color: '#2B6CB0', marginBottom: '8px',
          }}>
            {user?.full_name?.charAt(0) || 'E'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#2D3748' }}>{user?.full_name || 'Employee'}</div>
          <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>Kgabo Construction</div>
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
              })}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #E2E8F0',
              borderRadius: '6px', color: '#4A5568',
              cursor: 'pointer', fontSize: '13px',
            }}
          >Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '220px', flex: 1 }}>
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
            Welcome back, {user?.full_name?.split(' ')[0] || 'Employee'}
          </div>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            {new Date().toLocaleDateString('en-BW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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

export default EmployeeLayout;