---
type: page
route: /ads/performance
file: src/app/(dashboard)/ads/performance/page.tsx
feature: ads
auth: protected
---
# Page: /ads/performance

## Purpose
Read-only performance dashboard: 5 summary stat tiles (Total Spend, Total Leads, Avg. CPL, Total Clicks, Impressions) and a per-campaign insights table, filterable by date preset and ad account.

## Components used
- No custom sub-components — plain HTML table/select styled with Tailwind, same style as `/ads/campaigns`.

## Data/API calls
- Local `apiGet` helper (not `integrationApi`) calling `fetch(`${API_BASE_URL}${path}`)` with `Authorization: Bearer {session.token}` from `getSession()`.
- `GET /meta/ads/adaccounts` — ad account list.
- `GET /meta/ads/adaccounts/{adAccountId}/insights?date_preset={preset}` — per-campaign insight rows (`spend`, `impressions`, `clicks`, `leads`, `cpl`, `status`, etc.).

## Notable behavior
- `date_preset` options: `today`, `yesterday`, `last_7_days`, `last_30_days` (default), `last_90_days`, `this_month`, `last_month` — passed straight through to the backend/Meta Insights API.
- All summary totals (`totalSpend`, `totalLeads`, `totalClicks`, `totalImpressions`, `avgCPL`) are computed client-side by reducing over the `insights` array — no separate summary endpoint.
- Currency formatting uses `₹` (INR) hardcoded, regardless of the ad account's actual currency field (`AdAccount.currency` is typed but unused in formatting).
- Same orphan-route caveat as `/ads/campaigns` — see [features/ads.md](../features/ads.md).
