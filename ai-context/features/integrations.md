---
type: feature
slug: integrations
name: Integrations Hub
status: active
roles: ["Super Admin", "Admin", "Manager"]
userTypes: ["agency", "super_admin", "individual"]
planFeatureKey: integrations
routes: ["/integrations", "/integrations/whatsapp", "/integrations/evolution", "/integrations/facebook-lead-forms", "/integrations/meta-capi", "/integrations/webhooks", "/integrations/email-marketing", "/integrations/facebook-auth"]
relatedDocs:
  pages: [../pages/integrations-hub.md, ../pages/integrations-whatsapp.md, ../pages/integrations-evolution.md, ../pages/integrations-facebook-lead-forms.md, ../pages/integrations-facebook-auth.md, ../pages/integrations-meta-capi.md, ../pages/integrations-webhooks.md, ../pages/integrations-email-marketing.md]
  components: [../components/integrations.md, ../components/facebook-oauth.md, ../components/meta-capi.md, ../components/automated-sync.md]
  api: [../api/integrations.md]
  flows: [../flows/facebook-lead-ads-sync.md, ../flows/meta-conversions-api-tracking.md, ../flows/whatsapp-integration-setup.md]
---
# Feature: Integrations Hub

## Summary
Central gallery (`/integrations`) for connecting third-party marketing/messaging services to a company's LeadBajaar workspace. Each `Integration` catalog entry (`whatsapp`, `evolution`, `leadform`, `facebook_conversion_api`, `webhook`, `facebook_auth`, `email`, `lb_forms`) is backed by a row in the generic `integrations` table (`type`, `config` JSON, `is_active`, `webhook_url`, `webhook_secret`). The hub page renders a card grid (`IntegrationCard`) filtered by tab (`all` / `marketing` / `messaging` / `webhooks` / `settings`), lets the user connect/deactivate/configure each integration, and deep-links to a dedicated sub-page once connected. Sub-capabilities documented separately:
- **WhatsApp Cloud API connect** — `/integrations/whatsapp` (Meta-hosted WABA, phone-number-based)
- **WhatsApp (Evolution) connect** — `/integrations/evolution` (QR-code personal-number bridge)
- **Facebook Lead Forms** — `/integrations/facebook-lead-forms` (manual page/form ID + webhook lead capture; also hosts the **"HubSpot Routing Only"** mode — lightweight `leadform` rows with just a name + Page ID that act as the page-id → tenant registry the backend uses to route enriched HubSpot webhook leads to the right workspace)
- **Facebook Auth (OAuth)** — `/integrations/facebook-auth` (full Meta Business Manager asset sync: pages, ad accounts, campaigns, pixels)
- **Meta Conversions API (CAPI)** — `/integrations/meta-capi` (server-side event tracking dashboard)
- **Webhooks** — `/integrations/webhooks` (generic incoming receiver + outgoing dispatcher; includes the **HubSpot integration**: a "Data Enrichment (HubSpot)" toggle so inbound HubSpot contact webhooks — which only carry an `objectId` — get enriched server-side via the HubSpot CRM API before field mapping, with enriched values mapped from `enrichment.properties.*` paths)
- **Email Marketing** — `/integrations/email-marketing` (SES / SMTP / Mailgun sender config)
- **LB Forms** is cataloged here as an integration card but is documented as its own feature — see [lb_forms.md](./lb_forms.md).
- **Google Workspace** card (`GoogleAccountCard`, rendered at the top of the hub) is a **different cluster's** feature (Calendar/Gmail/Contacts OAuth) — cross-referenced only, not documented here.

## Access control
- Sidebar section "Integrations" (`src/components/sidebar.tsx` ~line 71-82): all sub-items require `roles: ['Super Admin','Admin','Manager']`, `types: ['agency','super_admin','individual']`, `feature: 'integrations'` (checked via `hasFeature('integrations')`).
- Individual sub-nav items are additionally hidden unless the corresponding integration is already connected+active, via `canSee()` in the sidebar (lines ~164-177), which calls `integrationApi.getConnectedIntegrations()` once on mount and listens for a global `integrationsUpdated` DOM event: `lbFormsEnabled`, `whatsappEnabled`, `leadFormsEnabled`, `metaCapiEnabled`, `webhooksEnabled`, `emailEnabled`, `fbAuthEnabled`, `evolutionEnabled`. The top-level `/integrations` hub link itself is always visible to `['Super Admin','Admin']` regardless of connection state.
- `/integrations`, `/integrations/whatsapp`, `/integrations/facebook-auth` pages wrap content in `<RoleGuard allowedFeatures={['integrations']}>`. The other sub-pages (`evolution`, `facebook-lead-forms`, `meta-capi`, `webhooks`, `email-marketing`) do **not** use `RoleGuard` at the page level — access is only gated by the sidebar link visibility and the shared dashboard layout auth check.
- The hub's card grid additionally filters WhatsApp Cloud API by `hasFeature('whatsapp_cloud_api')` specifically (in addition to the generic `integrations` feature), and other cards by legacy `plans` arrays via `hasPlan(...) || hasType(['agency','super_admin'])` (mostly vestigial since none of the current catalog entries set a `plans` array).

## Key files
- Hub page: `src/app/(dashboard)/integrations/page.tsx`
- Sub-pages: see individual page docs linked above
- Shared components: `src/components/integrations/*` (`IntegrationCard`, `UnifiedIntegrationDialog`, `WebhookConfigDialog`, `EmailConfigDialog`, `TestEmailDialog`, `GoogleAccountCard`)
- API: `src/lib/api.ts` → `integrationApi` (see [api/integrations.md](../api/integrations.md)), plus `evolutionApi`, `googleIntegrationApi`

## Notes
- `src/app/(dashboard)/pixels-capi/` exists as an **empty directory with no files** — a route stub for a presumably-planned `/pixels-capi` page that was never implemented. It has no effect today; do not invent content for it.
- `src/app/api/integrations/` and `src/app/api/templates/` (Next.js route handlers, not `lib/api.ts`) are **empty directories** — no Next.js API routes are defined there. All real API calls go directly to the Laravel backend at `API_BASE_URL` via `src/lib/api.ts`, not through Next.js server routes.
- The hub page still contains a large block of dead/commented-out code (`toggleIntegration`, `handleSaveConfig`, `handleSaveFacebookConfig`) — legacy pre-refactor logic, safe to ignore.
- `dummyLogs` in the hub's "Settings" tab → "Integration Logs" accordion is **hardcoded mock data** (Salesforce/HubSpot/Mailchimp/Zapier/Calendly rows) — not wired to any real integration log API; purely decorative placeholder UI.
- The hub's "Data Sync Frequency" and "Data Mapping" accordions under the Settings tab are non-functional UI mockups (Selects/Dialog with no `onChange`/save handlers wired to state or API).
- Facebook Auth (`facebook_auth` type) connecting via OAuth is the gateway to the full Meta Business asset suite (pages, WABAs, ad accounts, campaigns, pixels) surfaced through `FacebookDashboard` — see [components/facebook-oauth.md](../components/facebook-oauth.md) and the [Facebook Lead Ads Sync flow](../flows/facebook-lead-ads-sync.md).
- Meetings/Calendar Google OAuth (`googleIntegrationApi`, `GoogleAccountCard`) belongs to another cluster's feature — cross-referenced only.
