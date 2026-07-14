---
type: feature
slug: system_admin
name: Super Admin Platform Control
status: active
roles: [Super Admin]
userTypes: [super_admin]
planFeatureKey: system_admin
routes: ["/admin", "/admin/payments"]
relatedDocs:
  pages: [admin-dashboard, admin-payments]
  components: []
  api: [admin]
  flows: [super-admin-governance]
---
# Feature: Super Admin Platform Control

## Summary
The master governance console for the whole LeadBajaar platform. `/admin` is a single-page, tab-based app (Companies, Users, Billing, Plans, Health, Meta Deletions, Announcements, Tester Requests) covering: global company/user CRUD, impersonation ("login as any user"), subscription renewal/history, platform-wide plan & capability editing, platform health metrics, Meta data-deletion request tracking, broadcast announcements, and beta tester approval. `/admin/payments` is a companion page for manual payment approvals, full billing history, coupons, and payment settings.

## Access control
- `/admin`: `RoleGuard allowedFeatures={['system_admin']}` (`src/app/(dashboard)/admin/page.tsx`).
- `/admin/payments`: `RoleGuard allowedTypes={['super_admin']} allowedFeatures={['system_admin']}` (`src/app/(dashboard)/admin/payments/page.tsx`) — stricter than the main admin page (also enforces `user_type`).
- Sidebar entries (`src/components/sidebar.tsx`): "Admin" (`/admin`, exact match) and "Payments" (`/admin/payments`) both restricted to `roles: ['Super Admin']`, `types: ['super_admin']`, `feature: 'system_admin'`.
- `hasFeature('system_admin')` is always `true` for role `Super Admin` regardless of plan (see `UserContext.tsx`), so this feature is effectively hard-gated by role/type rather than subscription plan.

## Key files
- Main console: `src/app/(dashboard)/admin/page.tsx` (~3260 lines; single client component with 8 tabs)
- Payments console: `src/app/(dashboard)/admin/payments/page.tsx` + page-local components `src/app/(dashboard)/admin/payments/components/CouponsTab.tsx` and `.../components/SettingsTab.tsx` (a page-colocated components folder, not under `src/components`)
- API: `adminApi` in `src/lib/api.ts` (line ~1642) — see `api/admin.md`
- Also uses `integrationApi.getDeletionRequests()` for the Meta Deletions tab (integration API is owned by another documentation cluster).
- Impersonation helper: `src/lib/auth.ts` (`setSession`)

## Notes
- Companies tab supports rich filtering (plan, status, tag, expiry window, custom date ranges) and inline edit of plan/status/dates/email-toggle via `adminApi.updateCompany`.
- Plans tab edits a "Smart JSON" `features` column on the backend: `{ display: [...feature toggles...], permissions: { featureId: [allowedRoles] } }`. `AVAILABLE_PLATFORM_FEATURES` in the page enumerates every plan-gatable feature id (including `agency_management`, `analytics`, `system_admin`, `email_logs`, `error_logs`, `finance_module`, `developer_tools`), confirming these features are plan-capability-configurable per role.
- A "Demo Data" toggle in the header switches the whole page to local mock data (`initialCompanies`, `demoStats`, etc.) without hitting the API — useful for screenshots/demos, not a real data mode.
- `/admin/payments` "Coupons" and "Settings" tabs are separate sub-components; endpoints for those live in `adminApi` under `getCoupons/createCoupon/updateCoupon/deleteCoupon` and `getSettings/updateSettings`.
- Team management, integrations, and other tenant-facing admin actions belong to other documentation clusters; only cross-referenced here.
