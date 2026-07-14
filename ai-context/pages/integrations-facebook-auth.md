---
type: page
route: /integrations/facebook-auth
file: src/app/(dashboard)/integrations/facebook-auth/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/facebook-auth

## Purpose
Entry point for the full Meta OAuth connection (Facebook Login for Business), and host for the large `FacebookDashboard` asset-management UI (pages, ad accounts, campaigns, ad sets, ads, creatives, pixels, lead forms, business assets). This page itself is thin — nearly all logic lives in the two components it renders.

## Components used
- `FacebookOAuthButton` (`@/components/facebook-oauth/FacebookOAuthButton`) — connect/manage-connection button + service summary.
- `FacebookDashboard` (`@/components/facebook-oauth/FacebookDashboard`) — the full asset dashboard (~3,250 lines); see [components/facebook-oauth.md](../components/facebook-oauth.md).
- `RoleGuard allowedFeatures={['integrations']}` wraps the page.

## Data/API calls
- No direct API calls in the page component itself — delegates entirely to the child components (`FacebookOAuthButton` calls `api.get('/meta/status')` / `api.get('/meta/connect')`; `FacebookDashboard` calls dozens of `integrationApi.getMeta*`/`createMeta*` methods — see [components/facebook-oauth.md](../components/facebook-oauth.md) and [api/integrations.md](../api/integrations.md)).

## Notable behavior
- Handles the **OAuth popup return flow**: when this page is reopened as a `window.open()` popup after the Meta OAuth redirect (with `?meta_connected=success` or `?message=<error>` query params), it writes `META_OAUTH_SUCCESS`/`META_OAUTH_ERROR` to `localStorage` (a COOP-safe broadcast mechanism, since `window.opener` is often nulled by Cross-Origin-Opener-Policy after returning from facebook.com) and then attempts `window.close()`. The parent window's `FacebookOAuthButton` listens for the `storage` event to detect success/failure without relying on `window.opener`.
- On successful connect, dispatches a `TRIGGER_META_SYNC` custom event that `FacebookDashboard` listens for to refresh its pages/ad-accounts lists (backend already syncs during the OAuth callback; this just triggers a DB refetch).
