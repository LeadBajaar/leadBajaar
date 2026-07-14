---
type: page
route: /integrations
file: src/app/(dashboard)/integrations/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations

## Purpose
Main integrations gallery: tabbed grid of connectable services (All / Marketing / Messaging / Webhooks / Integration Settings), plus inline Meta Conversion API management widgets and a full webhook CRUD UI.

## Components used
- `GoogleAccountCard` (`@/components/integrations/GoogleAccountCard`) — rendered unconditionally above the tabs; belongs to another cluster (Google Workspace OAuth), cross-reference only.
- `IntegrationCard` (`@/components/integrations/IntegrationCard`) — one per catalog entry in the grid.
- `FacebookConversionApiManager`, `LeadConversionTracker`, `ConversionApiTester` (`@/components/meta-capi/*`) — rendered under the "Marketing" tab beneath the card grid.
- `WebhookConfigDialog`, `EmailConfigDialog`, `TestEmailDialog`, `UnifiedIntegrationDialog` (`@/components/integrations/*`) — modals for create/edit flows.
- `DeleteConfirmationModal` (`@/components/shared/DeleteConfirmationModal`) — deactivate-integration confirmation.
- `RoleGuard` (`@/components/RoleGuard`) wraps the entire page: `allowedFeatures={['integrations']}`.

## Data/API calls
- `integrationApi.getConnectedIntegrations()` — on mount; populates `connectedIntegrations` and derives the `webhooks` list (`type === 'webhook'`).
- `integrationApi.saveIntegration(...)` — connect a new integration (generic confirm dialog flow) or the detailed `UnifiedIntegrationDialog` flow.
- `integrationApi.deleteIntegration(id)` — deactivate.
- `integrationApi.updateIntegrationStatus(id, isActive)` — webhook toggle.
- `integrationApi.getLatestLog(id)` — polled every 3s (up to 2 min) during "Auto-Detect Fields" webhook listening.
- `(integrationApi as any).get('/email/configurations')` / `api.post('/email/configurations')` / `api.put('/email/configurations/{id}')` / `api.post('/email/configurations/test')` — email config CRUD + test send (ad-hoc calls, not formal `integrationApi` methods; see [api/integrations.md](../api/integrations.md)).
- `(integrationApi as any).get('/meta/status')` / `get('/meta/connect')` — Meta connection status banner + reconnect CTA.

## Notable behavior
- Tab selection is driven by a `?tab=` query param or `?meta_connected` (routes to the `facebook` tab — note: `facebook` is not one of the five defined tab values, so this branch is likely stale/dead).
- Card grid filters by `hasFeature('whatsapp_cloud_api')` specifically for the `whatsapp` catalog entry, and by legacy `hasPlan(...)` for others (currently unused since no catalog entry sets a `plans` array).
- `handleIntegrationAction` routes an already-connected card to its dedicated sub-page (`/integrations/whatsapp`, `/integrations/evolution`, `/integrations/meta-capi`, `/integrations/facebook-lead-forms`, `/integrations/email-marketing`, `/integrations/webhooks`, `/integrations/facebook-auth`, `/lb-forms`); if not connected, opens a confirm-connect dialog.
- Emits a `window.dispatchEvent(new Event('integrationsUpdated'))` on connect/delete so the sidebar's `canSee()` listeners re-check connection state without a full reload.
- "Integration Settings" tab contains a "Data Sync Frequency" select, "Data Mapping" dialog, and "Integration Logs" table that are all **non-functional UI mockups** — the logs table renders hardcoded `dummyLogs` (Salesforce/HubSpot/Mailchimp/Zapier/Calendly), not real data.
- Contains a large block of commented-out legacy handlers (`toggleIntegration`, `handleSaveConfig`, `handleSaveFacebookConfig`) — dead code, safe to ignore.
