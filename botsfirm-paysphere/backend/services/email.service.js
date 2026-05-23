// email.service.js
// Transactional email for Botsfirm PaySphere using Resend.
// All templates share a common HTML shell with the brand colour palette.

const { resend, fromHeader, SUPPORT_EMAIL } = require('../config/email');

const COLORS = {
  primary: '#2B6CB0',
  background: '#F7FAFC',
  text: '#2D3748',
  muted: '#718096',
  success: '#38A169',
  warning: '#D69E2E',
  error: '#E53E3E',
  border: '#E2E8F0',
};

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrap({ title, preheader, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.background};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${COLORS.text};">
    <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader || '')}</span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.background};padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid ${COLORS.border};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:${COLORS.primary};padding:24px 32px;color:#FFFFFF;">
                <div style="font-size:20px;font-weight:700;letter-spacing:-0.01em;">Botsfirm PaySphere</div>
                <div style="font-size:13px;opacity:0.9;margin-top:2px;">Botswana payroll, simplified.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${COLORS.text};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background:${COLORS.background};padding:20px 32px;border-top:1px solid ${COLORS.border};color:${COLORS.muted};font-size:12px;line-height:1.5;">
                <div>Botsfirm PaySphere &middot; Gaborone, Botswana</div>
                <div style="margin-top:4px;">Need help? <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:${COLORS.primary};text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a></div>
                <div style="margin-top:8px;">This is an automated message — please do not reply directly.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href, label) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${COLORS.primary};color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">${escapeHtml(label)}</a>`;
}

function formatDate(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatMoney(amount) {
  const n = Number(amount || 0);
  return `BWP ${n.toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function send({ to, subject, html, preheader }) {
  if (!to) throw new Error('email.send requires `to`');
  const fullHtml = wrap({ title: subject, preheader, bodyHtml: html });
  const { data, error } = await resend.emails.send({
    from: fromHeader,
    to: Array.isArray(to) ? to : [to],
    subject,
    html: fullHtml,
  });
  if (error) {
    throw new Error(`email.send failed: ${error.message || error}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

async function sendWelcomeEmail(to, name, loginUrl, trialEndDate) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.text};">Welcome, ${escapeHtml(name)} 👋</h1>
    <p>Your free 7-day trial of Botsfirm PaySphere is ready. You can add up to 5 employees and run 1 payroll during the trial.</p>
    <p><strong>Trial ends:</strong> ${escapeHtml(formatDate(trialEndDate))}</p>
    <p style="margin:24px 0;">${button(loginUrl, 'Open your dashboard')}</p>
    <p>Need help getting started? Reply to this email or contact us at <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:${COLORS.primary};">${escapeHtml(SUPPORT_EMAIL)}</a>.</p>
  `;
  return send({
    to,
    subject: 'Welcome to Botsfirm PaySphere',
    html: body,
    preheader: 'Your 7-day free trial is ready.',
  });
}

async function sendTrialReminder(to, name, daysLeft, contactWhatsApp, contactEmail) {
  const urgent = daysLeft <= 1;
  const tone = urgent ? COLORS.warning : COLORS.primary;
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.text};">${daysLeft === 1 ? 'Your trial ends tomorrow' : `${daysLeft} days left on your trial`}</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Your Botsfirm PaySphere trial has <strong style="color:${tone};">${escapeHtml(String(daysLeft))} day${daysLeft === 1 ? '' : 's'} remaining</strong>. To keep your data and continue using the platform, upgrade to a paid plan before the trial ends.</p>
    <p>To upgrade, contact us:</p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li>WhatsApp: <strong>${escapeHtml(contactWhatsApp)}</strong></li>
      <li>Email: <a href="mailto:${escapeHtml(contactEmail)}" style="color:${COLORS.primary};">${escapeHtml(contactEmail)}</a></li>
    </ul>
    <p style="color:${COLORS.muted};font-size:13px;margin-top:24px;">If you do nothing, your trial data will be retained for 30 days after expiry before being permanently deleted.</p>
  `;
  return send({
    to,
    subject: `Botsfirm PaySphere trial — ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
    html: body,
    preheader: `Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} left on your trial.`,
  });
}

async function sendTrialExpired(to, name, contactWhatsApp, contactEmail) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.error};">Your trial has ended</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Your Botsfirm PaySphere trial expired today. Your account is now read-only. To restore full access and keep your data, please upgrade within 30 days.</p>
    <p>Contact us to upgrade:</p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li>WhatsApp: <strong>${escapeHtml(contactWhatsApp)}</strong></li>
      <li>Email: <a href="mailto:${escapeHtml(contactEmail)}" style="color:${COLORS.primary};">${escapeHtml(contactEmail)}</a></li>
    </ul>
    <p style="color:${COLORS.muted};font-size:13px;margin-top:24px;">All trial data will be permanently deleted 30 days from today if no upgrade is made.</p>
  `;
  return send({
    to,
    subject: 'Your Botsfirm PaySphere trial has ended',
    html: body,
    preheader: 'Upgrade within 30 days to keep your data.',
  });
}

async function sendDataDeletionWarning(to, name, deletionDate) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.error};">Final notice — data deletion scheduled</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Your Botsfirm PaySphere trial data is scheduled for permanent deletion on <strong>${escapeHtml(formatDate(deletionDate))}</strong>.</p>
    <p>If you'd like to upgrade and keep your data, please get in touch before that date.</p>
    <p>Contact: <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:${COLORS.primary};">${escapeHtml(SUPPORT_EMAIL)}</a></p>
  `;
  return send({
    to,
    subject: 'Final notice: your data will be deleted soon',
    html: body,
    preheader: `Your data will be deleted on ${formatDate(deletionDate)}.`,
  });
}

async function sendInviteCode(to, name, code, planName, redeemUrl) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.text};">Your Botsfirm PaySphere invite</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>You've been issued an invite code for the <strong>${escapeHtml(planName)}</strong> plan.</p>
    <div style="background:${COLORS.background};border:1px dashed ${COLORS.border};border-radius:6px;padding:16px;text-align:center;margin:20px 0;">
      <div style="font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.05em;">Invite code</div>
      <div style="font-size:24px;font-weight:700;color:${COLORS.primary};letter-spacing:0.1em;margin-top:6px;font-family:'Courier New',monospace;">${escapeHtml(code)}</div>
    </div>
    <p style="margin:24px 0;">${button(redeemUrl, 'Redeem your code')}</p>
    <p style="color:${COLORS.muted};font-size:13px;">Keep this code private. It can only be redeemed once.</p>
  `;
  return send({
    to,
    subject: 'Your Botsfirm PaySphere invite code',
    html: body,
    preheader: `Your invite code: ${code}`,
  });
}

