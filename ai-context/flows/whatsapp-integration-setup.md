---
type: flow
slug: whatsapp-integration-setup
featuresInvolved: [integrations]
---
# Flow: WhatsApp Integration Setup (Cloud API & Evolution)

LeadBajaar supports two mutually-independent ways to connect a WhatsApp number, surfaced as separate catalog cards on the Integrations hub (`whatsapp`, `allowMultiple: false`, gated by `hasFeature('whatsapp_cloud_api')` and plan `['pro','enterprise']`; `evolution`, `allowMultiple: true`, no plan gate).

## Path A — WhatsApp Cloud API (official Meta Business Platform)
1. From the Integrations hub, connecting the "WhatsApp Cloud API" card opens `UnifiedIntegrationDialog`, which collects **Phone Number ID**, **WhatsApp Business Account (WABA) ID**, and a **System User Access Token** (validated non-empty client-side) → `integrationApi.saveIntegration({ type: 'whatsapp', config: {...} })`.
2. Alternatively (and this is the actual primary path per the dedicated page), navigating to [`/integrations/whatsapp`](../pages/integrations-whatsapp.md) directly: if `integrationApi.getWhatsAppAccounts()` returns an account with no `phone_number` yet (a "shell" record created by the hub's confirm-connect step), the page shows an inline "Complete WhatsApp Setup" form for the same three credentials, saved via `integrationApi.updateIntegration(id, { type: 'whatsapp', config: {...} })`.
3. Once configured, the page shows a **static webhook URL** (`https://api.leadbajaar.com/api/webhook/whatsapp?id={user.id}`) and a **hardcoded verify token (`123abc`)** that the user must manually paste into **Meta Developer Dashboard → WhatsApp → Configuration → Webhooks**.
4. `integrationApi.checkIntegrationStatus(accountId)` is polled once per account on page load to detect `needs_token_update` (expired token) — if true, `TokenUpdateModal` (`@/components/ui/reconnection-modal`) opens automatically, and submission calls `integrationApi.updateAccessToken(accountId, newToken)`.
5. Message templates are managed from the same page's "Message Templates" tab: `getWhatsAppTemplates`/`syncWhatsAppTemplates`/`createWhatsAppTemplate`/`updateWhatsAppTemplate`/`deleteWhatsAppTemplate`, with rich header/body/footer/buttons editing and a live WhatsApp-style preview. Template rejections from Meta surface a dedicated "rejection reason + suggested action" dialog with a resubmit path.
6. Dispatches `integrationsUpdated` after save so the sidebar re-checks `whatsappEnabled`.

## Path B — WhatsApp (Evolution) — personal number via QR
1. From the Integrations hub, connecting the "WhatsApp (Evolution)" card routes straight to [`/integrations/evolution`](../pages/integrations-evolution.md) (no config dialog — Evolution needs no upfront credentials).
2. On that page: `evolutionApi.getAccounts()` checks for an existing instance; if none, the user clicks "Generate QR Code" → `evolutionApi.createAccount('')` (creates a DB shell with no phone number) → `evolutionApi.connectInstance(instanceName)` (starts the Evolution API instance).
3. The page polls `evolutionApi.getQrCode(instanceName)` every 3s until a QR data-URI is returned, and separately polls `evolutionApi.getStatus(instanceName)` every 4s until `state === 'connected'`.
4. User scans the QR with their phone's WhatsApp app (Linked Devices → Link a Device). Once connected, the page re-fetches accounts to display the linked profile picture/name/phone number.
5. Disconnect (`evolutionApi.disconnectInstance`) moves the account to a `disconnected` state, from which the user can either "Reconnect Device" (re-runs steps 2–4) or "Delete Account" (`evolutionApi.deleteAccount`, native `confirm()` dialog) to free up the slot for a different number.
6. Evolution-connected numbers subsequently power the **Evolution Inbox** / **Evolution Chatbot** sidebar items (`evolutionEnabled` gate) — those belong to the Live Chat / Chatbot cluster, cross-referenced only.

## Key divergences between the two paths
- Cloud API is Meta-hosted (official Business Platform, requires Meta App review for production template categories); Evolution is a self-hosted bridge library pairing a **personal** WhatsApp number via QR — no Meta App/Business verification needed, but no official template-approval pipeline either (Evolution has no template management UI at all).
- Cloud API supports `allowMultiple: false` (one workspace-level Cloud API connection at a time, per the catalog `whatsapp` entry) vs. Evolution's `allowMultiple: true` (can connect several personal numbers).
- Cloud API is plan-gated (`hasFeature('whatsapp_cloud_api')`, requires `pro`/`enterprise` plan or agency/super_admin bypass); Evolution currently has no plan/feature gate on the catalog entry itself.
