---
type: page
route: /meetings/event-types/[id]
file: src/app/(dashboard)/meetings/event-types/[id]/page.tsx
feature: meetings
auth: protected
---
# Page: /meetings/event-types/[id]

## Purpose
Create/edit form for a single event type. `id === 'new'` renders the create flow (seeded with a default questionnaire and scheduling template); any other `id` loads and edits an existing event type. Tabbed UI: **Basic**, **Questions**, **Scheduling**, **Team**.

## Components used
Local, page-scoped components under `./components/` (not in `src/components/*`, so no shared component-group doc covers them):
- `BasicInfoTab.tsx` — title/description/duration/location/color/type/max_invitees fields
- `QuestionsTab.tsx` — questionnaire builder; delegates to `SortableQuestion.tsx` (drag handle via `@dnd-kit`), `QuestionSummary.tsx` (read view), `QuestionEditor.tsx` (edit-in-place form for a draft question)
- `SchedulingTab.tsx` — availability config; toggles between `TimeSlotManager.tsx` (weekly recurring slots + breaks) and `SpecificDateManager.tsx` (one-off date overrides)
- `TeamTab.tsx` — toggles which team members are assigned to handle bookings for this event type
- `CalendarIntegration.tsx`, `CalendarSelection.tsx` — **present in the folder but not imported by this page or any tab** (verified via repo-wide grep); dead code. See `features/meetings.md` Notes and `flows/google-calendar-sync.md`.
- Shared UI primitives: Button, Card, Tabs, Input, Textarea, Switch, Select, Dialog, Skeleton, LoadingSpinner (`@/components/ui/*`)

## Data/API calls
- `eventTypeService.getById(id)` — load existing event type (skipped when `isNew`)
- `eventTypeService.create(eventType)` / `eventTypeService.update(id, eventType)` — save, on the "Save Changes" button (src/services/event-types.ts)

## Notable behavior
- Uses the legacy `useToast` hook (`@/components/ui/use-toast`), **not** `sonner` — inconsistent with the rest of the app's documented toast convention.
- Client-side validation before save: title, description, duration required; group events require `max_invitees >= 2`. Backend 422 validation errors are merged into `formErrors` and surfaced in an error dialog.
- New-event defaults seed a NAME/PHONE (locked, non-deletable) plus several sample health-coaching questions and a Mon–Sat 09:00–17:00 schedule with two "Lunch Break" breaks — clearly demo/placeholder seed data, not a generic empty template.
- `?type=one_on_one|group` query param sets the initial `eventType.type` for new event types.
- Cross-linked from [meetings-event-types](./meetings-event-types.md) ("Modify" / dropdown "Edit Details").
