---
type: api
group: subscription
sourceFile: src/lib/api.ts
usedByFeatures: [account_settings]
---

# API: subscription

`subscriptionApi` object, defined at `src/lib/api.ts:2187`.

| Function | HTTP | Params | Purpose | Line ref |
|---|---|---|---|---|
| `getSettings` | `GET /subscription/settings` | none | Returns global subscription settings; `settings/page.tsx` reads `min_payment_amount` from it to seed the custom-payment input and validate the minimum. | `src/lib/api.ts:2188` |
| `validateCoupon` | `POST /subscription/validate-coupon` | `couponCode: string` | Validates a coupon code against the (implicit) amount server-side. **Defined but unused** — `settings/page.tsx` duplicates this call inline via the raw `api` client instead (see below). | `src/lib/api.ts:2197` |

## Related calls made directly via the raw `api` client (bypassing this group)
These are used by `settings/page.tsx`'s Billing tab but are **not** wrapped in `subscriptionApi`:

| Call | HTTP | Params | Purpose |
|---|---|---|---|
| `api.post('/subscription/validate-coupon', ...)` | `POST /subscription/validate-coupon` | `{ coupon_code, amount }` | Duplicate of `subscriptionApi.validateCoupon` but also passes `amount`; returns `{ success, discount, final_amount }`. |
| `api.post('/subscription/create-order', ...)` | `POST /subscription/create-order` | `{ amount, coupon_code }` | Creates a Razorpay order; returns `{ success, order_id, amount, currency }`. |
| `api.post('/subscription/verify', ...)` | `POST /subscription/verify` | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, coupon_code }` | Verifies a completed Razorpay payment and activates/renews the plan. |

## Notes
- Recommend consolidating the three raw `api.post('/subscription/...')` calls above into `subscriptionApi` for consistency, and either wiring up the existing `subscriptionApi.validateCoupon` or removing it as dead code — currently both a wrapped and an inline version of "validate coupon" exist with slightly different signatures (`(couponCode)` vs `({coupon_code, amount})`).
- No client-side function exists for fetching invoice/payment history in this group — the Billing tab only supports paying, not viewing past transactions.
