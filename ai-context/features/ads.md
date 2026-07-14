---
type: feature
slug: ads
name: Meta Ads Management (Campaigns & Performance)
status: partial
roles: []
userTypes: []
planFeatureKey: null
routes: ["/ads/campaigns", "/ads/performance"]
relatedDocs:
  pages: [../pages/ads-campaigns.md, ../pages/ads-performance.md]
  components: []
  api: [../api/integrations.md]
  flows: [../flows/facebook-lead-ads-sync.md]
---
# Feature: Meta Ads Management (Campaigns & Performance)

## Summary
Two standalone dashboard pages for managing and reviewing Meta (Facebook) ad campaigns tied to the workspace's connected ad accounts: `/ads/campaigns` (pause/resume campaigns, inline daily-budget editing) and `/ads/performance` (spend/leads/CPL/clicks/impressions summary + per-campaign insights table, with a date-range and ad-account selector). Both are thin, self-contained pages that call the Meta Ads endpoints directly rather than going through the richer `FacebookDashboard` component used elsewhere in the Integrations cluster.

## Access control
- **No `RoleGuard` wrapper on either page** and **no sidebar entry links to `/ads/campaigns` or `/ads/performance` anywhere in the codebase** (confirmed via repo-wide search — the only other hits for `/meta/ads/campaigns` are API endpoint strings in `lib/api.ts`). These are effectively orphan routes: reachable only by direct URL navigation, not discoverable through any in-app nav, button, or link. Access control is therefore whatever the shared `(dashboard)` layout enforces (must be authenticated), with no additional role/type/plan/feature gate.
- Both pages redirect the user to `/integrations` via an in-page CTA ("Go to Integrations") when no ad accounts are found, implying the intended entry point is after connecting Facebook Auth, but no code actually links here from the Integrations hub or `FacebookDashboard`.

## Key files
- `src/app/(dashboard)/ads/campaigns/page.tsx`
- `src/app/(dashboard)/ads/performance/page.tsx`

## Notes
- **Deviates from the `src/lib/api.ts` convention**: both pages define their own local `apiGet`/`apiPost` helpers that call `fetch(`${API_BASE_URL}${path}`, ...)` directly with a bearer token pulled from `getSession()` (`src/lib/auth.ts`), instead of using the `api` axios instance or `integrationApi` object. The endpoints they hit (`/meta/ads/adaccounts`, `/meta/ads/adaccounts/{id}/campaigns`, `/meta/ads/adaccounts/{id}/insights`, `/meta/ads/{id}/status`, `/meta/ads/adsets/{id}/budget`) overlap with functions already defined in `integrationApi` (`getMetaAdAccounts`, `getMetaCampaigns`, `getMetaAdAccountInsights`, `updateMetaStatus`, `updateMetaAdSet`) — this looks like a parallel/duplicate implementation rather than reuse.
- Campaign budgets are stored in the smallest currency unit (paise for INR) on the backend; both pages convert to/from rupees for display (`parseFloat(budget) / 100`).
- `/ads/campaigns` supports optimistic UI updates for pause/resume and budget edits, reverting on API failure.
- `/ads/performance` supports a `date_preset` query param (`today`, `yesterday`, `last_7_days`, `last_30_days`, `last_90_days`, `this_month`, `last_month`) passed straight through to the backend/Meta Insights API.
- Given the Facebook Auth / `FacebookDashboard` component (see [components/facebook-oauth.md](../components/facebook-oauth.md)) already implements campaign create/pause/duplicate/delete and an ad-account/campaign/ad-set drill-down UI inline within `/integrations/facebook-auth`, these two `/ads/*` pages appear to be a simplified, currently-unlinked alternative UI for the same underlying Meta Ads API — status marked `partial` because they are functional but not integrated into any navigation flow.
