---
type: page
route: /integrations/whatsapp
file: src/app/(dashboard)/integrations/whatsapp/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/whatsapp

## Purpose
Management console for WhatsApp Cloud API (official Meta Business Platform) accounts: initial setup (Phone Number ID / WABA ID / System User Access Token), a table of connected accounts with sync/reconfigure actions, and a full message-template designer (create/edit/preview/delete, with header/body/footer/buttons components and live WhatsApp-style preview). Largest file in this cluster (2,269 lines).

## Components used
- `TokenUpdateModal` (`@/components/ui/reconnection-modal`) — shown when the backend reports `needs_token_update` (expired access token) for an account.
- Plain shadcn `Tabs`/`Table`/`Dialog`/`ScrollArea` — no bespoke WhatsApp-specific sub-components.
- Uses `useToast` (shadcn/legacy hook), **not** `sonner` — same convention exception as the Evolution page.
- `RoleGuard allowedFeatures={['integrations']}` wraps the page.

## Data/API calls
- `integrationApi.getWhatsAppAccounts()` — on mount; also detects "shell" integrations (no `phone_number` yet → shows the setup form instead of the accounts table).
- `integrationApi.checkIntegrationStatus(accountId)` — per-account, checked in a loop after fetch to detect `needs_token_update`.
- `integrationApi.updateIntegration(id, { type: 'whatsapp', config: {...} })` — completes initial setup or updates Phone Number ID/WABA ID/Access Token for an existing account.
- `integrationApi.getWhatsAppTemplates(accountId)` / `syncWhatsAppTemplates(accountId)` — list/sync templates from Meta.
- `integrationApi.createWhatsAppTemplate`, `updateWhatsAppTemplate`, `deleteWhatsAppTemplate` — full template CRUD, submitted to Meta for approval.
- `integrationApi.updateAccessToken(integrationId, token)` — called from `TokenUpdateModal` on reconnection.
- `companyApi.getSettings()` / `companyApi.updateSettings(...)` — fetches `whatsapp_welcome_enabled`/`whatsapp_welcome_message`/`whatsapp_meeting_enabled`/etc. into local `welcomeSettings` state (see Notable behavior — this is fetched but never rendered or saved from this page).

## Notable behavior
- **Dead/orphaned feature**: `welcomeSettings` state, `fetchWelcomeSettings()`, and `saveWelcomeSettings()` are fully implemented (fetch on mount, POST-style update function) but there is **no UI element anywhere in this file that renders `welcomeSettings` fields or calls `saveWelcomeSettings()`** — only the two visible tabs are "Accounts & Status" and "Message Templates". This looks like a "Welcome Message Automation" settings tab that was removed from the JSX without removing its backing state/handlers.
- Template creation validates: name required, body text required, language code must be exactly 2 chars, media-file headers rejected (not yet implemented — text headers only), max 3 buttons.
- Handles four distinct backend error shapes on template create/update via `error.response?.data?.error_type`: `token_expired` (opens `TokenUpdateModal`), `duplicate_template`, `template_rejected` (opens a rejection-reason dialog with a "suggested action"), `validation_error`.
- Right sidebar (Accounts tab) shows a static webhook URL (`.../api/webhook/whatsapp?id={user.id}`) and hardcoded verify token `123abc`, same pattern as the Facebook Lead Forms page.
- "New Template" button is disabled if there are zero accounts or any account is still missing a `phone_number` (unconfigured shell).
