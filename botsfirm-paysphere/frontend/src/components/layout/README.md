# components/layout/

App-shell components — the frame around every authenticated page.

## What goes here

- **Navbar** — top bar with company name, current user, and account menu.
- **Sidebar** — primary navigation, varies by user role (Super Admin, Client, Admin, Employee).
- **Footer** — minimal footer with version, support link, legal links.
- **PageHeader** — consistent page title + breadcrumb + actions strip.
- **AppLayout** — wraps `Navbar + Sidebar + main content area`.
- **AuthLayout** — minimal layout for the login/signup screens.

## Conventions

- Sidebar items are driven by the current role from `AuthContext`.
- Active route highlighting uses `react-router`'s `NavLink`.
- Simple, calm styling — no gradients, no flashy hover states.
