---
type: page
route: /reset-password
file: src/app/reset-password/page.tsx
feature: authentication
layoutChain: [src/app/layout.tsx]
auth: public
---

# Page: /reset-password

## Purpose
Sets a new password using a `token` + `email` pair supplied as query params (from the emailed reset link).

## Components used
`Card`, `Input`, `Label`, `Button` (shadcn/ui) + `react-hook-form`. Password-confirmation validated via `watch()`.

## Data/API calls
- `resetPassword(token, email, password, password_confirmation)` from `src/lib/api.ts` — `POST /reset-password`.

## Notable behavior
- Reads `token`/`email` from `useSearchParams()`; if either is missing, shows a `toast.error("Invalid reset link")` and redirects to `/signin` via a `useEffect`, then renders `null` before that (`if (!token || !email) return null`).
- On success, toasts and redirects to `/signin` (does not auto-login).
- Not wrapped in `<Suspense>` at the page level (unlike `setup-account`) despite using `useSearchParams()` — could trigger a Next.js build warning/error for missing Suspense boundary around `useSearchParams` in some Next 15 configurations; worth checking if this route has build issues.
