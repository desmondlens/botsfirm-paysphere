# pages/auth/

Authentication and account-onboarding screens.

## Pages

- **LoginPage** — email + password for Super Admin, Client, Admin. Username + password for Employees.
- **TrialSignupPage** — self-service signup for a 7-day free trial. Captures company name and a real email.
- **RedeemInvitePage** — landing for users following an invite link (Admin invited by Client, Employee invited by Admin). User sets their password and accepts terms.
- **PasswordResetRequestPage** — request a reset link via email.
- **PasswordResetConfirmPage** — set a new password using the link token.
- **AccountLockedPage** — shown after 5 failed login attempts.

## Conventions

- Use Supabase Auth for email-based flows; employees use a custom username/password path that maps to Supabase under the hood.
- Password requirements: minimum 8 characters, must include a number and a symbol.
- After successful login, redirect based on role:
  - Super Admin → `/super-admin/dashboard`
  - Client → `/client/dashboard`
  - Admin → `/admin/dashboard`
  - Employee → `/employee/dashboard`
- Session timeout after 15 minutes of inactivity.
