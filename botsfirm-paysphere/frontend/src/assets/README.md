# assets/

Static visual assets imported directly into React components. Webpack hashes and bundles these files at build time.

## What lives here

- **Logo** — Botsfirm PaySphere wordmark and icon variants.
- **Images** — illustrations used on the landing page and empty states.
- **Icons** — SVG icon set used across the app (if not using an icon font).
- **Fonts** — locally hosted Inter font files, if not loaded from a CDN.

## Conventions

- Prefer SVG for icons and logos so they scale crisply.
- Use lower-kebab-case filenames: `logo-mark.svg`, `hero-illustration.png`.
- Group by type (`assets/icons/`, `assets/images/`) once the set grows.
