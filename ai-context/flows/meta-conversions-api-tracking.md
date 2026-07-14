---
type: flow
slug: meta-conversions-api-tracking
featuresInvolved: [integrations]
---
# Flow: Meta Conversions API (CAPI) Tracking

Two parallel setup paths exist, mirroring the Facebook Lead Ads dual-path pattern (manual vs. OAuth-synced), both converging on the same three send endpoints.

## Path A — Manual Pixel Configuration
1. From the Integrations hub, user connects the "Facebook Conversion API" card → `UnifiedIntegrationDialog` collects **Pixel ID**, **Page Name**, **Access Token** (and optional **Test Event Code**) → `integrationApi.saveIntegration({ type: 'facebook_conversion_api', config: {...} })`.
2. Configuration is then visible/editable via `FacebookConversionApiManager` (Integrations hub → Marketing tab) or on the dedicated [`/integrations/meta-capi`](../pages/integrations-meta-capi.md) hub page (`integrationApi.getConversionApiConfiguration()` maps these rows into the `Pixel[]` shape used by `PixelTestConsole`).
3. To verify the setup, the user can fire a test event from any of three overlapping UIs — `FacebookConversionApiManager`, `LeadConversionTracker`, or `ConversionApiTester` (all in the hub's Marketing tab) — each calling `integrationApi.sendTestConversionEvent({ pixel_id, test_event_code, event_name, event_data, user_data, integration_id })` → `POST /facebook/conversion-api/send-test-event`. Results should appear in Meta Events Manager → Test Events within ~30 seconds.
4. For bulk backfill, `LeadConversionTracker` lets the user multi-select existing CRM leads and send them all as one call to `integrationApi.sendBatchConversionEvents(...)` → `POST /facebook/conversion-api/send-batch-events` (per-lead `user_data` is built from `email`/`name`/`phone`/`company`, event_data from `value`/`source`/`lead_id`).
5. Real production traffic uses `integrationApi.sendConversionEvent(...)` → `POST /facebook/conversion-api/send-event` (not exercised directly from the reviewed UI — presumably invoked server-side or from lead-creation triggers outside this cluster).

## Path B — OAuth-Synced Pixels + Website Tracking Script
1. On [`/integrations/meta-capi`](../pages/integrations-meta-capi.md) or inside `FacebookDashboard`'s pixels tab, user clicks "Sync from Meta" → `integrationApi.syncMetaPixels()` (`POST /meta/pixels/sync`) discovers pixels already existing in the connected Meta Business account's ad accounts.
2. Alternatively, `CreatePixelModal` (a 3-step wizard: select Ad Account → name pixel → success) calls `integrationApi.createMetaPixel({ name, ad_account_id })` (`POST /meta/pixels/create`) to create a brand-new pixel via the Graph API.
3. On success, `CreatePixelModal` generates a copy-paste install script containing: (a) the standard Meta Pixel base `fbq(...)` snippet, and (b) a custom `window.lbTrack(eventName, userData, customData)` bridge function that fires **both** the browser-side `fbq('track', ...)` call **and** a `fetch(...)` POST to `https://api.leadbajaar.com/api/tracking/event` for server-side deduplication (shared `event_id`).
4. The pixel then appears in `PixelTestConsole` ("Test Console" tab), where the user can fire configurable test events (event type, action source, user data, value/currency, test event code) via `integrationApi.sendTestConversionEvent(...)` with a live scrolling result log, or view/re-copy the same tracking script from the "Get Script" tab.
5. Aggregate performance across both manual and synced pixels is visualized via `integrationApi.getMetaPixelRoiSummary(days)` (`GET /meta/pixels/roi-summary`), rendered both by the Recharts-based summary on `/integrations/meta-capi` and by the simpler bar-chart `RoiDashboard` component embedded inside `FacebookDashboard`.

## Divergence note
As with Lead Ads sync, there is no single canonical "CAPI setup" UI — a workspace can have manual pixel configs (Path A, tested via three separate components) and OAuth-synced pixels (Path B, tested via `PixelTestConsole`) simultaneously, with the `/integrations/meta-capi` page's `adAccounts` deliberately hardcoded to `[]` because "Manual mode doesn't use OAuth ad accounts" — meaning `CreatePixelModal` from that page will show "No Ad Accounts Found" unless the user has separately gone through the OAuth sync at least once.
