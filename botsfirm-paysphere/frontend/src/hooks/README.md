# hooks/

Custom React hooks that encapsulate reusable behavior.

## Examples

- **useAuth** — read AuthContext.
- **useTenant** — read TenantContext.
- **useApi** — wraps fetch with auth headers, tenant headers, error handling, and loading state.
- **usePagination** — table pagination state.
- **useDebounce** — debounce search inputs.
- **useIdleTimeout** — triggers logout after 15 minutes of inactivity.
- **useTrialLock** — returns true if the current tenant is on a trial and a given feature is locked.
- **usePermission** — checks if the current user can perform a given action.

## Conventions

- One hook per file. Filename matches the hook name.
- Hooks must follow the React rules — called at top level, not inside loops or conditions.
- Side effects (network, storage) live here, not in presentational components.
