---
type: page
route: /signin
file: src/app/signin/page.tsx
feature: authentication
layoutChain: [src/app/layout.tsx]
auth: public
---

# Page: /signin

## Purpose
Email/password login form. On success, redirects to `/dashboard`.

## Components used
`Card`, `Input`, `Label`, `Button`, `Checkbox` (shadcn/ui) + `react-hook-form` for validation. No custom shared components.

## Data/API calls
- `login(email, password)` from `src/lib/api.ts` — `POST /login`, stores token via `setSession()`.

## Notable behavior
- "Stay signed in" checkbox persists raw `{email, password}` JSON to `localStorage.rememberedCredentials` and auto-fills the form on next visit (via `useEffect` + `setValue`) — plaintext password in localStorage is a notable security consideration.
- Server-side field errors (`error.errors`) are mapped back onto individual react-hook-form fields via `setError(key, ...)`; generic errors go to a `root` form error banner.
- On error, clears the password field but leaves email populated.
- Does not reset `isLoading` on success — intentionally left spinning through the `router.push('/dashboard')` redirect.
- Links to `/forgot-password` and `/register`.
