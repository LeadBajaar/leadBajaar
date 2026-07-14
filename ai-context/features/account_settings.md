---
type: feature
slug: account_settings
name: Account Settings
status: active
roles: [Super Admin, Admin, Manager, Agent]
userTypes: []
planFeatureKey: account_settings
routes: ["/settings"]
relatedDocs:
  pages: [pages/settings.md]
  components: [components/ui-primitives.md]
  api: [api/company.md, api/subscription.md]
  flows: []
---

# Feature: Account Settings

## Summary
Single-page, tab-based settings screen (Profile, Notifications, Security, Billing) for the logged-in user. Lets a user edit their profile (name, company, phone, bio, avatar upload to R2), toggle per-category notification preferences, view password/2FA status (largely static/placeholder), and view/pay for their subscription plan via Razorpay with optional coupon codes.

## Access control
Wrapped in `<RoleGuard allowedFeatures={['account_settings']}>` (see `src/components/RoleGuard.tsx`). Sidebar entry: all four roles, no `types`/`plans` restriction, `feature: 'account_settings'`. `hasFeature()` in `UserContext` grants Super Admins all features unconditionally; for other roles it checks `user.company.plan_details.features.permissions['account_settings']`. Since every sidebar role list includes this feature and it's core account management, it's effectively available to all authenticated users whose plan config includes it (which in practice is universal).

## Key files
- `src/app/(dashboard)/settings/page.tsx` — all four tabs implemented in one file (~750 lines), no sub-routing.
- `src/lib/api.ts` — `api.put('/users/:id')` (profile + notification_settings save), `api.post('/storage/r2/upload-image')` / `api.delete('/storage/r2/delete')` (avatar), `subscriptionApi.getSettings()` (min payment amount), `api.post('/subscription/validate-coupon')`, `api.post('/subscription/create-order')`, `api.post('/subscription/verify')`.
- `src/contexts/UserContext.tsx` — source of `user.company.plan`, `user.company.status`, `user.company.expires_at`, `user.company.monthly_email_count` rendered in the Billing tab.

## Notes
- **API inconsistency**: the page calls `api.post('/subscription/validate-coupon', ...)`, `/subscription/create-order`, and `/subscription/verify` directly via the raw `api` axios instance instead of going through `subscriptionApi` (which only exposes `getSettings` and `validateCoupon`, and even `subscriptionApi.validateCoupon` is unused — the page duplicates that logic inline). See [api/subscription.md](../api/subscription.md).
- Payment flow loads the Razorpay checkout script dynamically (`https://checkout.razorpay.com/v1/checkout.js`) only if `window.Razorpay` isn't already present — no cleanup/removal of the injected `<script>` tag.
- After successful profile save or payment verification, the page does `window.location.reload()` rather than refreshing `UserContext` state — a full reload is the only way stale `user` data gets updated, since `UserContext` only fetches once on mount.
- Security tab (password change, 2FA) is **placeholder/static** — buttons ("Change", "Enable Now") have no `onClick` handlers wired to any API call.
- Billing tab hard-codes plan email quota display logic (free=100, pro=5000, enterprise=50000, agency=unlimited) client-side; if plan tiers change, this needs a matching update here.
- Correctly uses `user.company?.plan` / `?.name` / `?.status` etc. (never renders the raw object) — consistent with the critical company-rendering rule.
