---
type: page
route: /automations
file: src/app/(dashboard)/automations/page.tsx
feature: automations
auth: protected
---
# Page: /automations

## Purpose
Manage lead-nurturing automation. Tab 1 "Drip Sequences": list/create/edit multi-step sequences triggered by lead creation, stage change, or manual enrollment, with stat tiles for active sequence count and total enrollments. Tab 2 "Global Triggers": embeds `GlobalAutomationsSettings`.

## Components used
`src/components/ui/*` primitives (Card, Button, Input, Label, Badge, Separator, Dialog, Select, DropdownMenu, Tabs) plus `GlobalAutomationsSettings` (`@/components/automations/GlobalAutomationsSettings`) and `RoleGuard` (`@/components/RoleGuard`). See [components/automations](../components/automations.md).

## Data/API calls
Calls `api.*` (`@/lib/api`) directly in the page — no dedicated automations service module:
- `GET /automations` — list sequences
- `GET /email/templates` — populate email-step template picker
- `GET /stages` — populate stage picker for `stage_changed` trigger / `update_stage` action
- `POST /automations` — create sequence
- `PUT /automations/{id}` — update sequence
- `POST /automations/{id}/toggle` — pause/resume a sequence

## Notable behavior
- Wrapped in `<RoleGuard allowedTypes={['agency','super_admin','individual']} allowedFeatures={['automations']}>`.
- Sequence step builder supports 4 action types: `send_email` (requires `template_id`), `send_whatsapp` (provider-dependent: `personal`/`cloud_api` need a `whatsapp_template_name`, `evolution` needs a free-text `whatsapp_message`), `update_stage` (requires `action_value` = target stage name), `wait` (no config).
- Save is blocked client-side with a toast if any email step is missing a template.
- All steps for a sequence are submitted together as `{ ...currentSequence, steps: newSteps }` in one create/update call — no per-step endpoint.
