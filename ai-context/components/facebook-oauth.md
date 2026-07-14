---
type: component-group
group: facebook-oauth
directory: src/components/facebook-oauth
usedByFeatures: [integrations]
---
# Components: facebook-oauth

## FacebookOAuthButton
- Path: `src/components/facebook-oauth/FacebookOAuthButton.tsx`
- Purpose: Connect/manage-connection entry point for the full Meta OAuth flow. Shows a "Connect Facebook" CTA when nothing is connected, or a compact summary card ("N services synced" + Refresh/Manage buttons) once connected.
- Key props: `onConnect?: (services: FacebookService[]) => void`, `className?`.
- Behavior: opens a popup (`window.open(auth_url, 'facebook-oauth', ...)`) to `GET /meta/connect`'s `auth_url`; listens for a `storage` event key `META_OAUTH_SUCCESS`/`META_OAUTH_ERROR` (written by `/integrations/facebook-auth/page.tsx` when it detects the OAuth redirect, working around COOP blocking `window.opener`), with a fallback poll on `popup.closed`. Also exposes `handleRefreshToken` → `POST /facebook/oauth/refresh-token`.
- Calls `api.get('/meta/status')` directly (not via `integrationApi`) to build its `connectedServices` summary from `facebook_oauth`/`facebook_pages`/`whatsapp_business` keys in the response.
- Uses the shadcn `useToast` hook, not `sonner`.

## FacebookDashboard
- Path: `src/components/facebook-oauth/FacebookDashboard.tsx` (~3,250 lines — the largest component in this cluster; only the first ~1,065 lines and a targeted grep of `TabsTrigger` values were fully read for this doc, so treat the endpoint list below as representative, not necessarily exhaustive).
- Purpose: Full Meta Business Manager asset console rendered on `/integrations/facebook-auth` below `FacebookOAuthButton`. Manages, per selected Business/Ad Account: Facebook Pages (with lead-form listing + tracking toggle + webhook subscription check), Ad Accounts, Campaigns, Ad Sets, Ads, Ad Creatives (including image/video upload and a creative-library picker), Templates (pre-built campaign launch), ROI/Pixels (delegates to `RoiDashboard`/`PixelTestConsole`), Custom/Lookalike Audiences, Automated Rules, and account-level data-deletion/disconnect flows (GDPR-style).
- Top-level tabs (from `TabsList`/`TabsTrigger` in the JSX): `pages`, `ads`, `creatives`, `templates`, `roi`, `pixels`.
- Key props: none (self-contained; no props).
- Notable internal helper: `formatMetaError(errorMsg)` — a large heuristic that maps raw Meta Graph API error strings/subcodes (rate limits `80004`, payment method `1359188`, permissions/capability, budget `4834011`, bid strategy `2490487`, creative-incomplete `2446391`, expired token `190`, Lead Gen ToS `1892181`/`1870090`) to a user-friendly `{ title, description, action, url? }` shown via `toast.error` or an `ErrorDialog`.
- Calls dozens of `integrationApi.getMeta*`/`createMeta*`/`updateMeta*`/`deleteMeta*` functions — see [api/integrations.md](../api/integrations.md) for the full endpoint table.
- Listens for a global `TRIGGER_META_SYNC` custom event (dispatched by `/integrations/facebook-auth/page.tsx` after OAuth success) to refresh pages/ad-accounts.
- Imports and renders `PixelTestConsole` and `RoiDashboard` from `@/components/meta-capi/*` inside its own tabs, and `WebhookVerificationDialog` from this same directory.

## FacebookServicesManager
- Path: `src/components/facebook-oauth/FacebookServicesManager.tsx`
- Purpose: An alternate/simpler overview component (token-status card + tabs for Pages/WhatsApp Business summaries) covering similar ground to parts of `FacebookDashboard`.
- Key props: none.
- **Not imported anywhere** in the reviewed cluster files (`FacebookOAuthButton`, `FacebookDashboard`, and the `facebook-auth` page all render other components) — appears to be an unused/superseded component. Calls `fetch('/api/facebook/oauth/connected-services')` and `fetch('/api/facebook/oauth/refresh-token')` directly (relative paths, not `API_BASE_URL` — would hit the Next.js origin, not the Laravel backend, which is itself a red flag that this component is stale/broken if it were ever mounted).

## WebhookVerificationDialog
- Path: `src/components/facebook-oauth/WebhookVerificationDialog.tsx`
- Purpose: Troubleshooting dialog ("Verify Setup" button) for a single Facebook Page's lead-webhook configuration: checks required OAuth permissions/token validity, checks webhook subscription status (with a "Fix Now" button to (re)subscribe), and offers a round-trip test (enter a real Lead ID → fetch it via Meta Graph API to confirm decode/retrieval works), plus a link to Meta's official Lead Ads Testing Tool.
- Key props: `pageId: string`, `pageName: string`.
- Calls `integrationApi.getMetaWebhookChecklist(pageId)`, `integrationApi.subscribeMetaPage(pageId)`, `integrationApi.testMetaLeadRetrieval(leadId)`.
- Rendered from within `FacebookDashboard`'s Pages tab (per-page action).
