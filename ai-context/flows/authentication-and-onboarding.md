---
type: flow
slug: authentication-and-onboarding
featuresInvolved: [authentication, team_management, dashboard]
---

# Flow: Authentication & Onboarding

## A. New workspace signup
1. User visits [`/register`](../pages/register.md) and submits name/email/phone/password.
2. `register()` (`src/lib/api.ts:143`) calls `POST /register`. **Known bug**: it stores `localStorage.token = 'your_auth_token'` (a literal string) instead of the token returned by the server — see [api/auth.md](../api/auth.md).
3. On success, `toast.success(...)` and `router.push('/dashboard')`.
4. `(dashboard)/layout.tsx` mounts `UserProvider`, which calls `getUser()` (`GET /user`) using whatever bearer token is in `localStorage.token`. If step 2's bug means the token is invalid, this fetch will 401, triggering the axios interceptor in `src/lib/api.ts` to `clearSession()` and redirect back to `/signin` — i.e. the bug potentially causes an immediate bounce-back after registration. Verify against live backend behavior before treating this as confirmed-broken.

## B. Standard login
1. User visits [`/signin`](../pages/signin.md), submits email/password (optionally checking "Stay signed in", which persists plaintext credentials to `localStorage.rememberedCredentials`).
2. `login()` (`src/lib/api.ts:116`) calls `POST /login`, extracts `token`/`access_token`, calls `setSession(token)` (`src/lib/auth.ts` → `localStorage.token`).
3. `router.push('/dashboard')`.
4. `(dashboard)/layout.tsx` → `UserProvider` fetches `GET /user`, populating `useUser()` with `role`, `user_type`, `company` (incl. `plan_details.features`). See [state/user-context.md](../state/user-context.md).
5. `SubscriptionGuard` checks `user.company.status`/`expires_at`; if expired/suspended (and not Super Admin / not impersonating), blocks the whole app behind a renewal paywall except `/settings`. See [pages/app-shell-layout.md](../pages/app-shell-layout.md).
6. `Sidebar` filters nav items via `canSee()` using `hasRole`/`hasType`/`hasFeature`/`hasPlan` from `useUser()`.

## C. Forgot / reset password
1. User visits [`/forgot-password`](../pages/forgot-password.md), submits email → `forgotPassword(email)` → `POST /forgot-password`. Success view replaces the form with a "check your email" message.
2. User clicks the emailed link → lands on [`/reset-password`](../pages/reset-password.md)`?token=...&email=...`.
3. If `token`/`email` missing, toasts "Invalid reset link" and redirects to `/signin`.
4. Submits new password + confirmation → `resetPassword(token, email, password, password_confirmation)` → `POST /reset-password`.
5. On success, toasts and redirects to `/signin` (user must log in again manually — no auto-session).

## D. Team invite acceptance (onboarding a new team member)
1. An Admin/Super Admin on [`/team`](../pages/team.md) invites a member: `teamApi.inviteMember({ email, role })` → `POST /team/invite`. Backend emails an invite link containing a token.
2. Invitee clicks the link → lands on [`/setup-account`](../pages/setup-account.md)`?token=...&company=...&email=...` (company/email are display-only, read from query params, not re-validated client-side).
3. Invitee enters full name + password → `teamApi.setupAccount({ token, name, password, password_confirmation })` → `POST /setup-account`.
4. On success, the response's `token` is used immediately: `setSession(response.token)` — the invitee is logged in without a separate `/signin` step.
5. A 3-second success animation plays, then `router.push('/dashboard')`.
6. From here, flow rejoins step 4–6 of "Standard login" above (UserProvider fetch, SubscriptionGuard check, Sidebar filtering) — the new member's `role` (Admin/Manager/Agent) now drives what they see.

## E. Logout
1. User clicks Logout in the `Sidebar` footer → `handleLogout()` calls `logout()` (`POST /logout`), then `clearSession()`, then explicitly `localStorage.removeItem('admin_token')` (in case mid-impersonation), then `router.push('/signin')`.
