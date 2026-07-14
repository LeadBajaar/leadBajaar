---
type: context-pack
name: meeting-system
description: Cal.com-style scheduling — internal event-type/booking management plus public, unauthenticated booking pages.
features: [meetings]
dependencies: [core-platform-system, integration-system]
generatedAt: 2026-07-04
---

# Context Pack: Meeting System

## Purpose
Lets a workspace define bookable "event types" (duration, location, custom questions, availability) and manage the resulting bookings, while external visitors book a slot through a public, unauthenticated page. Also the entry point for the (partially dead) Google Calendar sync layer.

## Features included
| Feature | Status | Plan key | Doc |
|---|---|---|---|
| Meetings & Scheduling | active | `meetings` | [../features/meetings.md](../features/meetings.md) |

## Pages included
- `/meetings` — bookings list/detail — [../pages/meetings.md](../pages/meetings.md)
- `/meetings/event-types` — event type list, share/embed — [../pages/meetings-event-types.md](../pages/meetings-event-types.md)
- `/meetings/event-types/[id]` — event type editor (Basic/Questions/Scheduling/Team tabs) — [../pages/meetings-event-type-detail.md](../pages/meetings-event-type-detail.md)
- `/book/[eventTypeId]` — **public**, unauthenticated — [../pages/public-booking-by-event-type.md](../pages/public-booking-by-event-type.md)
- `/[username]/[eventSlug]` — **public**, unauthenticated, near-duplicate of the above — [../pages/public-booking-by-username.md](../pages/public-booking-by-username.md)

