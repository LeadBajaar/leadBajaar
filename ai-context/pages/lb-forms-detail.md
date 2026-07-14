---
type: page
route: /lb-forms/[id]
file: src/app/(dashboard)/lb-forms/[id]/page.tsx
feature: lb_forms
auth: protected
---
# Page: /lb-forms/[id]

## Purpose
Edit view for an existing LB Form — identical builder UI to `/lb-forms/new` (drag-and-drop field canvas, field/form settings panel), pre-populated by fetching the form's current definition.

## Components used
- `DragDropContext`/`Droppable`/`Draggable` from `@hello-pangea/dnd`.
- No custom sub-components.

## Data/API calls
- `GET ${API_BASE_URL}/lb-forms/{id}` via raw `fetch` (manual bearer token, `cache: 'no-store'`) — populates `title`, `description`, `active`, `auto_create_lead`, `redirect_url`, `fields[]`.
- `PUT ${API_BASE_URL}/lb-forms/{id}` — save changes (same body shape as create, minus `theme_color`).

## Notable behavior
- No `RoleGuard` wrapper.
- Unlike the "new" page, save here does **not** navigate away — it shows a success toast and stays on the page (`handleUpdate` has no `router.push`).
- Nearly identical implementation to `/lb-forms/new/page.tsx`; the two could be merged into one component parameterized by `id` presence. See [features/lb_forms.md](../features/lb_forms.md) Notes.
