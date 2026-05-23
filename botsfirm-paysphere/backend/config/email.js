// email.js
// Resend email client configuration.
// Centralises FROM_EMAIL and API key handling so call sites in
// email.service.js stay focused on templating.

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  process.env.EMAIL_FROM_ADDRESS ||
  'noreply@botsfirmpaysphere.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Botsfirm PaySphere';
const SUPPORT_EMAIL =
  process.env.EMAIL_SUPPORT_ADDRESS || 'support@botsfirmpaysphere.com';

if (!RESEND_API_KEY) {
  // We log instead of throw so the server can still boot without email keys
  // (useful for local dev). Send attempts will fail loudly.
  // eslint-disable-next-line no-console
  console.warn('[email] RESEND_API_KEY is not set — outgoing email will fail.');
}

const resend = new Resend(RESEND_API_KEY || 'missing-api-key');

const fromHeader = `${FROM_NAME} <${FROM_EMAIL}>`;

module.exports = {
  resend,
  FROM_EMAIL,
  FROM_NAME,
  SUPPORT_EMAIL,
  fromHeader,
};
