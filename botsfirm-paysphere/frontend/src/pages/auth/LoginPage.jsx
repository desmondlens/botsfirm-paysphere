// LoginPage.jsx
// Sign-in screen for all roles. Accepts email OR username (for employees).

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import theme from '../../styles/theme';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectFor(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  function redirectFor(u) {
    if (u.role === 'employee' && u.first_login) return '/employee/set-password';
    if (u.role === 'super_admin') return '/super-admin/dashboard';
    if (u.role === 'client') return '/client/dashboard';
    if (u.role === 'admin') return '/admin/dashboard';
    return '/employee/dashboard';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your email/username and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };
      const { user: signedIn, redirect } = await login(payload);
      const from = location.state?.from;
      navigate(from || redirect || redirectFor(signedIn), { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.error;
      if (status === 423) {
        setError(
          message ||
            'This account is locked due to too many failed login attempts.',
        );
      } else if (status === 403) {
        setError(message || 'This account is inactive. Contact your admin.');
      } else if (status === 401) {
        setError('Invalid credentials. Please check and try again.');
      } else {
        setError(message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell preheader="Welcome back to Botsfirm PaySphere">
      <h1 style={styles.title}>Sign in</h1>
      <p style={styles.subtitle}>
        Welcome back. Sign in to manage your payroll.
      </p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email or Username">
          <input
            type="text"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={styles.input}
            placeholder="you@company.co.bw"
            disabled={submitting}
          />
        </Field>

        <Field label="Password">
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, paddingRight: '44px' }}
              placeholder="Enter your password"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={styles.eyeButton}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </Field>

        <div style={styles.row}>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Remember me
          </label>
          <Link to="/forgot-password" style={styles.link}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            ...styles.primaryButton,
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={styles.footerLinks}>
        <span style={{ color: theme.colors.muted }}>New to PaySphere?</span>{' '}
        <Link to="/trial" style={styles.link}>
          Start Free Trial
        </Link>
        <span style={{ margin: '0 8px', color: theme.colors.border }}>•</span>
        <Link to="/redeem" style={styles.link}>
          Redeem invite code
        </Link>
      </div>
    </AuthShell>
  );
}

// ---------------------------------------------------------------------------
// Shared auth-page primitives (kept local; promote to /components/auth later)
// ---------------------------------------------------------------------------

export function AuthShell({ children, preheader }) {
  return (
    <div style={shellStyles.page}>
      <div style={shellStyles.brandBar}>
        <span style={shellStyles.brandMark}>Botsfirm</span>
        <span style={shellStyles.brandSuffix}>PaySphere</span>
      </div>
      <div style={shellStyles.cardWrap}>
        <div style={shellStyles.card}>{children}</div>
        {preheader && <p style={shellStyles.tagline}>{preheader}</p>}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={styles.label}>{label}</label>
      {children}
      {hint && <div style={styles.hint}>{hint}</div>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  return (
    <div style={styles.errorBanner} role="alert">
      <FiAlertCircle style={{ flexShrink: 0, marginTop: '2px' }} />
      <span>{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }) {
  return (
    <div style={styles.successBanner} role="status">
      {message}
    </div>
  );
}

const shellStyles = {
  page: {
    minHeight: '100vh',
    background: theme.colors.background,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
  },
  brandBar: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginBottom: '24px',
  },
  brandMark: {
    fontSize: '20px',
    fontWeight: 700,
    color: theme.colors.primary,
    letterSpacing: '-0.01em',
  },
  brandSuffix: {
    fontSize: '20px',
    fontWeight: 500,
    color: theme.colors.text,
  },
  cardWrap: {
    width: '100%',
    maxWidth: '440px',
  },
  card: {
    background: '#FFFFFF',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.card,
    padding: '36px 32px',
    boxShadow: theme.shadows.card,
  },
  tagline: {
    textAlign: 'center',
    color: theme.colors.muted,
    fontSize: '13px',
    marginTop: '20px',
  },
};

const styles = {
  title: {
    margin: '0 0 6px',
    fontSize: '22px',
    fontWeight: 700,
    color: theme.colors.text,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: '0 0 24px',
    color: theme.colors.muted,
    fontSize: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: theme.colors.text,
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    fontSize: '14px',
    color: theme.colors.text,
    background: '#FFFFFF',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.input,
    fontFamily: 'inherit',
    outline: 'none',
  },
  hint: {
    marginTop: '4px',
    color: theme.colors.muted,
    fontSize: '12px',
  },
  eyeButton: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: theme.colors.muted,
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '8px 0 20px',
    fontSize: '13px',
  },
  checkboxRow: {
    display: 'inline-flex',
    alignItems: 'center',
    color: theme.colors.muted,
    cursor: 'pointer',
  },
  link: {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontWeight: 500,
  },
  primaryButton: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    background: theme.colors.primary,
    border: 'none',
    borderRadius: theme.borderRadius.button,
    fontFamily: 'inherit',
  },
  footerLinks: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
  },
  errorBanner: {
    display: 'flex',
    gap: '10px',
    background: '#FFF5F5',
    color: theme.colors.error,
    border: `1px solid #FED7D7`,
    borderRadius: theme.borderRadius.input,
    padding: '10px 12px',
    fontSize: '13px',
    marginBottom: '16px',
    lineHeight: 1.4,
  },
  successBanner: {
    background: '#F0FFF4',
    color: theme.colors.success,
    border: `1px solid #C6F6D5`,
    borderRadius: theme.borderRadius.input,
    padding: '10px 12px',
    fontSize: '13px',
    marginBottom: '16px',
    lineHeight: 1.4,
  },
};

export { styles as authStyles };
