import { FiCheck } from 'react-icons/fi';
import theme from '../../../styles/theme';

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const commonFeatures = [
  'PAYE calculation',
  'Payslip generation',
  'Leave management',
  'Audit log',
  'Employee portal',
];

const plans = [
  {
    name: 'Starter',
    range: '1–10 employees',
    cta: 'Contact for Pricing',
    popular: false,
    features: [...commonFeatures],
  },
  {
    name: 'Growth',
    range: '11–50 employees',
    cta: 'Contact for Pricing',
    popular: true,
    features: [
      ...commonFeatures,
      'PDF payslip download',
      'QuickBooks export',
      'BURS reports',
    ],
  },
  {
    name: 'Business',
    range: '51–100 employees',
    cta: 'Contact for Pricing',
    popular: false,
    features: [
      ...commonFeatures,
      'PDF payslip download',
      'QuickBooks export',
      'BURS reports',
      'Priority support',
      'Work permit alerts',
    ],
  },
  {
    name: 'Enterprise',
    range: '100+ employees',
    cta: 'Contact Us',
    popular: false,
    custom: true,
    features: [
      ...commonFeatures,
      'PDF payslip download',
      'QuickBooks export',
      'BURS reports',
      'Priority support',
      'Work permit alerts',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
];

export default function PricingCards() {
  return (
    <section id="pricing" style={{ backgroundColor: theme.colors.secondary, padding: '5rem 0' }}>
      <div className="container">
        <h2 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>Simple, Transparent Pricing</h2>
        <p className="section-subtitle text-center">
          No hidden fees. No surprises. Contact us to get the right plan for your business.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}>
          {plans.map(plan => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #pricing .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          #pricing .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function PricingCard({ plan }) {
  const cardStyle = {
    backgroundColor: theme.colors.secondary,
    border: plan.popular ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.card,
    boxShadow: plan.popular ? '0 4px 20px rgba(43,108,176,0.15)' : theme.shadows.card,
    padding: '1.75rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'box-shadow 0.2s ease',
  };

  return (
    <div style={cardStyle}>
      {plan.popular && (
        <div style={{
          position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: theme.colors.primary, color: theme.colors.secondary,
          fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.875rem',
          borderRadius: '0 0 6px 6px', whiteSpace: 'nowrap', letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          Most Popular
        </div>
      )}

      <div style={{ marginBottom: '1.5rem', marginTop: plan.popular ? '0.75rem' : '0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.colors.text, marginBottom: '0.25rem' }}>
          {plan.name}
        </h3>
        <p style={{ fontSize: '0.875rem', color: theme.colors.muted, marginBottom: '1rem' }}>{plan.range}</p>
        {plan.custom ? (
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.colors.primary }}>Custom Pricing</p>
        ) : (
          <p style={{ fontSize: '1rem', fontWeight: 600, color: theme.colors.text }}>Contact for Pricing</p>
        )}
      </div>

      <ul style={{ flex: 1, marginBottom: '1.5rem' }}>
        {plan.features.map(feature => (
          <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <FiCheck size={16} style={{ color: theme.colors.success, flexShrink: 0, marginTop: '0.2rem' }} />
            <span style={{ fontSize: '0.875rem', color: theme.colors.text, lineHeight: 1.5 }}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={plan.popular ? 'btn btn-primary' : 'btn btn-outline'}
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={() => scrollTo('contact')}
      >
        {plan.cta}
      </button>
    </div>
  );
}
