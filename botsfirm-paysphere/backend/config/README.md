# config/

Centralized configuration loaders. Files here read from `process.env` once and export typed config objects used throughout the backend.

## Files

- **env.config.js** — loads, validates, and exports all environment variables. Fails fast on missing required keys.
- **database.config.js** — Supabase client and direct PostgreSQL pool configuration.
- **email.config.js** — Resend client setup, default sender, support address.
- **auth.config.js** — JWT secret, session timeout, lockout policy.
- **trial.config.js** — trial duration, limits, data retention.
- **statutory.config.js** — Botswana defaults (top marginal rate, SDL rate, minimum wage). Live brackets come from the DB.

## Conventions

- No `process.env.X` reads outside this folder.
- Config objects are frozen at load time so they can't be mutated at runtime.
- Sensitive values (service role key, JWT secret) never logged.
