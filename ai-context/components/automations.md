---
type: component-group
group: automations
directory: src/components/automations
usedByFeatures: [automations]
---
# Components: automations

Only one file exists in this directory. Meetings/scheduling has **no** dedicated component folder — event type pages compose `src/components/ui/*` primitives directly plus page-local subcomponents under `src/app/(dashboard)/meetings/event-types/[id]/components/` (documented in `pages/meetings-event-type-detail.md`), and the booking pages/meetings list build their own inline subcomponents in the page file itself.

## GlobalAutomationsSettings.tsx
Rendered inside the "Global Triggers" tab of `/automations` (`pages/automations.md`). Two independent toggle-able automation blocks, each with the same shape:
- **Welcome Message Automation** — send a WhatsApp message immediately when a new lead enters the pipeline.
- **Meeting Confirmation Automation** — send a WhatsApp message immediately when a lead books a meeting (cross-cuts into the Meetings feature's booking-creation event, though the wiring/trigger itself is backend-side and not visible in this file).

Each block lets the user pick a provider (`cloud` = WhatsApp Cloud API template, `personal` = personal WhatsApp bot free-text message, `evolution` = Evolution-linked device free-text message) and either a template ID (cloud) or a message body with `{{name}}`/`{{time}}` placeholders (personal/evolution), then save.

- Data calls (outside this cluster's assigned API scope, noted for completeness): `integrationApi.getWhatsAppAccounts()` to populate the cloud-template dropdown, `companyApi.getSettings()` / `companyApi.updateSettings()` to load/persist the toggle state and message content (all from `@/lib/api`, likely documented by the Integrations/Settings cluster).
- Uses `useToast` from `@/hooks/use-toast` (shadcn legacy toast hook), **not** `sonner` — inconsistent with the architecture doc's stated convention of using `sonner` exclusively.
