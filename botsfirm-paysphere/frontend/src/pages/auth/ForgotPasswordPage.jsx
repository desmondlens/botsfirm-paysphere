// ForgotPasswordPage.jsx
// Triggers /api/auth/forgot-password. Always shows a neutral success message
// regardless of whether the email exists (do not reveal account existence).

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AuthShell,
  Field,
  ErrorBanner,
  SuccessBanner,
  authStyles as styles,
} from './LoginPage';
import { api } from '../../context/AuthContext';
import theme from '../../styles/theme';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setDone(true);
    } catch {
      // Mirror server behaviour — never expose lookup outcome.
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell preheader="Reset your password">
      <h1 style={styles.title}>Forgot your password?</h1>
      <p style={styles.subtitle}>
        Enter your email and we'll send you a reset link.
      </p>

      {error && <ErrorBanner message={error} />}
      {done && (
        <SuccessBanner message="If this email exists, a reset link has been sent." />
      )}

      {!done && (
        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@company.co.bw"
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
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <div style={styles.footerLinks}>
        <Link to="/login" style={{ ...styles.link, color: theme.colors.primary }}>
          ← Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
