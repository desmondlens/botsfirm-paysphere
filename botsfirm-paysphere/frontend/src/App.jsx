import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import TrialSignupPage from './pages/auth/TrialSignupPage';
import RedeemInvitePage from './pages/auth/RedeemInvitePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EmployeeSetPasswordPage from './pages/auth/EmployeeSetPasswordPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import SuperAdminLayout from './pages/super-admin/SuperAdminLayout';
import DashboardPage from './pages/super-admin/DashboardPage';
import ClientsPage from './pages/super-admin/ClientsPage';
import InviteCodesPage from './pages/super-admin/InviteCodesPage';
import TrialsPage from './pages/super-admin/TrialsPage';
import AuditLogsPage from './pages/super-admin/AuditLogsPage';
import SettingsPage from './pages/super-admin/SettingsPage';
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import LeaveApprovalsPage from './pages/client/LeaveApprovalsPage';
import AdminsPage from './pages/client/AdminsPage';
import ClientSettingsPage from './pages/client/ClientSettingsPage';
import PayrollOverviewPage from './pages/client/PayrollOverviewPage';
import CompliancePage from './pages/client/CompliancePage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import PayrollPage from './pages/admin/PayrollPage';
import LeavePage from './pages/admin/LeavePage';
import AllowancesPage from './pages/admin/AllowancesPage';
import DeductionsPage from './pages/admin/DeductionsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage';
import EmployeePayslipPage from './pages/employee/EmployeePayslipPage';
import EmployeeLeavePage from './pages/employee/EmployeeLeavePage';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage';
import ClientAuditLogsPage from './pages/client/ClientAuditLogsPage';




function ComingSoon({ title }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#2D3748',
        backgroundColor: '#F7FAFC',
        gap: '1rem',
      }}
    >
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{title}</h1>
      <p style={{ color: '#718096', fontSize: '1rem' }}>Coming soon.</p>
      <a
        href="/"
        style={{
          marginTop: '0.5rem',
          color: '#2B6CB0',
          fontWeight: 500,
          textDecoration: 'none',
          fontSize: '0.9375rem',
          border: '1px solid #2B6CB0',
          borderRadius: '6px',
          padding: '0.5rem 1.25rem',
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

// PublicOnly — redirects authenticated users away from login/signup screens
// to their dashboard. Keeps deep-link behaviour intact for everyone else.
function PublicOnly({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && user) {
    if (user.role === 'employee' && user.first_login) {
      return <Navigate to="/employee/set-password" replace />;
    }
    const dest =
      user.role === 'super_admin'
        ? '/super-admin/dashboard'
        : user.role === 'client'
          ? '/client/dashboard'
          : user.role === 'admin'
            ? '/admin/dashboard'
            : '/employee/dashboard';
    return <Navigate to={dest} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Public auth routes — redirect away if already signed in */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/trial"
        element={
          <PublicOnly>
            <TrialSignupPage />
          </PublicOnly>
        }
      />
      <Route
        path="/redeem"
        element={
          <PublicOnly>
            <RedeemInvitePage />
          </PublicOnly>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated routes */}
      <Route
        path="/employee/set-password"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeSetPasswordPage />
          </ProtectedRoute>
        }
      />

      <Route
  path="/super-admin"
  element={
    <ProtectedRoute roles={['super_admin']}>
      <SuperAdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="clients" element={<ClientsPage />} />
  <Route path="trials" element={<TrialsPage />} />
  <Route path="invite-codes" element={<InviteCodesPage />} />
  <Route path="audit-logs" element={<AuditLogsPage />} />
  <Route path="settings" element={<SettingsPage />} />
  

</Route>     
      <Route
  path="/client"
  element={
    <ProtectedRoute roles={['client']}>
      <ClientLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<ClientDashboardPage />} />
  <Route path="leave-approvals" element={<LeaveApprovalsPage />} />
  <Route path="admins" element={<AdminsPage />} />
  <Route path="settings" element={<ClientSettingsPage />} />
  <Route path="payroll" element={<PayrollOverviewPage />} />
  <Route path="compliance" element={<CompliancePage />} />
  <Route path="audit-logs" element={<ClientAuditLogsPage />} />
</Route>

      
      
      <Route
  path="/admin"
  element={
    <ProtectedRoute roles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<AdminDashboardPage />} />
  <Route path="employees" element={<EmployeesPage />} />
  <Route path="payroll" element={<PayrollPage />} />
  <Route path="leave" element={<LeavePage />} />
  <Route path="allowances" element={<AllowancesPage />} />
  <Route path="deductions" element={<DeductionsPage />} />
  <Route path="reports" element={<ReportsPage />} />
  <Route path="settings" element={<AdminSettingsPage />} />
</Route>
      <Route
  path="/employee"
  element={
    <ProtectedRoute roles={['employee']}>
      <EmployeeLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<EmployeeDashboardPage />} />
  <Route path="set-password" element={<EmployeeSetPasswordPage />} />
  <Route path="payslip" element={<EmployeePayslipPage />} />
  <Route path="leave" element={<EmployeeLeavePage />} />
  <Route path="profile" element={<EmployeeProfilePage />} />

</Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
