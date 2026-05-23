# Botsfirm PaySphere

A professional, full-stack SaaS payroll management platform built specifically for businesses operating in Botswana. PaySphere automates payroll processing, statutory compliance, leave management, and employee record keeping in accordance with the Botswana Unified Revenue Service (BURS) and the Employment Act.

---

## Overview

Botsfirm PaySphere is a multi-tenant payroll system that allows multiple companies (tenants) to operate independently on the same platform with full data isolation. It supports four distinct user roles, a free trial flow, and end-to-end statutory reporting for Botswana.

## Key Features

- **BURS Compliance** — PAYE calculation engine using the 2025/2026 monthly tax brackets, ITW-7 (monthly), ITW-10 (annual), and ITW-8 (per employee) reports.
- **Employment Act Compliance** — Automatic leave accruals, severance calculations, overtime rules, and minimum wage validation.
- **Multi-Tenant Architecture** — Full tenant data isolation enforced at the database level via Supabase Row Level Security.
- **Four-Tier Role System** — Super Admin, Client (tenant owner), Admin, and Employee, each with scoped permissions.
- **Self-Service Trial** — 7-day free trial with real-email signup, capped at 5 employees and 1 payroll run.
- **Automated Email Notifications** — Trial reminders, payslip delivery, leave approvals, invite codes.
- **Payslip PDFs** — Branded payslips generated with PDFKit.
- **Excel & QuickBooks Exports** — Payroll registers, journal entries, BURS submission files.
- **Comprehensive Audit Log** — Every action recorded, permanent and tamper-evident.

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Frontend         | React.js                            |
| Backend          | Node.js + Express                   |
| Database         | PostgreSQL via Supabase             |
| Authentication   | Supabase Auth                       |
| PDF Generation   | PDFKit                              |
| Excel Export     | ExcelJS                             |
| Email Delivery   | Resend                              |
| Frontend Hosting | Vercel                              |
| Backend Hosting  | Railway                             |

## User Roles

| Role        | Scope                                                                 |
|-------------|-----------------------------------------------------------------------|
| Super Admin | Sees all tenants, manages clients, trials, and platform-wide audits.  |
| Client      | Tenant owner. Sees only their company data. Manages admins.           |
| Admin       | Limited per-tenant access. Manages employees, payroll, and leave.     |
| Employee    | Sees only their own payslips and leave. Logs in via username only.    |

## Trial System

- 7-day free trial with self-service signup using a real email address.
- Capped at **5 employees** and **1 payroll run**.
- PDF generation, QuickBooks export, and BURS reports are locked during trial.
- Reminder emails sent on **day 1, 3, 6, 7, and 8** of the trial.
- Trial data preserved for **30 days** after expiry.
- Super Admin can convert any trial to a paid plan with all data carrying over.

## Botswana Statutory Reference (2025/2026)

- **Citizens** — Tax-free threshold of BWP 4,000/month.
- **Non-citizens** — Taxed from the first pula at 5%.
- **Top marginal rate** — 26.5%.
- **SDL** — 0.2% of turnover for companies above BWP 1,000,000.
- **Annual leave** — 15 days; 8 must be taken in the first 6 months; rolls over up to 3 years.
- **Sick leave** — 20 days.
- **Maternity leave** — 12 weeks at 50% pay.
- **Paternity leave** — 5 days at full pay.
- **Family responsibility** — 3 days.
- **Overtime** — 150% of salary, capped at 14 hours per week.
- **Minimum wage** — BWP 9.06 per hour.
- **Severance** — 1 day per month for first 60 months; 2 days per month beyond.
- **Record retention** — 5 years.
- **e-TAX registration** — New employees must be registered within 24 hours.

## Design System

| Token          | Value      | Notes                  |
|----------------|------------|------------------------|
| Primary        | `#2B6CB0`  | Calm steel blue        |
| Secondary      | `#FFFFFF`  | White                  |
| Background     | `#F7FAFC`  | Very light grey        |
| Text           | `#2D3748`  | Dark charcoal          |
| Success        | `#38A169`  | Soft green             |
| Warning        | `#D69E2E`  | Soft amber             |
| Error          | `#E53E3E`  | Soft red               |
| Border         | `#E2E8F0`  | Light grey             |
| Font           | Inter      | —                      |

No dark backgrounds, no gradients, no flashy colors. Clean cards with soft shadows. Simple sidebar navigation.

## Security

- Tenant ID enforced on every table; full data isolation.
- Supabase Row Level Security on all tables.
- Permanent audit log — cannot be deleted by anyone.
- Session timeout after 15 minutes of inactivity.
- Account lockout after 5 failed login attempts.
- Password minimum 8 characters, must include a number and a symbol.
- All sensitive data encrypted at rest and in transit.
- HTTPS only.

## Project Structure

```
botsfirm-paysphere/
├── frontend/      React.js SPA
├── backend/       Node.js + Express API
├── database/      SQL schema, RLS policies, seed data, migrations
└── shared/        Cross-cutting constants and types
```

See each subfolder's `README.md` for details.

## Getting Started

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies in `frontend/` and `backend/`.
3. Apply `database/schema.sql` and `database/rls-policies.sql` to your Supabase project.
4. Start the backend (`npm run dev` in `backend/`) and frontend (`npm start` in `frontend/`).

## License

Proprietary — Botsfirm. All rights reserved.
