---
type: page
route: /integrations/email-marketing
file: src/app/(dashboard)/integrations/email-marketing/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/email-marketing

## Purpose
Standalone configuration page for the workspace's transactional/marketing email sending provider (Amazon SES, direct SMTP, or Mailgun), plus a "send test email" action.

## Components used
- `TestEmailDialog` (`@/components/integrations/TestEmailDialog`).
- Plain shadcn `Select`/`Input`/`Button` for provider fields — this page does **not** reuse `EmailConfigDialog` from `@/components/integrations`; it reimplements the same form inline (duplicate of the hub page's embedded `EmailConfigDialog` content).

## Data/API calls
- `(integrationApi as any).get('/email/configurations')` on mount — loads the active config (`is_active` or first result) into local state.
- `api.put('/email/configurations/{id}')` or `api.post('/email/configurations')` (method chosen by presence of `emailConfig.id`) — save.
- `api.post('/email/configurations/test', { email })` — send test email.
- Dispatches `window.dispatchEvent(new Event('integrationsUpdated'))` after save so the sidebar re-checks `emailEnabled`.

## Notable behavior
- No `RoleGuard` wrapper on this page (unlike the hub and a couple of other sub-pages in this cluster).
- Provider-specific fields: SES → `credentials.{key,secret,region}`; SMTP → `credentials.{host,port,username,password}`; Mailgun has no dedicated fields shown here (falls through with only the shared Sender Name/Email fields — likely relies on backend-side Mailgun API key config not exposed in this UI).
- Back button routes to `/integrations`.
