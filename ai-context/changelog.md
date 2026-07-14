# AI-Context Changelog

Newest first. Each entry records what changed in the app and which docs were updated to match.

## 2026-07-12 — HubSpot integration (webhook enrichment + lead routing)
- **Feature added to the app**: inbound HubSpot contact webhooks are now supported through the generic incoming-webhook pipeline. Two parts:
  1. **Enrichment** — `WebhookConfigDialog` ("Receive Leads" tab) gained a "Data Enrichment (HubSpot)" toggle; the backend fetches the full HubSpot contact by `objectId` and exposes it to field mapping as `enrichment.properties.*`.
  2. **Lead routing** — `/integrations/facebook-lead-forms` gained a "HubSpot Routing Only" switch (`config.routingOnly`) that registers a Page-ID-only `leadform` integration; the backend matches the HubSpot contact's custom `facebook_page_id` property against these rows to route the lead into the correct tenant workspace.
- **Docs updated**: `pages/integrations-webhooks.md`, `pages/integrations-facebook-lead-forms.md`, `components/integrations.md`, `features/integrations.md`. Backend counterparts (leadbajar-backend repo): `integrations/generic-webhooks.md`, `features/facebook_lead_forms.md`, `environment-variables.md` (`HUBSPOT_TOKEN`), `index.md`.
