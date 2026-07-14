---
type: state
group: user-context
directory: src/contexts
usedByFeatures: [authentication, dashboard, account_settings, team_management]
---

# State: UserContext (`src/contexts/UserContext.tsx`)

## What it provides
`useUser()` returns `{ user, isLoading, hasRole, hasType, hasPlan, hasFeature }`.

- **`user: User | null`** — `{ id, name, email, avatar_url?, phone?, bio?, company_name?, role, user_type, company_id, notification_settings?, company?: { id?, name?, plan?, status?, type?, expires_at?, monthly_email_count?, plan_details?: { id, name, features: string[] } } }`.
- **`isLoading`** — true until the initial `getUser()` fetch resolves (or errors).
- **`hasRole(roles: UserRole[])`** — case/underscore-insensitive match against `user.role` (normalizes `'Super_Admin'`-style values by lowercasing and replacing `_` with space).
- **`hasType(types: UserType[])`** — exact membership check against `user.user_type`.
- **`hasPlan(plans: string[])`** — lowercase membership check against `user.company?.plan`; returns `false` if no company/plan.
- **`hasFeature(feature: string)`** — Super Admin always `true`. Otherwise reads `user.company?.plan_details?.features`:
  - **Structured format** (object with `.permissions: Record<featureKey, string[] | ['*']>`): looks up `permissions[feature]`, returns `true` if the user's normalized role is in that array or the array contains `'*'`.
  - **Legacy array format**: `features` is a flat `string[]` of enabled keys — simple `.includes(feature)`.
  - Returns `false` if neither shape matches or feature key isn't present.

## Who consumes it
- `Sidebar` (`canSee()` filtering — role/type/feature/plan gating of every nav item).
- `RoleGuard` (page-level access-control wrapper, redirects to `/unauthorized` or `/signin`).
- `SubscriptionGuard` (bypasses paywall for Super Admin/impersonation, reads `company.status`/`expires_at`).
- `dashboard/page.tsx`, `settings/page.tsx`, `team/page.tsx` (via `RoleGuard`, and directly for rendering user/company fields).

## Gotchas
- **`UserProvider` fetches `getUser()` exactly once on mount** — there is no manual refetch/invalidate function exposed. Any page that mutates the user or company (e.g. `settings/page.tsx` after a profile save or payment) must call `window.location.reload()` to see updated state reflected in the sidebar/header/context; there's no lighter-weight refresh path.
- **Critical rendering rule**: `user.company` is a full object, never a string. Rendering `{user.company}` directly as a React child crashes in production (React error #31, minification masks the message). Always drill into a field: `user.company?.name`, `user.company?.plan`, etc. All pages read in this cluster comply.
- `hasFeature` silently returns `false` for any feature key not present in `plan_details.features.permissions` — a missing/misconfigured plan on the backend will hide the corresponding UI entirely with no error surfaced to the user.
- Sidebar's own `plans` check additionally bypasses for `agency`/`super_admin` types regardless of `hasPlan()` — i.e. plan gating (`hasPlan`) only meaningfully restricts `individual` accounts. See `context/ai-context.md`'s three-dimensional access-control model.
- `UserContext`'s `User` interface and the one implied by `context/ai-context.md`'s "Critical Rule" section match closely but the doc's example omits several fields present in code (`avatar_url`, `phone`, `bio`, `company_name`, `notification_settings`, `monthly_email_count`) — treat the actual `UserContext.tsx` interface (reproduced above) as ground truth over the architecture doc's abbreviated example.
