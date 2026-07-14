---
type: page
route: /integrations/meta-capi
file: src/app/(dashboard)/integrations/meta-capi/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/meta-capi

## Purpose
Dashboard hub for the Meta Conversions API (server-side event tracking): 30-day summary stat cards (total events, conversions, tracked revenue, active pixels), a daily event-volume line chart and an event-type breakdown bar chart (Recharts), plus tabs for a live testing console and a pixel management table.

## Components used
- `PixelTestConsole` (`@/components/meta-capi/PixelTestConsole`) — "Testing Console" tab; internally renders `CreatePixelModal`.
- Recharts `LineChart`/`BarChart` for the two summary charts.
- No `RoleGuard` wrapper.

## Data/API calls
- `integrationApi.getConversionApiConfiguration()` — maps manual (non-OAuth) pixel configurations into the `Pixel` shape (`configurations[].integration_id/pixel_id/page_name/is_configured`).
- `integrationApi.getMetaPixelRoiSummary(30)` — summary + breakdown + chart_data.
- `integrationApi.syncMetaPixels()` — "Refresh Data" / sync button (OAuth-based pixel discovery; manual-mode configs are unaffected).
- `integrationApi.updateMetaPixel(id, { is_active })` — enable/disable toggle in the "Manage Pixels" table.

## Notable behavior
- Two pixel data sources are conflated on this page: `getConversionApiConfiguration()` (manual pixel_id/access_token entries saved via the Integrations hub's `facebook_conversion_api` catalog card) vs. `syncMetaPixels()`/`getMetaPixels()` (OAuth-synced pixels from a connected Meta Business account). The `adAccounts` state is always set to `[]` here since "Manual mode doesn't use OAuth ad accounts" (code comment) — so `CreatePixelModal` (which needs ad accounts to create a pixel) will show "No Ad Accounts Found" unless pixels were synced via OAuth first.
- Currency defaults to `INR` if the backend doesn't return one.
