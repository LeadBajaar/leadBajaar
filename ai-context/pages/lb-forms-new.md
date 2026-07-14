---
type: page
route: /lb-forms/new
file: src/app/(dashboard)/lb-forms/new/page.tsx
feature: lb_forms
auth: protected
---
# Page: /lb-forms/new

## Purpose
Three-pane drag-and-drop form builder for creating a new LB Form: left palette of field types, center canvas (draggable/reorderable field list + title/description), right panel that shows either the selected field's settings or the overall form settings (active/auto-lead/redirect URL) when no field is selected.

## Components used
- `DragDropContext`/`Droppable`/`Draggable` from `@hello-pangea/dnd` for field reordering.
- No custom sub-components — all inline shadcn primitives.

## Data/API calls
- `POST ${API_BASE_URL}/lb-forms` via raw `fetch` (manual bearer token) with body `{ title, description, fields, active, auto_create_lead, redirect_url, theme_color: '#3b82f6' }` — same non-`integrationApi` pattern as the list page.

## Notable behavior
- Field types: text, textarea, number, email, phone, date, checkbox, radio, select (`select`/`radio`/`checkbox` get a default 2-option `options` array).
- Clicking a field in the canvas selects it (`activeFieldId`) and swaps the right panel to per-field settings (label, placeholder, required toggle, and an options editor for choice-type fields); clicking elsewhere shows form-level settings.
- `theme_color` is hardcoded to `#3b82f6` (blue) at creation time — no color picker in this UI.
- On success, navigates back to `/lb-forms`.
- Shares ~90% of its code with `/lb-forms/[id]` (edit) — see [features/lb_forms.md](../features/lb_forms.md) Notes.
