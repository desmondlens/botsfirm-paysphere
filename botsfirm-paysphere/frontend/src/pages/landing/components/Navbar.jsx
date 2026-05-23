import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import theme from '../../../styles/theme';

const navLinks = [
  { label: 'Features', target: 'features' },
  { label: 'How It Works', target: 'how-it-works' },
  { label: 'Pricing', target: 'pricing' },
  { label: 'Services', target: 'services' },
  { label: 'Contact', target: 'contact' },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: theme.colors.secondary,
    borderBottom: `1px solid ${scrolled ? theme.colors.border : 'transparent'}`,
    boxShadow: scrolled ? theme.shadows.navbar : 'none',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  };

  const innerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  };

  const logoStyle = {
    fontFamily: theme.fonts.heading,
    fontWeight: 700,
    fontSize: '1.125rem',
    color: theme.colors.primary,
    cursor: 'pointer',
    letterSpacing: '-0.02em',
  };

  const linkStyle = {
    fontFamily: theme.fonts.body,
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: theme.colors.text,
    cursor: 'pointer',
    padding: '0.25rem 0',
    border: 'none',
    background: 'none',
    transition: 'color 0.15s ease',
  };

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        <span style={logoStyle} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Botsfirm PaySphere
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-desktop">
          <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
            {navLinks.map(link => (
              <button
                key={link.target}
                style={linkStyle}
                onClick={() => scrollTo(link.target)}
                onMouseEnter={e => (e.currentTarget.style.color = theme.colors.primary)}
                onMouseLeave={e => (e.currentTarget.style.color = theme.colors.text)}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/trial')}>
              Start Free Trial
            </button>
          </div>
        </div>

        <button
          className="hamburger-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.text, padding: '0.25rem' }}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div style={{
          backgroundColor: theme.colors.secondary,
          borderTop: `1px solid ${theme.colors.border}`,
          padding: '1rem 1.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {navLinks.map(link => (
            <button
              key={link.target}
              style={{ ...linkStyle, textAlign: 'left', padding: '0.5rem 0' }}
              onClick={() => { scrollTo(link.target); setMenuOpen(false); }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.875rem' }} onClick={() => { navigate('/login'); setMenuOpen(false); }}>
              Login
            </button>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.875rem' }} onClick={() => { navigate('/trial'); setMenuOpen(false); }}>
              Start Free Trial
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
