# context/

React Context providers that expose cross-cutting state to the component tree.

## Contexts

- **AuthContext** — current user (id, role, email/username), Supabase session, login/logout helpers, session timeout countdown.
- **TenantContext** — current tenant id, tenant name, plan (trial/paid), trial expiry, plan limits. For Super Admin, exposes the selected tenant when drilling into one.

## Conventions

- Providers wrap the app at the top of `App.jsx`.
- Components should read context via custom hooks (`useAuth`, `useTenant`) — never `useContext` directly in components.
- Never store sensitive data (raw tokens, full session objects) in localStorage; use Supabase's built-in secure storage instead.
