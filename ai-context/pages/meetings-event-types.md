---
type: page
route: /meetings/event-types
file: src/app/(dashboard)/meetings/event-types/page.tsx
feature: meetings
auth: protected
---
# Page: /meetings/event-types

## Purpose
Grid of the user's event types (bookable meeting templates). Lets the user create a new one-on-one or group event type, edit, preview the live public booking page, share/copy its link or an iframe embed snippet, or delete it.

## Components used
`src/components/ui/*` primitives only (Button, Card, Badge, Dialog, DropdownMenu, Skeleton, Tabs) plus `DeleteConfirmationModal` (`@/components/shared/DeleteConfirmationModal`) for delete confirmation. No dedicated component folder for this page.

## Data/API calls
- `eventTypeService.getAll()` — loads event types (src/services/event-types.ts, calls Laravel `/event-types` via `src/lib/api.ts` axios instance)
- `eventTypeService.delete(id)` — delete an event type
- No fetch on this page for Google Calendar; the "Connect Google Calendar" button just does `window.location.href = '/api/auth/google'` — **this route does not exist in the repo** (no `src/app/api/auth/*`), so this button is currently a dead link. See [google-calendar-sync flow](../flows/google-calendar-sync.md).

## Notable behavior
- Booking URL is constructed client-side as `${origin}/${username}/${slug-or-id}`, where `username` is derived from `eventType.owner?.name` (lowercased, spaces→dashes) or falls back to the logged-in `user.name` from `useUser()`. If neither name is present the URL is `#`.
- "Share Booking Link" dialog offers both a copyable link and a copyable `<iframe>` embed snippet (`?embed=true` query param, consumed by the public booking pages to hide chrome).
- New event type creation is blocked client-side with a toast if `user.name` is missing (username is required to form the booking URL).
- Links to `/meetings/event-types/new?type=one_on_one|group` and `/meetings/event-types/[id]` for edit — see [meetings-event-type-detail](./meetings-event-type-detail.md).
