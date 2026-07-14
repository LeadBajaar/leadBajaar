---
type: component-group
group: integrations
directory: src/components/integrations
usedByFeatures: [integrations, lb_forms]
---
# Components: integrations

## EmailConfigDialog
- Path: `src/components/integrations/EmailConfigDialog.tsx`
- Purpose: Modal form for configuring the email-sending provider (SES/SMTP/Mailgun) — provider select, sender name/email, provider-specific credential fields, "Send Test Email" and "Save" actions.
- Key props: `isOpen`, `onOpenChange`, `emailConfig` (object with `provider`, `from_name`, `from_email`, `credentials`), `setEmailConfig`, `onSave: () => Promise<void>`, `onSendTest: () => void`, `isConnecting`.
- Note: content is duplicated (not reused) by the standalone `/integrations/email-marketing` page, which reimplements the same form inline rather than rendering this component.

## GoogleAccountCard
- Path: `src/components/integrations/GoogleAccountCard.tsx`
- Purpose: Displays Google Workspace connection status and per-scope connect buttons (Contacts, Calendar, Gmail, Drive) at the top of the Integrations hub page.
- Key props: none (self-contained; reads `useSearchParams` for OAuth callback query params).
- **Belongs to another cluster** (Meetings/Calendar Google OAuth) — documented here only because it's rendered inside `/integrations/page.tsx`. Uses `googleIntegrationApi` (`getStatus`, `getConnectUrl`, `disconnect`) from `src/lib/api.ts`.

## IntegrationCard
- Path: `src/components/integrations/IntegrationCard.tsx`
- Purpose: The catalog-entry card rendered in the hub's grid — icon, name, description, connected/disconnected state badge, and Connect/Configure/Deactivate buttons. Adds dedicated "manage" shortcuts (routes directly to `/integrations/whatsapp` or `/integrations/meta-capi`) when those specific integration types are connected.
- Key props: `integration: Integration` (id/name/icon/category/color/description/features/allowMultiple), `connectedIntegrations: ConnectedIntegration[]`, `onAction(integration)`, `onDeactivate(integrationId)`, `isConnecting?`.

## TestEmailDialog
- Path: `src/components/integrations/TestEmailDialog.tsx`
- Purpose: Small modal to enter a recipient address and dispatch a test email via the configured provider.
- Key props: `isOpen`, `onOpenChange`, `email`, `setEmail`, `onSend: () => Promise<void>`, `isConnecting`.
- Note: the standalone `/integrations/email-marketing` page imports this component with a slightly different prop name (`onSendTest` vs `onSend` in the hub page) — check call sites before reusing; the component itself defines `onSend`.

## UnifiedIntegrationDialog
- Path: `src/components/integrations/UnifiedIntegrationDialog.tsx`
- Purpose: Generic multi-type configuration modal used by the hub page for `whatsapp`, `leadform`/`facebook`, and `facebook_conversion_api` connect flows (each branch renders different fields plus a static webhook-URL/verify-token info box). Falls through to a generic "API Key/Token" field for any other type.
- Key props: `isOpen`, `onOpenChange`, `selectedIntegrationId`, `integrations` (catalog array), `currentUserId`, `whatsappConfig`/`setWhatsappConfig`, `facebookConfig`/`setFacebookConfig`, `facebookConversionApiConfig`/`setFacebookConversionApiConfig`, `configErrors`, `isConnecting`, `onSave: () => Promise<void>`.
- Note: displays a hardcoded verify token (`123abc`) in the WhatsApp and Lead Form webhook info boxes — not dynamically generated.

## WebhookConfigDialog
- Path: `src/components/integrations/WebhookConfigDialog.tsx`
- Purpose: The richest dialog in this group — tabbed (Receive Leads / Dispatch Leads) editor for a single webhook integration: incoming receiver URL + dot-notation JSON field mapping (with an "Auto-Detect Fields" listening mode) and outgoing dispatcher URL + HMAC-SHA256 secret display. For a brand-new webhook (no `webhookId`), shows a simpler create form (name only) instead of the tabs.
- Key props: `isOpen`, `onOpenChange`, `webhookId: string | null`, `webhooks: WebhookConfig[]`, `newWebhook`, `setNewWebhook`, `setWebhooks`, `isConnecting`, `isListening`, `availableFields: {key,value}[]`, `onSave(id)`, `onAdd()`, `startListening(id)`, `addFieldMapping(id)`, `updateFieldMapping(id, index, field, value)`, `removeFieldMapping(id, index)`.
- Used identically (with the same handler set duplicated) by both `/integrations/page.tsx` (Webhooks tab) and the standalone `/integrations/webhooks/page.tsx`.
- The "Receive Leads" tab includes a **"Data Enrichment (HubSpot)"** switch that sets `webhook.enrichment = { enabled, url: '', method: 'POST', headers: [] }` — signals that inbound payloads carrying a HubSpot `objectId` should be enriched via the HubSpot CRM contacts API before mapping (enriched fields appear as `enrichment.properties.*` in the mapping source paths). The backend currently enriches on `objectId` auto-detection regardless of this flag; see `pages/integrations-webhooks.md`.
- Uses the shadcn `useToast` hook (`@/components/ui/use-toast`) for copy-to-clipboard confirmations — inconsistent with the rest of the app's `sonner`-only convention.
