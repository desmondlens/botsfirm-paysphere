# utils/

Pure, side-effect-free helpers and statutory reference data. Imported by services.

## Files

- **taxBrackets.js** — Botswana PAYE monthly brackets for 2025/2026, citizen and non-citizen sets.
- **leaveEntitlements.js** — Employment Act leave constants and accrual rules.
- **severanceCalculator.js** — Pure severance math (1 day/month first 60 months, 2 days/month beyond).
- **validators.js** — Schema validators: Omang/passport, BWP amounts, dates, e-TAX number, bank details.
- **helpers.js** — Small utilities: date math, BWP rounding, currency formatting, pay-period calculations.

## Conventions

- These modules have **no side effects**, no database calls, no I/O.
- Statutory numbers live here in one place — services import from these constants rather than hard-coding values.
- When tax law changes for a new tax year, only `taxBrackets.js` should need editing.
