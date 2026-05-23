import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LandingPage from './pages/landing/LandingPage';

function ComingSoon({ title }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      color: '#2D3748',
      backgroundColor: '#F7FAFC',
      gap: '1rem',
    }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{title}</h1>
      <p style={{ color: '#718096', fontSize: '1rem' }}>Coming soon.</p>
      <a href="/" style={{
        marginTop: '0.5rem',
        color: '#2B6CB0',
        fontWeight: 500,
        textDecoration: 'none',
        fontSize: '0.9375rem',
        border: '1px solid #2B6CB0',
        borderRadius: '6px',
        padding: '0.5rem 1.25rem',
      }}>
        Back to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<ComingSoon title="Login Page Coming Soon" />} />
        <Route path="/trial" element={<ComingSoon title="Trial Page Coming Soon" />} />
        <Route path="/redeem" element={<ComingSoon title="Redeem Invite Code Page Coming Soon" />} />
        <Route path="/super-admin/*" element={<ComingSoon title="Super Admin" />} />
        <Route path="/client/*" element={<ComingSoon title="Client Portal" />} />
        <Route path="/admin/*" element={<ComingSoon title="Admin Portal" />} />
        <Route path="/employee/*" element={<ComingSoon title="Employee Portal" />} />
      </Routes>
    </BrowserRouter>
  );
}
