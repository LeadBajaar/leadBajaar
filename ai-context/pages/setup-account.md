---
type: page
route: /setup-account
file: src/app/setup-account/page.tsx
feature: authentication
layoutChain: [src/app/layout.tsx]
auth: public
---

# Page: /setup-account

## Purpose
Account-activation page for an invited team member. Reads `token`, `company` (display name), and `email` (display only) from query params, and lets the invitee set their full name and password to activate the account.

## Components used
`Card`, `Input`, `Label`, `Button` (shadcn/ui) + `react-hook-form`. Wrapped in `<Suspense>` (required for `useSearchParams()` in the App Router) with a spinner fallback.

## Data/API calls
- `teamApi.setupAccount({ token, name, password, password_confirmation })` from `src/lib/api.ts` — `POST /setup-account`. See [api/team.md](../api/team.md).

## Notable behavior
- On success, calls `setSession(response.token)` directly (logs the user in immediately) then shows a 3-second animated success screen before `router.push('/dashboard')`.
- Unlike `reset-password`, does **not** guard/redirect when `token` is missing — it just shows the form with a fallback company name (`'LeadBajaar'`) and `invitedEmail` (`'your account'`); submission will fail server-side with a toast if `token` is falsy (checked inside `onSubmit`).
- This is the terminal step of the team-invite flow started in [features/team_management.md](../features/team_management.md) — see [flows/authentication-and-onboarding.md](../flows/authentication-and-onboarding.md).
