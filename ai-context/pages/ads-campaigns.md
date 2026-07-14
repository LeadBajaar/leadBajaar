---
type: page
route: /ads/campaigns
file: src/app/(dashboard)/ads/campaigns/page.tsx
feature: ads
auth: protected
---
# Page: /ads/campaigns

## Purpose
Campaign Manager: lists Meta ad campaigns for a selected ad account, with inline pause/resume toggling and inline daily-budget editing (click-to-edit, Enter/Escape keyboard support).

## Components used
- No custom sub-components — plain HTML `table`/`select`/`button` styled with Tailwind (not shadcn primitives, unlike most of the rest of the app).

## Data/API calls
- Local `apiGet`/`apiPost` helpers (not `integrationApi`) call `fetch(`${API_BASE_URL}${path}`)` directly with `Authorization: Bearer {session.token}` from `getSession()` (`@/lib/auth`).
- `GET /meta/ads/adaccounts` — ad account list (auto-selects the first one).
- `GET /meta/ads/adaccounts/{adAccountId}/campaigns` — campaign list on account selection/refresh.
- `POST /meta/ads/{campaignId}/status` `{ status }` — pause/resume (optimistic UI update, reverts on failure).
- `POST /meta/ads/adsets/{campaignId}/budget` `{ daily_budget }` — budget update; note the request is keyed by `campaign.id` but hits an `adsets/{id}/budget` endpoint (naming mismatch — likely because in this simplified UI a "campaign" row's budget maps 1:1 to its underlying ad set, or this is a latent bug; verify against backend before relying on it).

## Notable behavior
- Budgets are stored/returned in paise (smallest currency unit); UI divides by 100 for display and multiplies by 100 before sending.
- Empty/error states offer a "Go to Integrations" CTA linking to `/integrations` — but nothing in `/integrations` links back to this page (see [features/ads.md](../features/ads.md) — orphan route).
- Pause/resume button is disabled for `DELETED`/`ARCHIVED` campaigns.
