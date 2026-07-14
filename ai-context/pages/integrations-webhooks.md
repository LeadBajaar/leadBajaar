---
type: page
route: /integrations/webhooks
file: src/app/(dashboard)/integrations/webhooks/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/webhooks

## Purpose
Standalone list/CRUD page for generic webhook integrations (both incoming lead receivers and outgoing lead dispatchers). Functionally a near-duplicate of the "Webhooks" tab embedded in the main `/integrations` hub page — same state shape, same handlers, same `WebhookConfigDialog`.

## Components used
- `WebhookConfigDialog` (`@/components/integrations/WebhookConfigDialog`) — create/edit modal (incoming URL + field mapping, or outgoing URL + HMAC secret).
- No `RoleGuard` wrapper.

## Data/API calls
- `integrationApi.getConnectedIntegrations()` filtered to `type === 'webhook'`.
- `integrationApi.saveIntegration({ type: 'webhook', ... })` — create.
- `(integrationApi as any).updateIntegration(id, config)` — update.
- `(integrationApi as any).updateIntegrationStatus(id, isActive)` — toggle.
- `(integrationApi as any).deleteIntegration(id)` — delete (native `confirm()`).
- `integrationApi.getLatestLog(id)` — polled every 3s (up to 2 min) for the "Auto-Detect Fields" listening flow, identical to the hub page's implementation.

## Notable behavior
- **"Data Enrichment (HubSpot)" toggle** in `WebhookConfigDialog`'s "Receive Leads" tab: stores an `enrichment` object (`{ enabled, url, method, headers }`) on the webhook integration. Purpose: inbound HubSpot contact webhooks only carry an `objectId`; the backend calls the HubSpot CRM API to fetch the full contact (name/email/phone/city/jobtitle/`facebook_page_id`) and merges it into the payload as `enrichment.properties.*`, which can then be used in the field mapping below. **Note:** the backend auto-detects `objectId` and enriches regardless of this toggle's value (intentional, so mapping setup works before the config is saved) — the switch is effectively declarative UI state today.
- Enriched HubSpot payloads can also be **routed to a different tenant** by the backend via the contact's `facebook_page_id` property matched against `leadform` integrations registered on `/integrations/facebook-lead-forms` (its "HubSpot Routing Only" mode) — this page's mapping UI is where `enrichment.properties.*` paths get bound to CRM fields.
- Contains its own copy of `flattenPayload()` (dot-notation JSON flattener) duplicated verbatim from `integrations/page.tsx` — a candidate for extraction into a shared util.
- This page and the hub's "Webhooks" tab are functionally redundant; both are reachable (hub via tab, this page via the sidebar's direct "Webhooks" link) and both fully implement create/edit/delete/listen independently against the same backend rows.
