---
type: feature
slug: authentication
name: Authentication & Onboarding
status: active
roles: [Super Admin, Admin, Manager, Agent]
userTypes: []
planFeatureKey: null
routes: ["/signin", "/register", "/forgot-password", "/reset-password", "/setup-account"]
relatedDocs:
  pages: [pages/signin.md, pages/register.md, pages/forgot-password.md, pages/reset-password.md, pages/setup-account.md]
  components: []
  api: [api/auth.md, api/team.md]
  flows: [flows/authentication-and-onboarding.md]
---

# Feature: Authentication & Onboarding

## Summary
Public (unauthenticated) pages that let a user create a workspace (register), sign in, recover a forgotten password, and let an invited team member activate their account via a tokenized invite link (setup-account). All pages are outside the `(dashboard)` route group and render under the root layout only (no sidebar/header).

## Access control
None — these routes are intentionally public. There is no `RoleGuard`/`SubscriptionGuard` wrapping any of them. Session state is stored client-side only via `localStorage` (`token`, and `admin_token` for impersonation) — see [state/user-context.md](../state/user-context.md). Once a token is set, `(dashboard)/layout.tsx` mounts `UserProvider`, which fetches `/api/user` and populates role/type/plan for every protected route.

## Key files
- `src/app/signin/page.tsx` — email/password login form, "remember me" (persists raw credentials in localStorage), forgot-password link.
- `src/app/register/page.tsx` — new workspace/account signup form (name, email, phone, password).
- `src/app/forgot-password/page.tsx` — request a reset-link email.
- `src/app/reset-password/page.tsx` — consumes `?token=&email=` query params to set a new password.
- `src/app/setup-account/page.tsx` — consumes `?token=&company=&email=` from a team invite email; sets the member's name/password and activates the account.
- `src/lib/api.ts` — `login`, `register`, `forgotPassword`, `resetPassword`, `loginWithGoogle`, `teamApi.setupAccount`.
- `src/lib/auth.ts` — `setSession`/`clearSession`/`getSession` (localStorage token helpers), NextAuth config for Google OAuth (`authOptions`).

## Notes
- **Bug**: `register()` in `src/lib/api.ts` (line ~152) calls `setSession('your_auth_token')` — a hard-coded literal string, not the actual token from the API response. This means after registering, the stored "token" is bogus; the subsequent `router.push('/dashboard')` in `register/page.tsx` likely relies on the backend also setting a cookie session, or this is a latent bug that breaks token-based auth immediately after signup. Compare with `login()`, which correctly extracts `response.data.token || response.data.access_token`.
- `loginWithGoogle(token)` and the NextAuth Google provider (`src/lib/auth.ts`) exist but no sign-in page wires them up — no "Sign in with Google" button was found on `signin/page.tsx`. Likely unused/incomplete integration.
- Password reset and setup-account both guard against missing query params by redirecting to `/signin` (reset-password) client-side after mount.
- `setup-account` uses `teamApi.setupAccount` (see [api/team.md](../api/team.md)) rather than a dedicated auth endpoint — it's the acceptance step of the [team invite flow](../features/team_management.md).
