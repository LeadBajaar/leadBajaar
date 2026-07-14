---
type: page
route: /settings
file: "src/app/(dashboard)/settings/page.tsx"
feature: account_settings
layoutChain: ["src/app/layout.tsx", "src/app/(dashboard)/layout.tsx"]
auth: protected
---

# Page: /settings

## Purpose
Tabbed account settings screen with four sections: Profile (name/company/phone/bio/avatar), Notifications (email/push toggles per event type), Security (password/2FA — mostly static), Billing (current plan, custom Razorpay payment with coupon codes, monthly email usage bar).

## Components used
`Card`, `Label`, `Input`, `Button`, `Switch`, `Select`, `Separator`, `Textarea`, `Avatar`, `Badge` (shadcn/ui), `RoleGuard` (`src/components/RoleGuard.tsx`).

## Data/API calls
- `api.put('/users/:id')` — save profile fields and `notification_settings`.
- `api.post('/storage/r2/upload-image')` / `api.delete('/storage/r2/delete')` — avatar upload/replace.
- `subscriptionApi.getSettings()` — `GET /subscription/settings` — fetches `min_payment_amount`.
- `api.post('/subscription/validate-coupon')`, `api.post('/subscription/create-order')`, `api.post('/subscription/verify')` — called directly via the raw `api` client, bypassing `subscriptionApi`.
- `useUser()` — reads `user` and all `user.company.*` billing fields.

## Notable behavior
- Wrapped in `<RoleGuard allowedFeatures={['account_settings']}>` — redirects to `/unauthorized` if the feature flag isn't present for the user's plan/role.
- Avatar upload flow: uploads new file to R2 first, then best-effort deletes the old avatar (failure to delete old file is swallowed/non-blocking), then PUTs the new `avatar_url` onto the user record.
- Profile save and payment verification both call `window.location.reload()` on success instead of refreshing React state — `UserContext` has no manual refetch method, so a full reload is the only way to see updated `user` data reflected across the app (sidebar, header, etc.).
- Coupon state (`appliedCoupon`) auto-clears whenever `paymentAmount` changes (a `useEffect` watches `paymentAmount`), forcing re-application — prevents stale discounts on a changed base amount.
- Razorpay checkout script is loaded on demand (`https://checkout.razorpay.com/v1/checkout.js`) if not already present on `window`.
- Security tab buttons ("Change" password, "Enable Now" 2FA) have no click handlers — placeholder UI only.
- Billing progress bar and quota text hard-code plan-tier email limits (free/pro/enterprise/agency) client-side.
