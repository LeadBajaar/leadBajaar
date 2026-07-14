---
type: feature
slug: automations
name: Automations (Drip Sequences & Global Triggers)
status: active
roles: [Super Admin, Admin]
userTypes: [agency, super_admin, individual]
planFeatureKey: automations
routes: ["/automations"]
relatedDocs:
  pages: [automations]
  components: [automations]
  api: []
  flows: []
---
# Feature: Automations

## Summary
Rule-based lead-nurturing automation, unrelated to the Meetings/scheduling system. Two modes on one page (tabs): **Drip Sequences** — multi-step sequences triggered by `lead_created`, `stage_changed`, or manual enrollment, with steps that send email, send WhatsApp (via `personal`/`cloud_api`/`evolution` provider), move a lead's pipeline stage, or just wait a delay; and **Global Triggers** — settings managed by a separate embedded component, `GlobalAutomationsSettings`.

## Access control
- Sidebar: `{ name: 'Automations', href: '/automations', roles: ['Super Admin','Admin'], types: ['agency','super_admin','individual'], feature: 'automations' }` (src/components/sidebar.tsx:56).
- Page wrapped in `<RoleGuard allowedTypes={['agency','super_admin','individual']} allowedFeatures={['automations']}>` (src/app/(dashboard)/automations/page.tsx:176), gated by `hasFeature('automations')`.

## Key files
- `src/app/(dashboard)/automations/page.tsx` — main page, sequence CRUD dialog, step builder
- `src/components/automations/GlobalAutomationsSettings.tsx` — "Global Triggers" tab content

## Notes
- Uses raw `api.get/post/put` calls directly in the page (`/automations`, `/automations/{id}`, `/automations/{id}/toggle`, `/email/templates`, `/stages`) rather than a dedicated service module — no `src/services/automations.ts` exists.
- WhatsApp step config branches by provider: `personal`/`cloud_api` collect a template name; `evolution` collects a free-text message ("sent via your linked Evolution device") — this ties into the separate Evolution WhatsApp integration (another cluster), noted here only for context.
- No dedicated API doc was produced for this feature per the assigned scope (only `src/components/automations/*` was in scope); the inline `api.*` calls are documented in `components/automations.md` instead.
