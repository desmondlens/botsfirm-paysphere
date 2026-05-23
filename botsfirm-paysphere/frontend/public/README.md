# public/

Static assets served as-is by the React build system. Files here are copied verbatim into the production bundle root.

## Typical Contents

- `index.html` — root HTML document into which the React app is mounted.
- `favicon.ico` — browser tab icon.
- `robots.txt` — search engine crawling rules.
- `manifest.json` — PWA manifest.
- Any image, font, or file that must keep a stable URL.

Do not import files from `public/` in JS code — use `src/assets/` for those instead.
