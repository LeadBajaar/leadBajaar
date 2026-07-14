---
type: flow
slug: impersonation
featuresInvolved: [authentication, dashboard]
---

# Flow: Impersonation (Login-As)

Two independent impersonation entry points exist, both converging on the same `localStorage` mechanic and the same `Sidebar` exit banner.

## Entry point 1 — Super Admin impersonating any user
1. On `/admin` (Super Admin governance page, outside this cluster's scope but the trigger lives there — `src/app/(dashboard)/admin/page.tsx:943`, `handleImpersonate(userId)`).
2. Current admin token is saved: `localStorage.setItem('admin_token', localStorage.getItem('token'))`.
3. Calls `adminApi.loginAsAnyUser(userId)` → `POST /admin/users/:id/login` → returns `{ token }` for the target user.
4. `setSession(token)` overwrites `localStorage.token` with the impersonated user's token.
5. `window.location.href = '/dashboard'` — a hard navigation (not `router.push`) forces a full app reload so `UserProvider` refetches `GET /user` under the new identity from scratch.

## Entry point 2 — Agency impersonating a client
1. On `/agency` (Agency client-management page, outside this cluster's scope — `src/app/(dashboard)/agency/page.tsx:111`, `handleOpenPanel(clientId)`).
2. Same pattern: save current token to `admin_token`, call `agencyApi.loginAsClient(clientId)` → `POST /agency/clients/:id/login` → `{ token }`.
3. `setSession(token)`, then hard navigate to `/dashboard`.

## Detection & exit (shared, lives in this cluster)
1. `Sidebar` (`src/components/sidebar.tsx`) checks `localStorage.getItem('admin_token')` on mount → sets `isAdminImpersonating`.
2. If true, renders a "Return to Admin" button above the main nav list (amber-colored, `ti-corner-up-left` icon).
3. `handleReturnToAdmin()` (`src/components/sidebar.tsx:155`): reads `admin_token`, calls `setSession(adminToken)` (restoring the original admin's token as the active `token`), removes `admin_token`, then hard-navigates to `/dashboard` — **not** `/agency` (contrary to `context/ai-context.md`'s documented behavior of redirecting to `/agency`; verify which is authoritative if this matters — the code, read directly, always goes to `/dashboard`).
4. `SubscriptionGuard` (`src/components/SubscriptionGuard.tsx:19-29`) also checks `admin_token` presence directly (`isAdminBypass`) and bypasses the expired/suspended paywall entirely whenever it's set, in addition to bypassing for actual Super Admin role/type — so an agency mid-impersonation-of-a-client is never blocked by that client's subscription status either.

## Key files
- `src/components/sidebar.tsx` — detection state, exit banner, `handleReturnToAdmin`.
- `src/components/SubscriptionGuard.tsx` — bypass check.
- `src/lib/auth.ts` — `setSession`/`clearSession` (plain localStorage wrappers, no impersonation-specific logic here).
- `adminApi.loginAsAnyUser` / `agencyApi.loginAsClient` in `src/lib/api.ts` (lines ~1786, ~1977) — out of this cluster's read scope beyond confirming the call shape, since `adminApi`/`agencyApi` as a whole belong to the Admin/Agency feature clusters.

## Notes
- There is no server-side signal distinguishing "Super Admin impersonating" from "Agency impersonating a client" on the frontend — both use the identical `admin_token` key. If both nested (Super Admin impersonates an agency, which itself impersonates a client), the single `admin_token` slot would be overwritten and the outer session lost — not handled/guarded against in the code.
- `logout()` from the `Sidebar` also clears `admin_token` defensively, so logging out mid-impersonation fully clears both identities rather than just returning to the admin.
