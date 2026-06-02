// TrialSignupPage.jsx
// 2-step self-service trial signup. POSTs to /api/auth/trial-signup.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import {
  AuthShell,
  Field,
  ErrorBanner,
  authStyles as styles,
} from './LoginPage';
import { authAPI } from '../../services/api';
import theme from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
const EMPLOYEE_BANDS = [
  { value: '1-10', label: '1 – 10 employees' },
  { value: '11-50', label: '11 – 50 employees' },
  { value: '51-100', label: '51 – 100 employees' },
  { value: '100+', label: '100+ employees' },
];

function bandToEstimate(band) {
  switch (band) {
    case '1-10':
      return 5;
    case '11-50':
      return 30;
    case '51-100':
      return 75;
    case '100+':
      return 150;
    default:
      return null;
  }
}

export default function TrialSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [band, setBand] = useState('1-10');

  // Step 2
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validateStep1() {
    if (!companyName.trim()) return 'Company name is required.';
    if (!fullName.trim()) return 'Your full name is required.';
    if (!email.trim() || !email.includes('@')) {
      return 'A valid email is required.';
    }
    if (!phone.trim()) return 'Phone number is required.';
    return null;
  }

  function validatePassword(pw) {
    if (pw.length < 8) return 'Password must be at least 8 characters.';
    if (!/\d/.test(pw)) return 'Password must contain a number.';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw)) {
      return 'Password must contain a symbol.';
    }
    return null;
  }

  function handleNext() {
    const issue = validateStep1();
    if (issue) {
      setError(issue);
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const pwIssue = validatePassword(password);
    if (pwIssue) return setError(pwIssue);
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!acceptTerms) {
      return setError('Please accept the terms and conditions.');
    }
    setSubmitting(true);
    try {
      await api.post('/auth/trial-signup', {
        company_name: companyName.trim(),
        registration_number: registrationNumber.trim() || null,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        employee_count_estimate: bandToEstimate(band),
        password,
        accept_terms: true,
      });
      setDone(true);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell preheader="You're in!">
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <FiCheckCircle
            style={{ color: theme.colors.success, fontSize: '40px' }}
          />
          <h1 style={{ ...styles.title, margin: '14px 0 6px' }}>
            Your trial is ready
          </h1>
          <p style={{ ...styles.subtitle, marginBottom: '24px' }}>
            We've sent a welcome email to <strong>{email}</strong>. Sign in to
            start adding your first employees.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={styles.primaryButton}
          >
            Go to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell preheader="Start your 7-day free trial">
      <h1 style={styles.title}>Start your free trial</h1>
      <p style={styles.subtitle}>
        7 days, up to 5 employees, full PaySphere features. No card required.
      </p>

      <ProgressIndicator step={step} totalSteps={2} />

      {error && <ErrorBanner message={error} />}

      {step === 1 && (
        <div>
          <Field label="Company name">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={styles.input}
              placeholder="e.g. Bots Mining (Pty) Ltd"
            />
          </Field>
          <Field label="Registration number (optional)">
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              style={styles.input}
              placeholder="CIPA registration number"
            />
          </Field>
          <Field label="Your full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={styles.input}
              placeholder="Full legal name"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@company.co.bw"
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              placeholder="+267 7X XXX XXX"
            />
          </Field>
          <Field label="Estimated employees">
            <select
              value={band}
              onChange={(e) => setBand(e.target.value)}
              style={styles.input}
            >
              {EMPLOYEE_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={handleNext}
            style={styles.primaryButton}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <Field label="Create password" hint="At least 8 characters, with a number and a symbol.">
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Strong password"
            />
          </Field>
          <Field label="Confirm password">
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="Re-enter password"
            />
          </Field>
          <label
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              fontSize: '13px',
              color: theme.colors.muted,
              margin: '8px 0 20px',
            }}
          >
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <span>
              I accept the{' '}
              <Link to="/terms" style={{ color: theme.colors.primary }}>
                terms and conditions
              </Link>{' '}
              and the privacy policy.
            </span>
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                ...styles.primaryButton,
                background: '#FFFFFF',
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.primaryButton,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Creating your account…' : 'Start free trial'}
            </button>
          </div>
        </form>
      )}

      <div style={styles.footerLinks}>
        <span style={{ color: theme.colors.muted }}>Already have an account?</span>{' '}
        <Link to="/login" style={styles.link}>
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}

function ProgressIndicator({ step, totalSteps }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: theme.colors.muted,
          marginBottom: '6px',
        }}
      >
        <span style={{ fontWeight: 600, color: theme.colors.primary }}>
          Step {step} of {totalSteps}
        </span>
        <span>{step === 1 ? 'About you' : 'Secure your account'}</span>
      </div>
      <div
        style={{
          height: '4px',
          background: theme.colors.border,
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(step / totalSteps) * 100}%`,
            background: theme.colors.primary,
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