async function sendAdminWelcome(to, name, companyName, loginUrl, temporaryPassword) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.text};">Welcome to ${escapeHtml(companyName)} on PaySphere</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>An admin account has been created for you. Please sign in with the temporary password below and set a new password on first login.</p>
    <div style="background:${COLORS.background};border:1px solid ${COLORS.border};border-radius:6px;padding:16px;margin:20px 0;">
      <div style="font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.05em;">Temporary password</div>
      <div style="font-size:18px;font-weight:600;color:${COLORS.text};margin-top:6px;font-family:'Courier New',monospace;">${escapeHtml(temporaryPassword)}</div>
    </div>
    <p style="margin:24px 0;">${button(loginUrl, 'Sign in to PaySphere')}</p>
    <p style="color:${COLORS.muted};font-size:13px;">For security, this password will only work on your first login.</p>
  `;
  return send({
    to,
    subject: 'Your Botsfirm PaySphere admin account is ready',
    html: body,
    preheader: 'Sign in and set your password.',
  });
}

async function sendPasswordReset(to, name, resetUrl, expiresIn) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.text};">Reset your password</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>We received a request to reset your Botsfirm PaySphere password. Click the button below to choose a new one.</p>
    <p style="margin:24px 0;">${button(resetUrl, 'Reset password')}</p>
    <p style="color:${COLORS.muted};font-size:13px;">This link expires in ${escapeHtml(expiresIn)}. If you didn't request a reset, you can safely ignore this email.</p>
  `;
  return send({
    to,
    subject: 'Reset your Botsfirm PaySphere password',
    html: body,
    preheader: 'Reset link inside (expires soon).',
  });
}

