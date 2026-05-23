# styles/

Global styles, design tokens, and theme configuration.

## Files

- **globals.css** — CSS reset, base typography, body background `#F7FAFC`, default text color `#2D3748`.
- **theme.js** — design tokens exposed to JS (colors, spacing, radius, shadows, font sizes).
- **colors.js** — single source of truth for color tokens.
- **typography.css** — Inter font import and type scale.

## Design Tokens

| Token       | Value      |
|-------------|------------|
| Primary     | `#2B6CB0`  |
| Secondary   | `#FFFFFF`  |
| Background  | `#F7FAFC`  |
| Text        | `#2D3748`  |
| Success     | `#38A169`  |
| Warning     | `#D69E2E`  |
| Error       | `#E53E3E`  |
| Border      | `#E2E8F0`  |

## Rules

- No dark backgrounds.
- No gradients.
- No flashy or saturated colors outside the token set above.
- Cards use a soft shadow: `0 1px 2px rgba(45, 55, 72, 0.04), 0 1px 3px rgba(45, 55, 72, 0.06)`.
- Border radius standard: `8px` for cards and inputs.
- Sidebar is always light background with simple text links — no icon-only collapse modes.
