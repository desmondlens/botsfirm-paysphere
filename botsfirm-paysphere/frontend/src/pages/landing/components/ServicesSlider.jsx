import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import theme from '../../../styles/theme';

const slides = [
  { icon: '💼', title: 'Payroll Management', description: 'Accurate, automated payroll for every employee' },
  { icon: '📊', title: 'BURS Compliance', description: 'ITW-7, ITW-10, ITW-8 reports generated automatically' },
  { icon: '📒', title: 'QuickBooks Integration', description: 'Export journal entries directly to QuickBooks format' },
  { icon: '🏖️', title: 'Leave Management', description: 'Track annual, sick, maternity and paternity leave' },
  { icon: '👤', title: 'Employee Self-Service', description: 'Employees view payslips and apply for leave online' },
  { icon: '💰', title: 'Terminal Benefits', description: 'Severance and gratuity calculated per Employment Act' },
  { icon: '📚', title: 'Bookkeeping Support', description: 'Clean financial records for your accountant' },
];

export default function ServicesSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  function go(index, dir) {
    setDirection(dir);
    setCurrent((index + slides.length) % slides.length);
  }

  function prev() {
    go(current - 1, -1);
  }

  function next() {
    go(current + 1, 1);
  }

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent(c => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [paused, current]);

  const variants = {
    enter: dir => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: dir => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section style={{ backgroundColor: theme.colors.lightBlue, padding: '4rem 0' }}>
      <div className="container">
        <h2 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>What We Offer</h2>
        <p className="section-subtitle text-center">Everything you need to run payroll in Botswana — in one platform.</p>

        <div
          style={{ position: 'relative', maxWidth: '540px', margin: '0 auto' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div style={{ overflow: 'hidden', borderRadius: theme.borderRadius.card }}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', margin: '0.25rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>{slides[current].icon}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.colors.text, marginBottom: '0.625rem' }}>
                    {slides[current].title}
                  </h3>
                  <p style={{ color: theme.colors.muted, fontSize: '1rem', lineHeight: 1.6 }}>
                    {slides[current].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={prev}
            style={{
              position: 'absolute', top: '50%', left: '-1.5rem', transform: 'translateY(-50%)',
              background: theme.colors.secondary, border: `1px solid ${theme.colors.border}`,
              borderRadius: '50%', width: '2.5rem', height: '2.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: theme.shadows.card, color: theme.colors.text,
            }}
            aria-label="Previous slide"
          >
            <FiChevronLeft size={18} />
          </button>

          <button
            onClick={next}
            style={{
              position: 'absolute', top: '50%', right: '-1.5rem', transform: 'translateY(-50%)',
              background: theme.colors.secondary, border: `1px solid ${theme.colors.border}`,
              borderRadius: '50%', width: '2.5rem', height: '2.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: theme.shadows.card, color: theme.colors.text,
            }}
            aria-label="Next slide"
          >
            <FiChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? 1 : -1)}
              style={{
                width: i === current ? '1.5rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '99px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: i === current ? theme.colors.primary : theme.colors.border,
                transition: 'width 0.3s ease, background-color 0.3s ease',
                padding: 0,
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
