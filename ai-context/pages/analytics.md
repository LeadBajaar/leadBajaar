---
type: page
route: /analytics
file: src/app/(dashboard)/analytics/page.tsx
feature: analytics
auth: protected
subRoutes: []
---
# Page: /analytics

## Purpose
Company-wide analytics dashboard: 4 stat cards (Total Leads, Converted, Conversion Rate, Revenue) plus 6 chart panels (Lead Volume bar chart, Revenue Trend area chart, Conversion Rate line chart vs 45% target, Lead Sources pie + legend, Pipeline Stage funnel bars, Weekly Activity bar chart, Deal Value Distribution horizontal bars, Top Performers leaderboard).

## Guard
`RoleGuard allowedFeatures={['analytics']}` — no role/type restriction at the component level (see `../features/analytics.md` for why individual accounts still need plan-level access via the sidebar/feature-flag combination).

## Data flow
On mount, `getAnalyticsData()` is called once and the whole payload (`monthlyLeads`, `conversionRateData`, `leadSourceData`, `stageData`, `weeklyActivity`, `dealValueRanges`, `topPerformers`) is stored in `realData`. All derived totals (`totalLeads`, `totalConverted`, `totalRevenue`, `convRate`) are computed client-side by reducing `monthlyLeads`.

## Key interactions
- Period toggle (`This Month`/`Last 6M`/`This Year`/`All Time`) is local UI state only — **does not trigger a re-fetch or filter**; changing it has no visible effect on the charts currently.
- No mutating actions on this page — read-only dashboard.

## Notes
- Defines local presentational helpers inline: `StatCard`, `LeadsTooltip`, `RevenueTooltip` (custom Recharts tooltip renderers).
- All numeric arrays default to `[]` via optional chaining (`realData?.monthlyLeads || []`) so the page renders gracefully before/without data.
- No dedicated components subfolder; built directly from `src/components/ui/*` (Card, Badge, Switch, Label) and `recharts`.

See also: `../features/analytics.md`, `../api/dashboard-analytics.md`.
