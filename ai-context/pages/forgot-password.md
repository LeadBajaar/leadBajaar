---
type: page
route: /forgot-password
file: src/app/forgot-password/page.tsx
feature: authentication
layoutChain: [src/app/layout.tsx]
auth: public
---

# Page: /forgot-password

## Purpose
Collects an email address and requests a password-reset link be emailed.

## Components used
`Card`, `Input`, `Label`, `Button` (shadcn/ui) + `react-hook-form`.

## Data/API calls
- `forgotPassword(email)` from `src/lib/api.ts` — `POST /forgot-password`.

## Notable behavior
- Two-state UI: form view, then a success view (`isSuccess`) with a "Back to Login" button — no separate route/page for confirmation.
- API errors are shown in a dedicated inline `AlertCircle` banner (`apiError` state), separate from `react-hook-form` field errors.
- Links to `/signin`.
