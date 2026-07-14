---
type: flow
slug: facebook-lead-ads-sync
featuresInvolved: [integrations]
---
# Flow: Facebook Lead Ads Sync

There are **two parallel, independently-built paths** to get Facebook/Instagram Lead Ads submissions into LeadBajaar's CRM. Both terminate in the same incoming-webhook lead-capture mechanism on the backend, but are configured from different frontend pages.

## Path A — Manual (Page ID + Form ID + Access Token)
1. User opens [`/integrations/facebook-lead-forms`](../pages/integrations-facebook-lead-forms.md) (reachable from the Integrations hub's "Facebook Lead Forms" card, or directly from the sidebar once `leadFormsEnabled`).
2. Clicks "Add New Form", pastes a Facebook **Page ID**, **Form ID**, and a long-lived **Page Access Token** obtained manually from Meta's Graph API Explorer / Business Manager.
3. Frontend validates all four fields are present, then calls `integrationApi.saveIntegration({ type: 'leadform', config: {...} })` → `POST /integrations`.
4. Page displays a static webhook URL (`https://api.leadbajaar.com/api/webhook/leadform?id={user.id}`) and a hardcoded verify token (`123abc`) that the user must manually paste into the **Meta Developer Dashboard → Webhooks → Leadgen** subscription config for their app.
5. From that point on, Meta POSTs new lead submissions to the LeadBajaar webhook endpoint out-of-band (backend-only; not part of this frontend cluster) which creates CRM Leads.
6. Dispatches `integrationsUpdated` so the sidebar re-checks `leadFormsEnabled`.

## Path B — OAuth (Facebook Auth + FacebookDashboard)
1. User opens [`/integrations/facebook-auth`](../pages/integrations-facebook-auth.md).
2. `FacebookOAuthButton` calls `integrationApi`-adjacent `api.get('/meta/connect')` to get an `auth_url`, opens it in a popup, and completes Facebook Login for Business (grants page/ads/leadgen permissions). Success is broadcast back to the opener window via a `localStorage` `META_OAUTH_SUCCESS` key (COOP-safe) — see [pages/integrations-facebook-auth.md](../pages/integrations-facebook-auth.md).
3. Backend syncs pages/ad-accounts/pixels during the OAuth callback; the page dispatches `TRIGGER_META_SYNC` so `FacebookDashboard` refetches (`loadPages()`, `loadAdAccounts()`).
4. Inside `FacebookDashboard`'s "Pages" tab, the user selects a Facebook Page → `integrationApi.getMetaPageForms(pageId)` lists that page's lead forms.
5. For each form the user wants to sync, they toggle "Track" → `integrationApi.trackMetaForm(pageId, formId, formName, pageName)` (`POST /meta/pages/{pageId}/forms/track`). Tracked forms are listed via `integrationApi.getMetaTrackedForms(pageId)`.
6. `WebhookVerificationDialog` ("Verify Setup" per page) lets the user confirm: (a) required OAuth scopes are present (`getMetaWebhookChecklist`), (b) the page's leadgen webhook subscription is active — with a "Fix Now" button calling `integrationApi.subscribeMetaPage(pageId)` if not, and (c) run a round-trip test by entering a real Lead ID (`integrationApi.testMetaLeadRetrieval(leadId)`) to confirm LeadBajaar can decode and fetch full lead data from the Graph API.
7. For historical backfill (rather than waiting on future webhook events), `integrationApi.syncMetaLeads(formId, days)` (`FacebookDashboard`'s "Sync History" button) pulls recent leads directly.
8. Real-time future leads flow via the same backend leadgen webhook mechanism as Path A once subscribed.

## Divergence / redundancy note
Path A and Path B are not unified in the frontend — a workspace could end up with both a manually-entered `leadform` integration row *and* OAuth-tracked forms for the same Facebook Page, since neither UI is aware of the other's state. `FacebookDashboard`'s per-form tracking toggle (step 5, Path B) has no corresponding "untrack" API — un-checking a form only updates local UI state (`toast.info("Form Untracked", ...)`), per a code comment noting "we don't have an untrack API yet."
