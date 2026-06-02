// EmployeeSetPasswordPage.jsx
// First-login screen for employees. Requires an authenticated session.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthShell,
  Field,
  ErrorBanner,
  authStyles as styles,
} from './LoginPage';
import {
  PasswordChecklist,
  usePasswordChecklist,
} from './ResetPasswordPage';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';


export default function EmployeeSetPasswordPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const checks = usePasswordChecklist(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!checks.allMet) {
      return setError('Please meet all password requirements.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    setSubmitting(true);
    try {
      await api.post('/auth/employee-first-login', { new_password: password });
      await refreshUser();
      navigate('/employee/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not set password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell preheader="Welcome to Botsfirm PaySphere">
      <h1 style={styles.title}>
        Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
      </h1>
      <p style={styles.subtitle}>
        Welcome to Botsfirm PaySphere. Please set your password to continue.
      </p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit}>
        <Field label="New password">
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </Field>

        <PasswordChecklist checks={checks} />

        <Field label="Confirm password">
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          style={{
            ...styles.primaryButton,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Saving…' : 'Set password and continue'}
        </button>
      </form>
    </AuthShell>
  );
}
