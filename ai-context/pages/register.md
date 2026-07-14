---
type: page
route: /register
file: src/app/register/page.tsx
feature: authentication
layoutChain: [src/app/layout.tsx]
auth: public
---

# Page: /register

## Purpose
New account/workspace signup form: full name, work email, phone, password + confirmation.

## Components used
`Card`, `Input`, `Label`, `Button` (shadcn/ui) + `react-hook-form`. Client-side validation: email regex, password min-length 8, password-confirmation match via `watch()`.

## Data/API calls
- `register(name, email, password, password_confirmation, phone)` from `src/lib/api.ts` — `POST /register`.

## Notable behavior
- **Bug**: `register()` in `api.ts` calls `setSession('your_auth_token')` — a literal placeholder string, not the real token from the response. See [features/authentication.md](../features/authentication.md) notes. This page still calls `router.push('/dashboard')` on success regardless, so it may rely on a separate mechanism (cookie session) or silently produce a broken client-side token.
- Uses `sonner` correctly (`toast.success`/`toast.error`), unlike the dashboard page.
- Links to `/signin` for existing users.
