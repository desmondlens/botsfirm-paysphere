// ProtectedRoute.jsx
// Guards routes by authentication and (optionally) by role.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import theme from '../../styles/theme';

function dashboardFor(role) {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'client':
      return '/client/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'employee':
      return '/employee/dashboard';
    default:
      return '/';
  }
}

function Spinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
        color: theme.colors.muted,
        fontSize: '0.95rem',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: `3px solid ${theme.colors.border}`,
          borderTopColor: theme.colors.primary,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={dashboardFor(user.role)} replace />;
  }

  return children;
}