## APIs involved
- [api/calendar-scheduling.md](../api/calendar-scheduling.md) — the **live path**: `eventTypeService.getAll/getById/create/update/delete` (`src/services/event-types.ts`), `getBookings/updateBooking/deleteBooking/rescheduleBooking` (`src/lib/api.ts`), plus raw `fetch()` calls from the two public pages straight to `{API_BASE_URL}/event-types/*` and `{API_BASE_URL}/bookings` (no auth header, by design).
- `googleIntegrationApi` (documented under [integration-system.md](integration-system.md)'s [api/integrations.md](../api/integrations.md)) — the **actually-working** Google Calendar connect/disconnect, surfaced via `GoogleAccountCard` on `/integrations`, not inside this system's own pages.
- **Dead path, do not build against it**: `src/app/api/calendar/*`, `src/app/api/event-types/*` Next.js route handlers and `src/lib/services/calendar.ts` (`CalendarService`, direct `googleapis` calls) depend on `next-auth` sessions that don't exist anywhere in this repo — see Known issues.

## State contexts involved
None. This system reads `useUser()`/`hasFeature('meetings')` from [core-platform-system.md](core-platform-system.md) but owns no state of its own.

## External integrations
- **Laravel backend** — event types, bookings, availability (both authenticated and the two public raw-`fetch` pages).
- **Google Calendar / OAuth** — reachable only through [integration-system.md](integration-system.md)'s `googleIntegrationApi → Laravel → Google` path. The direct-to-`googleapis` path in this system's own `src/lib/services/calendar.ts` is dead code (see Known issues) — never extend it, extend the Integrations path instead.

## Business flows
- [../flows/meeting-scheduling-public-flow.md](../flows/meeting-scheduling-public-flow.md) — external visitor books a slot end to end.
- [../flows/google-calendar-sync.md](../flows/google-calendar-sync.md) — full breakdown of the working vs. dead calendar-sync paths.

## Dependencies on other systems
- **→ [core-platform-system.md](core-platform-system.md)**: auth/plan gating (`hasFeature('meetings')`), `teamApi.getMembers` for the "Assigned To" host picker.
- **→ [integration-system.md](integration-system.md)**: the real Google Calendar connect/disconnect UI and API live there (`GoogleAccountCard`, `googleIntegrationApi`); this system's own "Connect Google Calendar" button currently points at a dead link (see Known issues) instead of that flow.

## Mermaid architecture diagram

```mermaid
flowchart LR
    meetings["/meetings"] --> booking_api[api/calendar-scheduling]
    meetings --> team_api["api/team (core-platform)"]
    metypes["/meetings/event-types"] --> booking_api
    metypes -.->|"Connect Google Calendar button -> /api/auth/google, dead route"| deadlink[dead link]
    metypedetail["/meetings/event-types/:id"] --> booking_api

    bookpublic["/book/:eventTypeId"] -.->|"raw fetch, no auth header"| laravel[(Laravel backend)]
    bookuser["/:username/:eventSlug"] -.->|"raw fetch, no auth header"| laravel
    booking_api --> laravel

    subgraph Dead code, do not extend
        nextauth_routes["src/app/api/calendar/*, src/app/api/event-types/*"]
        calendarservice["src/lib/services/calendar.ts CalendarService"]
    end
    nextauth_routes -.->|"depends on next-auth sessions that don't exist"| calendarservice
    calendarservice -.->|"unreachable"| googlecal[(Google Calendar API)]

    google_api["googleIntegrationApi, integration-system"] -->|"the real, working path"| laravel
    laravel -->|"server-side"| googlecal
```

## Known issues
1. **Two disconnected Google Calendar implementations.** The working one is `googleIntegrationApi` via the Integrations feature. The other — `src/app/api/calendar/*`/`src/app/api/event-types/*` Next.js routes plus `CalendarService` (`src/lib/services/calendar.ts`) — depends on `next-auth` sessions (`getServerSession`) that don't exist anywhere in this repo (no `next-auth` route defined), and its consuming components (`CalendarIntegration.tsx`, `CalendarSelection.tsx`) are never imported by any page. Treat this whole sub-path as inert scaffold.
2. **Dead link**: the "Connect Google Calendar" button on `/meetings/event-types` points at `/api/auth/google`, which does not exist in the repo — clicking it 404s.
3. **`/book/[eventTypeId]` and `/[username]/[eventSlug]` are near line-for-line duplicates**, differing only in the event-type lookup param — a maintenance risk if one is patched and not the other.
4. `meetings/event-types/[id]/page.tsx` uses the legacy `useToast` instead of `sonner`.

## Common implementation patterns
- **Public pages bypass `src/lib/api.ts` entirely** and call the Laravel backend with raw `fetch()` (no auth header, `cache: 'no-store'` on availability lookups) — this is intentional for unauthenticated surfaces, not a bug to "fix" by adding auth.
- **Internal pages go through `eventTypeService`** (`src/services/event-types.ts`) rather than `src/lib/api.ts` directly for event-type CRUD, while bookings themselves (`getBookings`/`updateBooking`/etc.) are plain `src/lib/api.ts` exports — two slightly different call conventions coexist in the same feature, be consistent with whichever you're extending.
- **No `RoleGuard` on the event-type CRUD pages** — only `/meetings` itself is guarded; if adding new sub-routes here, decide deliberately whether to add a guard rather than following the existing gap.

## Files to load before modifying this system
1. `src/app/(dashboard)/meetings/page.tsx`, `meetings/event-types/page.tsx`, `meetings/event-types/[id]/page.tsx`.
2. `src/app/book/[eventTypeId]/page.tsx` and `src/app/[username]/[eventSlug]/page.tsx` — remember these are near-duplicates, change both together.
3. `src/services/event-types.ts`, `src/lib/api.ts` (bookings functions + `googleIntegrationApi` only).
4. Do **not** start from `src/lib/services/calendar.ts` or `src/app/api/calendar/*` — confirmed dead code, per Known issues.
5. This pack's linked feature/api docs, plus [../flows/google-calendar-sync.md](../flows/google-calendar-sync.md) before touching anything calendar-related.

## Manual Notes
_None yet. Add notes here for anything this pack should account for that isn't derivable from the generated docs — this section is preserved verbatim across regenerations (see [../ai-rules.md](../ai-rules.md))._
