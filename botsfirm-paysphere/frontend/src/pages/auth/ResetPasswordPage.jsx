// ResetPasswordPage.jsx
// Consumes ?token=... from the password-reset email.

import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import {
  AuthShell,
  Field,
  ErrorBanner,
  SuccessBanner,
  authStyles as styles,
} from './LoginPage';
import { authAPI } from '../../services/api';
import theme from '../../styles/theme';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const checks = usePasswordChecklist(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!checks.allMet) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err?.response?.data?.error || 'Reset failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell preheader="Reset your password">
        <h1 style={styles.title}>Invalid reset link</h1>
        <p style={styles.subtitle}>
          The reset link is missing a token. Please request a new one.
        </p>
        <Link to="/forgot-password" style={{ ...styles.link, fontSize: '14px' }}>
          Request another reset link →
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell preheader="Choose a new password">
      <h1 style={styles.title}>Set a new password</h1>
      <p style={styles.subtitle}>Pick something strong and memorable.</p>

      {error && <ErrorBanner message={error} />}
      {success && (
        <SuccessBanner message="Password updated. Redirecting to sign in…" />
      )}

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
          disabled={submitting || success}
          style={{
            ...styles.primaryButton,
            opacity: submitting || success ? 0.7 : 1,
          }}
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
}

export function usePasswordChecklist(password) {
  return useMemo(() => {
    const length = (password || '').length >= 8;
    const number = /\d/.test(password || '');
    const symbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password || '');
    return {
      length,
      number,
      symbol,
      allMet: length && number && symbol,
    };
  }, [password]);
}

export function PasswordChecklist({ checks }) {
  const items = [
    { ok: checks.length, label: 'At least 8 characters' },
    { ok: checks.number, label: 'Contains a number' },
    { ok: checks.symbol, label: 'Contains a symbol' },
  ];
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: '0 0 16px',
        background: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.input,
        padding: '10px 12px',
      }}
    >
      {items.map((it) => (
        <li
          key={it.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: it.ok ? theme.colors.success : theme.colors.muted,
            padding: '2px 0',
          }}
        >
          {it.ok ? <FiCheck /> : <FiX style={{ color: theme.colors.border }} />}
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
