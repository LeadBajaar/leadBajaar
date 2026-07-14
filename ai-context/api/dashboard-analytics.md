---
type: api
group: dashboard-analytics
sourceFile: src/lib/api.ts (getDashboardStats, getAnalyticsData, line ~2018)
usedByFeatures: [analytics]
---
# API: dashboard-analytics

Two standalone exported functions (not grouped into an object like `agencyApi`/`adminApi`/`financeApi`), sandwiched between `agencyApi` and `financeApi` in `src/lib/api.ts`. Neither wraps in try/catch — errors propagate to the caller.

| function | method + endpoint | params | purpose | file:line |
|---|---|---|---|---|
| `getDashboardStats` | GET `/dashboard/stats` | — | Company-wide dashboard stat payload (consumed by the main `/dashboard` overview page — outside this cluster's assigned pages, but the function lives alongside `getAnalyticsData`) | 2018 |
| `getAnalyticsData` | GET `/analytics` | — | Full analytics payload: `monthlyLeads`, `conversionRateData`, `leadSourceData`, `stageData`, `weeklyActivity`, `dealValueRanges`, `topPerformers` | 2023 |

## Notes
- `getAnalyticsData` takes **no parameters** — the `/analytics` page's period selector (This Month/Last 6M/This Year/All Time) is purely client-side UI state and does not filter the request.
- `getDashboardStats` backs the tenant `/dashboard` home page, which belongs to a different documentation cluster; included here only because it's colocated with `getAnalyticsData` in the same block of `src/lib/api.ts` and matches this cluster's assigned read range.

See also: `../pages/analytics.md`, `../features/analytics.md`.
