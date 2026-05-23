# components/common/

Reusable, presentational UI primitives that have no business logic and no awareness of the current user or tenant.

## What goes here

- **Button** — primary, secondary, danger, ghost variants.
- **Input** — text, number, currency (BWP), date.
- **Select / Dropdown**
- **Modal / Dialog**
- **Table** — paginated, sortable, with empty state and loading skeleton.
- **Card** — clean white card with soft shadow.
- **Badge / Tag** — for statuses (Active, Trial, Expired, etc.).
- **Toast / Alert** — success, warning, error, info.
- **Spinner / Skeleton** — loading indicators.

## Conventions

- Components are pure: state comes in through props, events bubble out via callbacks.
- Follow the design system: primary `#2B6CB0`, soft shadows, Inter font.
- No `useEffect` calls to fetch data here — keep that in `pages/` or `hooks/`.
