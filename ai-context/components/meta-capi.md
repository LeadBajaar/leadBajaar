---
type: component-group
group: meta-capi
directory: src/components/meta-capi
usedByFeatures: [integrations]
---
# Components: meta-capi

## FacebookConversionApiManager
- Path: `src/components/meta-capi/FacebookConversionApiManager.tsx`
- Purpose: Lists all manual Facebook Conversion API configurations (pixel_id/page_name/is_configured) with per-config "Test Event" and "Configure" actions, plus a reference grid of available standard event types. Rendered inside the Integrations hub's "Marketing" tab.
- Key props: none.
- Calls `integrationApi.getConversionApiConfiguration()`, `getConversionApiEventTypes()`, `sendTestConversionEvent(...)`, `updateIntegration(id, {...})` (first-time setup) / `updateConversionApiConfiguration(...)` (subsequent edits).

## LeadConversionTracker
- Path: `src/components/meta-capi/LeadConversionTracker.tsx`
- Purpose: Lets a user select a CAPI configuration + event type, pick a batch of CRM leads from a list (checkboxes, select-all), and send them all as conversion events in one batch call — useful for backfilling attribution on leads created before CAPI was configured. Rendered inside the Integrations hub's "Marketing" tab.
- Key props: none.
- Calls `integrationApi.getConversionApiConfiguration()`, `integrationApi.getLeads({ per_page: 50 })` (cross-reference: `getLeads` belongs to the Leads cluster's API surface, called here directly), `integrationApi.sendBatchConversionEvents(...)`.
- Note: `autoTrack` "Auto-track new leads" switch exists in the UI but has no wired persistence/effect — purely a visual toggle with local state only.

## ConversionApiTester
- Path: `src/components/meta-capi/ConversionApiTester.tsx`
- Purpose: Raw JSON-based testing console for CAPI: three sub-tabs (Single Event, Batch Events, Connection Test) where the user can hand-author `event_data`/`user_data` JSON and fire it at a selected pixel configuration. Rendered inside the Integrations hub's "Marketing" tab, alongside `FacebookConversionApiManager` and `LeadConversionTracker` (three overlapping testing UIs — see Notes below).
- Key props: none.
- Calls `integrationApi.getConversionApiConfiguration()`, `sendTestConversionEvent(...)`, `sendBatchConversionEvents(...)`.

## CreatePixelModal
- Path: `src/components/meta-capi/CreatePixelModal.tsx`
- Purpose: 3-step wizard (Select Ad Account → Name Pixel → Success/Install Script) for creating a brand-new Meta Pixel via the Graph API and generating a copy-paste tracking script (`fbq` base code + a custom `window.lbTrack(eventName, userData, customData)` bridge that fires both the browser Pixel event and a server-side CAPI call to `/api/tracking/event`).
- Key props: `open: boolean`, `onClose: () => void`, `adAccounts: {id,name,account_id}[]`, `onPixelCreated: (pixel) => void`.
- Calls `integrationApi.createMetaPixel({ name, ad_account_id })`.
- Rendered from `PixelTestConsole`.

## PixelTestConsole
- Path: `src/components/meta-capi/PixelTestConsole.tsx`
- Purpose: Two-tab console (Test Console / Get Script) for a *synced* (OAuth-discovered) pixel: fire a configurable test event (action source, event type, user data, value/currency, test event code) with a live scrolling event log, or view/copy the `lbTrack` install script for a selected pixel. Rendered as the "Testing Console" tab on `/integrations/meta-capi` and reused inside `FacebookDashboard`'s "roi"/pixels-related tab.
- Key props: `pixels: Pixel[]`, `adAccounts: {id,name,account_id}[]`, `onRefreshPixels: () => void`, `isSyncingPixels: boolean`.
- Calls `integrationApi.sendTestConversionEvent(...)`; renders `CreatePixelModal` internally for the "Create Pixel" button.

## RoiDashboard
- Path: `src/components/meta-capi/RoiDashboard.tsx`
- Purpose: Standalone conversion-analytics view (summary cards for total events/conversions/revenue, a simple CSS-bar daily events chart, and an event-type breakdown bar list) with a 7/30/90-day selector. Rendered inside `FacebookDashboard`'s tab set (imported there) — a second, near-duplicate summary of what `/integrations/meta-capi/page.tsx` already shows with Recharts.
- Key props: none.
- Calls `integrationApi.getMetaPixelRoiSummary(days)`; gracefully falls back to a zeroed empty state on error instead of surfacing an error toast.

## Notes (cross-component)
- `FacebookConversionApiManager`, `LeadConversionTracker`, and `ConversionApiTester` are three separately-built CAPI testing/config UIs, all stacked vertically in the Integrations hub's Marketing tab, with meaningfully overlapping functionality (all three can send a test event against a manual pixel config). No single "canonical" CAPI test UI — `PixelTestConsole` (synced-pixel flow) is the fourth, used on the dedicated `/integrations/meta-capi` page instead.
- All CAPI test/send calls converge on the same three backend endpoints: `POST /facebook/conversion-api/send-event`, `/send-batch-events`, `/send-test-event` (see [api/integrations.md](../api/integrations.md)).
