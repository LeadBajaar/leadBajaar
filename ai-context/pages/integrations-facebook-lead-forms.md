---
type: page
route: /integrations/facebook-lead-forms
file: src/app/(dashboard)/integrations/facebook-lead-forms/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/facebook-lead-forms

## Purpose
Manual (non-OAuth) connection of Facebook Lead Ads forms: user pastes a Facebook Page ID, Form ID, and a long-lived Page Access Token; LeadBajaar then receives lead submissions via an incoming webhook rather than polling the Graph API. Supports multiple form connections per workspace (`allowMultiple: true` on the catalog entry).

Also serves as the registration UI for **HubSpot lead routing**: a "HubSpot Routing Only" switch in the add/edit dialog creates a lightweight `leadform` integration (name + Page ID only) whose sole purpose is to map a Facebook Page ID to this tenant, so the backend can route inbound HubSpot webhook leads (matched via the HubSpot contact's custom `facebook_page_id` property) into this workspace.

## Components used
- Plain shadcn `Dialog`/`Input`/`Switch`/`Badge` — no custom sub-components.

## Data/API calls
- `integrationApi.getConnectedIntegrations()` — filtered client-side to `type === 'leadform'`.
- `integrationApi.saveIntegration({ type: 'leadform', config: {...}, ... })` — create.
- `(integrationApi as any).updateIntegration(id, payload)` — update existing.
- `integrationApi.deleteIntegration(id)` — remove a form connection (`window.confirm()`, not a styled modal).
- `integrationApi.updateIntegrationStatus(id, !currentStatus)` — active/inactive toggle.
- Dispatches `integrationsUpdated` on every mutation.

## Notable behavior
- Right sidebar shows a static webhook URL (`https://api.leadbajaar.com/api/webhook/leadform?id={user.id}`) and a **hardcoded verify token `123abc`** for pasting into the Meta Developer Dashboard's Webhooks → Leadgen config — this is not dynamically generated per-integration.
- Form list reads both snake_case (`config.project_name`, `config.page_id`, `config.form_id`, `config.page_access_token`) and camelCase (`config.leadFormName`, `config.pageId`, `config.formId`, `config.accessToken`) field variants defensively, suggesting the backend has changed the config shape over time or accepts either.
- **"HubSpot Routing Only" switch** (`config.routingOnly: boolean`): when on, the Form ID and Page Access Token fields are hidden, cleared, and excluded from validation — only Lead Form Name + Page ID are required. The saved payload is still `type: 'leadform'` with `config: { leadFormName, pageId, formId: '', accessToken: '', routingOnly: true }`. Backend counterpart: `IncomingWebhookController` (leadbajar-backend) matches HubSpot-enriched webhook payloads' `facebook_page_id` against these rows' `pageId` to re-target the lead's `user_id`/`company_id` — see backend doc `ai-context/integrations/generic-webhooks.md`.
- No `RoleGuard` wrapper on this page.
- Cross-reference: the fuller OAuth-based Facebook page/lead-form management lives in `FacebookDashboard` at `/integrations/facebook-auth` — this page is the lighter-weight manual alternative. See the [Facebook Lead Ads Sync flow](../flows/facebook-lead-ads-sync.md) for how both paths converge on the same incoming-webhook lead-capture mechanism.
