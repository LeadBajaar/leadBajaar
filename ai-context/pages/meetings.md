---
type: page
route: /meetings
file: src/app/(dashboard)/meetings/page.tsx
feature: meetings
auth: protected
---
# Page: /meetings

## Purpose
Lists the current user's bookings ("meetings") split into **Upcoming** (card list, grouped by date, infinite scroll) and **History** (table, infinite scroll). Clicking a meeting opens a detail dialog to view lead/attendee info and questionnaire answers, edit notes/outcome/assigned host, reschedule, or cancel.

## Components used
All from `src/components/ui/*` primitives (Button, Card, Tabs, Badge, Textarea, Skeleton, Dialog, Select, Table, Calendar, Popover, Input) plus `RoleGuard` (`@/components/RoleGuard`). No dedicated `components/meetings/*` folder exists — the page defines its own local subcomponents inline: `MeetingDetailDialog`, `MeetingCard`, `MeetingsSkeleton`, and a `useInfiniteScroll` hook, all in this same file.

## Data/API calls
- `getBookings({ type: 'upcoming'|'history', page, per_page, search })` — initial load and infinite-scroll pagination (src/lib/api.ts:1588)
- `updateBooking(id, { user_id, notes, outcome })` — save edits from the detail dialog (src/lib/api.ts:1596)
- `deleteBooking(id)` — cancel a meeting (src/lib/api.ts:1592)
- `rescheduleBooking(id, { date, time, duration })` — reschedule (src/lib/api.ts:1600)
- `teamApi.getMembers()` — populates the "Assigned To" host picker

## Notable behavior
- Wrapped in `<RoleGuard allowedFeatures={['meetings']}>`.
- Group-event bookings sharing the same `event_type_id` + `start_time` are client-side merged into one card with multiple `attendees` (`groupRawBookings`/`mapBooking` helpers).
- Search is debounced 500ms and re-triggers both upcoming/history fetches from page 1.
- Quick-action `tel:`/`wa.me` links are rendered per lead phone number directly in the card and table rows.
- Links to `/meetings/event-types` via a header button.
- Cross-reference: event type editing lives on [meetings-event-types](./meetings-event-types.md) and [meetings-event-type-detail](./meetings-event-type-detail.md).
