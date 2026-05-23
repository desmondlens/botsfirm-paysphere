// server.js — Botsfirm PaySphere backend entry point.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const superAdminRoutes = require('./routes/superadmin.routes');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');
const employeeRoutes = require('./routes/employee.routes');
const payrollRoutes = require('./routes/payroll.routes');
const leaveRoutes = require('./routes/leave.routes');
const reportsRoutes = require('./routes/reports.routes');

const PORT = parseInt(process.env.PORT || '3002', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const CORS_ALLOWED_ORIGINS = (
  process.env.CORS_ALLOWED_ORIGINS || FRONTEND_URL
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (CORS_ALLOWED_ORIGINS.includes('*')) return callback(null, true);
      if (CORS_ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Global rate limit — 100 requests / 15 minutes / IP.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Try again later.' },
  }),
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'botsfirm-paysphere-api', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/reports', reportsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('[error]', err);
  if (err && err.message && err.message.startsWith('Origin ')) {
    return res.status(403).json({ error: err.message });
  }
  return res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Botsfirm PaySphere API listening on :${PORT}`);
  });
}

module.exports = app;
