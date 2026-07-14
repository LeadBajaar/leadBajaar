---
type: feature
slug: analytics
name: Workspace Analytics
status: active
roles: [Super Admin, Admin, Manager]
userTypes: [agency, super_admin, individual]
planFeatureKey: analytics
routes: ["/analytics"]
relatedDocs:
  pages: [analytics]
  components: []
  api: [dashboard-analytics]
  flows: []
---
# Feature: Workspace Analytics

## Summary
Aggregated, company-wide performance dashboard: lead volume, conversion rate, revenue trend, lead-source mix, pipeline-stage funnel, weekly activity (calls/emails/meetings), deal-value distribution, and a top-performers leaderboard. All charts are Recharts components fed by a single backend payload.

## Access control
- Page wrapped in `RoleGuard allowedFeatures={['analytics']}` only — no `allowedRoles`/`allowedTypes` prop, so any authenticated user whose plan/role grants the `analytics` feature key can view it (Super Admin/Agency bypass, individual users depend on plan).
- Sidebar entry "Analytics" (`src/components/sidebar.tsx` line ~44): `roles: ['Super Admin','Admin','Manager']`, `types: ['agency','super_admin','individual']`, `feature: 'analytics'`. Per `context/ai-context.md`, individual accounts normally need Enterprise plan (or Agency/Super Admin bypass) to see this link.

## Key files
- Page: `src/app/(dashboard)/analytics/page.tsx`
- API: `getAnalyticsData()` in `src/lib/api.ts` (line ~2023) — see `api/dashboard-analytics.md`
- No dedicated `components/analytics` folder — page defines local `StatCard`, `LeadsTooltip`, `RevenueTooltip` helper components inline and otherwise uses `src/components/ui/*` (Card, Badge) plus `recharts` primitives directly.

## Notes
- The period selector (`This Month` / `Last 6M` / `This Year` / `All Time`) is local UI state only — it is not passed to the backend as a query param in the current implementation; `getAnalyticsData()` takes no arguments, so switching periods does not re-fetch or filter data.
- This is the tenant-facing analytics feature, distinct from the Super-Admin-only platform "Health" tab inside `/admin` (see `features/system_admin.md`).
