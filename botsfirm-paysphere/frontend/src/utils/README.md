# utils/

Pure helper functions. No React, no side effects, no global state.

## Examples

- **formatters.js** — currency formatting (BWP), date formatting (DD/MM/YYYY), name casing, ID number masking.
- **validators.js** — client-side validation: Omang/passport format, email, phone, banking details, password strength.
- **helpers.js** — small utilities: array grouping, object pick/omit, sleep, range.
- **calculations.js** — read-only client-side previews of PAYE/SDL (real values still come from the backend).
- **csv.js** — client-side CSV download builders.

## Conventions

- Every util must be unit-testable in isolation.
- Functions are stateless and side-effect-free.
- Currency helpers always render BWP with two decimals and a thousands separator.