async function sendLeaveNotification(
  to,
  name,
  employeeName,
  leaveType,
  startDate,
  endDate,
  status,
) {
  const statusColor =
    status === 'approved'
      ? COLORS.success
      : status === 'rejected'
        ? COLORS.error
        : COLORS.warning;
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.text};">Leave request update</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>The following leave request has been <strong style="color:${statusColor};text-transform:capitalize;">${escapeHtml(status)}</strong>:</p>
    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;margin:16px 0;width:100%;">
      <tr><td style="color:${COLORS.muted};width:40%;">Employee</td><td><strong>${escapeHtml(employeeName)}</strong></td></tr>
      <tr><td style="color:${COLORS.muted};">Leave type</td><td>${escapeHtml(leaveType)}</td></tr>
      <tr><td style="color:${COLORS.muted};">From</td><td>${escapeHtml(formatDate(startDate))}</td></tr>
      <tr><td style="color:${COLORS.muted};">To</td><td>${escapeHtml(formatDate(endDate))}</td></tr>
    </table>
  `;
  return send({
    to,
    subject: `Leave ${status}: ${employeeName}`,
    html: body,
    preheader: `${employeeName}'s leave was ${status}.`,
  });
}

async function sendPayrollComplete(
  to,
  name,
  companyName,
  payPeriod,
  totalNet,
  employeeCount,
) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.success};">Payroll complete</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Payroll for <strong>${escapeHtml(companyName)}</strong> has been processed.</p>
    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;margin:16px 0;width:100%;">
      <tr><td style="color:${COLORS.muted};width:40%;">Pay period</td><td><strong>${escapeHtml(payPeriod)}</strong></td></tr>
      <tr><td style="color:${COLORS.muted};">Employees paid</td><td>${escapeHtml(String(employeeCount))}</td></tr>
      <tr><td style="color:${COLORS.muted};">Total net pay</td><td><strong>${escapeHtml(formatMoney(totalNet))}</strong></td></tr>
    </table>
    <p>Payslips are now available in the dashboard.</p>
  `;
  return send({
    to,
    subject: `Payroll complete — ${payPeriod}`,
    html: body,
    preheader: `${employeeCount} employees paid for ${payPeriod}.`,
  });
}

async function sendWorkPermitAlert(to, name, employeeName, expiryDate, daysRemaining) {
  const tone = daysRemaining <= 30 ? COLORS.error : COLORS.warning;
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${tone};">Work permit expiring</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>The work permit for <strong>${escapeHtml(employeeName)}</strong> expires on <strong>${escapeHtml(formatDate(expiryDate))}</strong> (${escapeHtml(String(daysRemaining))} day${daysRemaining === 1 ? '' : 's'} away).</p>
    <p>Please initiate the renewal process to avoid compliance issues with the Department of Labour.</p>
  `;
  return send({
    to,
    subject: `Work permit expiring: ${employeeName}`,
    html: body,
    preheader: `${employeeName}'s permit expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
  });
}

async function sendBURSDeadlineReminder(to, name, companyName, dueDate, returnType) {
  const body = `
    <h1 style="font-size:22px;margin:0 0 16px;color:${COLORS.warning};">BURS submission due</h1>
    <p>Hi ${escapeHtml(name)},</p>
    <p>A BURS <strong>${escapeHtml(returnType)}</strong> return for <strong>${escapeHtml(companyName)}</strong> is due on <strong>${escapeHtml(formatDate(dueDate))}</strong>.</p>
    <p>Please prepare and submit the return via the BURS e-services portal to avoid penalties.</p>
  `;
  return send({
    to,
    subject: `BURS ${returnType} due ${formatDate(dueDate)}`,
    html: body,
    preheader: `BURS ${returnType} return due soon.`,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendTrialReminder,
  sendTrialExpired,
  sendDataDeletionWarning,
  sendInviteCode,
  sendAdminWelcome,
  sendPasswordReset,
  sendLeaveNotification,
  sendPayrollComplete,
  sendWorkPermitAlert,
  sendBURSDeadlineReminder,
};
