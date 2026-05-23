import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import Navbar from './components/Navbar';
import ServicesSlider from './components/ServicesSlider';
import DemoCalculator from './components/DemoCalculator';
import PricingCards from './components/PricingCards';
import theme from '../../styles/theme';

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const features = [
  {
    icon: '🔒',
    title: 'Multi-tenant Security',
    description: 'Your data is completely isolated. No other company can see your information.',
  },
  {
    icon: '🧾',
    title: 'Citizen & Non-Citizen Tax',
    description: 'Correct PAYE for residents and non-residents automatically.',
  },
  {
    icon: '⚙️',
    title: 'Allowances Engine',
    description: 'Add taxable and non-taxable allowances with one click.',
  },
  {
    icon: '📋',
    title: 'Audit Trail',
    description: 'Every action is logged. Full compliance audit trail at all times.',
  },
  {
    icon: '📄',
    title: 'PDF Payslips',
    description: 'Professional payslips generated and available for download.',
  },
  {
    icon: '⚠️',
    title: 'Work Permit Alerts',
    description: 'Automatic alerts 60 and 30 days before work permit expiry.',
  },
];

const steps = [
  {
    number: 1,
    title: 'Get Your Invite Code',
    description: 'Contact us or start a free trial to receive your unique invite code.',
  },
  {
    number: 2,
    title: 'Set Up Your Company',
    description: 'Enter your company details, BURS number and preferences.',
  },
  {
    number: 3,
    title: 'Add Your Employees',
    description: 'Import or manually add employees with all their details.',
  },
  {
    number: 4,
    title: 'Run Payroll',
    description: 'Review, approve and generate payslips with one click.',
  },
];

const trustBadges = [
  'BURS Compliant',
  'Employment Act 2010',
  'HRDC Ready',
  'Secure & Encrypted',
];

