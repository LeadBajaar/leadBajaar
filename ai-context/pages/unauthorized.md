---
type: page
route: /unauthorized
file: src/app/(dashboard)/unauthorized/page.tsx
feature: authentication
layoutChain: [src/app/layout.tsx, "src/app/(dashboard)/layout.tsx"]
auth: protected
---

# Page: /unauthorized

## Purpose
Static "Access Restricted" message shown when `RoleGuard` (or `SubscriptionGuard`) rejects a user's access to a route. Provides a single "Return to Dashboard" button.

## Components used
`Button` (shadcn/ui), `Lock`/`ArrowLeft` icons (lucide-react). No data fetching.

## Data/API calls
None.

## Notable behavior
- This is the default `fallbackPath` for `src/components/RoleGuard.tsx` (see `src/components/RoleGuard.tsx` line 23: `fallbackPath = '/unauthorized'`) — any page wrapped in `<RoleGuard>` that fails its role/type/plan/feature check redirects here client-side.
- Renders inside the full dashboard shell (sidebar + header still visible) since it lives under the `(dashboard)` route group — it is not a bare/standalone error page.
- Purely presentational; no props, no state besides the router instance.
