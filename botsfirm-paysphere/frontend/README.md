# Frontend — Botsfirm PaySphere

React.js single-page application. Hosted on Vercel.

## Purpose

Delivers the entire user-facing experience: landing pages, trial signup, authentication, and the four role-based dashboards (Super Admin, Client, Admin, Employee).

## Structure

```
frontend/
├── public/        Static assets served as-is (index.html, favicon, robots.txt)
└── src/
    ├── assets/      Logo, images, icons
    ├── components/  Reusable UI building blocks
    │   ├── common/    Buttons, inputs, modals, tables
    │   ├── layout/    Navbar, sidebar, footer
    │   └── charts/    Dashboard charts
    ├── pages/       Route-level screens, grouped by role
    │   ├── landing/     Public marketing pages, demo calculator, pricing
    │   ├── auth/        Login, invite redemption, trial signup, password reset
    │   ├── super-admin/ Platform owner views
    │   ├── client/      Tenant owner views
    │   ├── admin/       Tenant admin views
    │   └── employee/    Employee self-service views
    ├── context/     React contexts (auth, tenant)
    ├── hooks/       Custom React hooks
    ├── services/    HTTP client and API call wrappers
    ├── utils/       Helpers, formatters, validators
    └── styles/      Global styles, theme tokens, colors
```

## Design Tokens

- Primary `#2B6CB0`, Background `#F7FAFC`, Text `#2D3748`
- Success `#38A169`, Warning `#D69E2E`, Error `#E53E3E`
- Border `#E2E8F0`, Font `Inter`
- Clean cards with soft shadows, simple sidebar navigation
- No dark backgrounds, no gradients

## Required Environment Variables

```
REACT_APP_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY
REACT_APP_API_URL
REACT_APP_APP_NAME
```

## Deployment

Deployed to Vercel. The build output (`build/`) is uploaded automatically on push to the main branch.