function ContactForm() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.company.trim()) errs.company = 'Company name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontFamily: theme.fonts.body,
    fontSize: '0.9375rem',
    color: theme.colors.text,
    backgroundColor: theme.colors.secondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.input,
    outline: 'none',
    lineHeight: 1.5,
    marginTop: '0.375rem',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 500,
    fontSize: '0.875rem',
    color: theme.colors.text,
  };

  const fieldStyle = { marginBottom: '1rem' };
  const errorStyle = { color: theme.colors.error, fontSize: '0.8125rem', marginTop: '0.25rem' };

  if (submitted) {
    return (
      <div style={{
        backgroundColor: '#F0FFF4',
        border: `1px solid ${theme.colors.success}`,
        borderRadius: theme.borderRadius.card,
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.colors.success, marginBottom: '0.5rem' }}>
          Message Sent!
        </h3>
        <p style={{ color: theme.colors.text, fontSize: '0.9375rem' }}>
          Thank you, we'll respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={fieldStyle}>
        <label style={labelStyle}>Full Name</label>
        <input
          style={{ ...inputStyle, border: `1px solid ${errors.name ? theme.colors.error : theme.colors.border}` }}
          type="text"
          placeholder="Your full name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        {errors.name && <p style={errorStyle}>{errors.name}</p>}
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Company Name</label>
        <input
          style={{ ...inputStyle, border: `1px solid ${errors.company ? theme.colors.error : theme.colors.border}` }}
          type="text"
          placeholder="Your company name"
          value={form.company}
          onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
        />
        {errors.company && <p style={errorStyle}>{errors.company}</p>}
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Email Address</label>
        <input
          style={{ ...inputStyle, border: `1px solid ${errors.email ? theme.colors.error : theme.colors.border}` }}
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
        {errors.email && <p style={errorStyle}>{errors.email}</p>}
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Phone Number</label>
        <input
          style={inputStyle}
          type="tel"
          placeholder="+267 7X XXX XXX"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Message</label>
        <textarea
          style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', border: `1px solid ${errors.message ? theme.colors.error : theme.colors.border}` }}
          placeholder="Tell us about your business and payroll needs..."
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        />
        {errors.message && <p style={errorStyle}>{errors.message}</p>}
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
        Send Message
      </button>
    </form>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <section style={{ backgroundColor: theme.colors.lightBlue, padding: '6rem 0 5rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            color: theme.colors.text,
            lineHeight: 1.2,
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            Payroll Made Simple for<br />Botswana Businesses
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
            color: theme.colors.muted,
            maxWidth: '520px',
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}>
            BURS compliant. Employment Act ready. Built for Botswana.
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }} onClick={() => navigate('/trial')}>
              Start Free Trial
            </button>
            <button className="btn btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }} onClick={() => scrollTo('demo')}>
              Try Live Demo
            </button>
          </div>
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {trustBadges.map(badge => (
              <div key={badge} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: theme.colors.text,
                backgroundColor: theme.colors.secondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '99px',
                padding: '0.375rem 0.875rem',
              }}>
                <FiCheck size={14} style={{ color: theme.colors.success }} />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSlider />

      <section id="features" style={{ backgroundColor: theme.colors.secondary, padding: '5rem 0' }}>
        <div className="container">
          <h2 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>Built for Botswana Compliance</h2>
          <p className="section-subtitle text-center">
            Every feature is designed around Botswana's employment law and BURS requirements.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }} className="features-grid">
            {features.map(f => (
              <div key={f.title} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.875rem', lineHeight: 1 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: theme.colors.text, marginBottom: '0.5rem' }}>
                  {f.title}
                </h3>
                <p style={{ color: theme.colors.muted, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        `}</style>
      </section>

      <section id="how-it-works" style={{ backgroundColor: theme.colors.background, padding: '5rem 0' }}>
        <div className="container">
          <h2 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>How It Works</h2>
          <p className="section-subtitle text-center">
            Getting started with Botsfirm PaySphere takes less than a day.
          </p>
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              position: 'relative',
              zIndex: 1,
            }} className="steps-grid">
              {steps.map((step, idx) => (
                <div key={step.number} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    margin: '0 auto 1rem',
                    position: 'relative',
                    zIndex: 2,
                  }}>
                    {step.number}
                  </div>
                  {idx < steps.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '1.5rem',
                      left: `calc(${(idx + 1) * 25}% - 0.5rem)`,
                      width: 'calc(25% - 1rem)',
                      height: '2px',
                      backgroundColor: theme.colors.border,
                      zIndex: 0,
                    }} className="step-connector" />
                  )}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.colors.text, marginBottom: '0.5rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: theme.colors.muted, fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .steps-grid { grid-template-columns: 1fr !important; }
            .step-connector { display: none; }
          }
          @media (max-width: 1024px) {
            .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .step-connector { display: none; }
          }
        `}</style>
      </section>

      <DemoCalculator />

      <PricingCards />

      <section id="services" style={{ backgroundColor: theme.colors.background, padding: '5rem 0' }}>
        <div className="container">
          <h2 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>Our Services</h2>
          <p className="section-subtitle text-center">
            Whether you want to manage payroll yourself or let us handle it — we have a solution for you.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }} className="services-grid">
            {[
              {
                icon: '🏢',
                title: 'Payroll Bureau Services',
                description: 'We run your payroll for you. Fully managed service.',
              },
              {
                icon: '💻',
                title: 'Software as a Service',
                description: 'License the platform and manage payroll yourself.',
              },
              {
                icon: '📑',
                title: 'Bookkeeping & Compliance',
                description: 'Monthly bookkeeping and BURS submissions handled.',
              },
            ].map(service => (
              <div key={service.title} className="card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1 }}>{service.icon}</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.colors.text, marginBottom: '0.625rem' }}>
                  {service.title}
                </h3>
                <p style={{ color: theme.colors.muted, fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {service.description}
                </p>
                <button className="btn btn-outline" onClick={() => scrollTo('contact')}>
                  Contact Us
                </button>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) { .services-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 1024px) { .services-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      <section id="contact" style={{ backgroundColor: theme.colors.secondary, padding: '5rem 0' }}>
        <div className="container">
          <h2 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>Get in Touch</h2>
          <p className="section-subtitle text-center">
            Ready to simplify your payroll? We'd love to hear from you.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2.5rem',
            maxWidth: '900px',
            margin: '0 auto',
          }} className="contact-grid">
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.colors.text, marginBottom: '1.25rem' }}>
                Send Us a Message
              </h3>
              <ContactForm />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <a
                href="https://wa.me/267XXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
                style={{ padding: '0.875rem 1.25rem', fontSize: '1rem', justifyContent: 'center', textDecoration: 'none' }}
              >
                💬 Chat on WhatsApp
              </a>

              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <FiMail size={18} style={{ color: theme.colors.primary, flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: theme.colors.muted, fontWeight: 500, marginBottom: '0.125rem' }}>Email</p>
                    <a href="mailto:info@botsfirmpaysphere.com" style={{ fontSize: '0.9375rem', color: theme.colors.text, fontWeight: 500 }}>
                      info@botsfirmpaysphere.com
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <FiMapPin size={18} style={{ color: theme.colors.primary, flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: theme.colors.muted, fontWeight: 500, marginBottom: '0.125rem' }}>Location</p>
                    <p style={{ fontSize: '0.9375rem', color: theme.colors.text }}>Gaborone, Botswana</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <FiClock size={18} style={{ color: theme.colors.primary, flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: theme.colors.muted, fontWeight: 500, marginBottom: '0.125rem' }}>Business Hours</p>
                    <p style={{ fontSize: '0.9375rem', color: theme.colors.text }}>Monday to Friday, 7:30 AM – 5:00 PM</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <FiPhone size={18} style={{ color: theme.colors.primary, flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: theme.colors.muted, fontWeight: 500, marginBottom: '0.125rem' }}>Response Time</p>
                    <p style={{ fontSize: '0.9375rem', color: theme.colors.text }}>We respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      <footer style={{ backgroundColor: '#1A202C', color: '#CBD5E0', padding: '3rem 0 2rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
          }} className="footer-grid">
            <div>
              <h3 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                Botsfirm PaySphere
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#A0AEC0', lineHeight: 1.6, maxWidth: '300px' }}>
                Payroll Made Simple for Botswana Businesses
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <a href="mailto:info@botsfirmpaysphere.com" style={{ color: '#A0AEC0', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <FiMail size={15} /> info@botsfirmpaysphere.com
                </a>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9375rem', marginBottom: '0.875rem' }}>Quick Links</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem' }}>
                {[
                  { label: 'Features', target: 'features' },
                  { label: 'How It Works', target: 'how-it-works' },
                  { label: 'Pricing', target: 'pricing' },
                  { label: 'Services', target: 'services' },
                  { label: 'Contact', target: 'contact' },
                ].map(link => (
                  <button
                    key={link.target}
                    onClick={() => scrollTo(link.target)}
                    style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', fontSize: '0.875rem', padding: 0, fontFamily: theme.fonts.body }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A0AEC0')}
                  >
                    {link.label}
                  </button>
                ))}
                {['Privacy Policy', 'Terms and Conditions', 'Cookie Policy'].map(label => (
                  <a key={label} href="#" style={{ color: '#A0AEC0', fontSize: '0.875rem', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A0AEC0')}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #2D3748', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#718096' }}>
              © 2026 Botsfirm PaySphere. All rights reserved.
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#4A5568' }}>
              Built for Botswana. Compliant with BURS, Employment Act and HRDC.
            </p>
          </div>
        </div>
        <style>{`
          @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </footer>
    </>
  );
}
