---
type: api
group: calendar-scheduling
sourceFile: src/app/api/calendar/*, src/app/api/event-types/*, src/lib/services/calendar.ts, src/services/event-types.ts, src/lib/api.ts (bookings + googleIntegrationApi)
usedByFeatures: [meetings]
---
# API: calendar-scheduling

## Important: two disconnected implementations

There are effectively **two separate, non-overlapping** sets of "calendar/event-type API" code in this repo:

1. **Live path** — used by the actual pages. Frontend calls the Laravel backend directly (via `src/lib/api.ts`'s Bearer-token axios instance, or raw `fetch()` on public pages). This is what real users hit.
2. **Dead/orphaned path** — a set of Next.js route handlers (`src/app/api/calendar/*`, `src/app/api/event-types/*`) and a `CalendarService` class (`src/lib/services/calendar.ts`) built around `next-auth` (`getServerSession`) and Google's `googleapis`/`google-auth-library` SDKs. No page or service in the codebase calls these Next.js routes, no `next-auth` route (`src/app/api/auth/*`) exists to issue the sessions they depend on, and the only components that import `CalendarService` (`CalendarIntegration.tsx`, `CalendarSelection.tsx` under `meetings/event-types/[id]/components/`) are themselves never imported by any page. Treat group 2 as inert scaffold code, not a documented contract for AI agents to build against.

## Live path — function/route table

| function/route | method+endpoint | params | purpose | file:line |
|---|---|---|---|---|
| `eventTypeService.getAll()` | axios GET `/event-types` (Laravel) | — | list event types | src/services/event-types.ts:5 |
| `eventTypeService.getById(id)` | axios GET `/event-types/{id}` | `id` | load one event type | src/services/event-types.ts:10 |
| `eventTypeService.create(data)` | axios POST `/event-types` | `EventType` body | create event type | src/services/event-types.ts:15 |
| `eventTypeService.update(id, data)` | axios PUT `/event-types/{id}` | `id`, partial `EventType` | update event type | src/services/event-types.ts:20 |
| `eventTypeService.delete(id)` | axios DELETE `/event-types/{id}` | `id` | delete event type | src/services/event-types.ts:25 |
| public fetch (event type) | raw `fetch` GET `{API_BASE_URL}/event-types/{eventTypeId\|eventSlug}` | id or slug, no auth | load event type for public booking page | src/app/book/[eventTypeId]/page.tsx:134; src/app/[username]/[eventSlug]/page.tsx:135 |
| public fetch (availability) | raw `fetch` GET `{API_BASE_URL}/event-types/{id}/availability` | `date`, `timezone`, `duration`, `buffer_before`, `buffer_after`, no auth | list open time slots for a date | src/app/book/[eventTypeId]/page.tsx:227; src/app/[username]/[eventSlug]/page.tsx:228 |
| public fetch (create booking) | raw `fetch` POST `{API_BASE_URL}/bookings` | `{ eventTypeId, date, time, duration, timezone, answers }`, no auth | create a booking from the public page | src/app/book/[eventTypeId]/page.tsx:455; src/app/[username]/[eventSlug]/page.tsx:456 |
| `getBookings(params)` | axios GET `/bookings` | `{ page?, per_page?, type?, search? }` | list bookings for `/meetings` (upcoming/history) | src/lib/api.ts:1588 |
| `deleteBooking(id)` | axios DELETE `/bookings/{id}` | `id` | cancel a booking | src/lib/api.ts:1592 |
| `updateBooking(id, data)` | axios PUT `/bookings/{id}` | `id`, `{ user_id?, notes?, outcome? }` | edit booking notes/outcome/host | src/lib/api.ts:1596 |
| `rescheduleBooking(id, data)` | axios PATCH `/bookings/{id}/reschedule` | `{ date, time, duration }` | reschedule a booking | src/lib/api.ts:1600 |
| `googleIntegrationApi.getStatus()` | axios GET `/google/status` | — | check whether the user's Google account is connected | src/lib/api.ts:2155 |
| `googleIntegrationApi.disconnect()` | axios DELETE `/google/disconnect` | — | disconnect Google account | src/lib/api.ts:2166 |
| `googleIntegrationApi.getConnectUrl(scope?)` | axios GET `/google/connect` | `scope?` | get the Google OAuth consent URL to redirect to | src/lib/api.ts:2175 |

`googleIntegrationApi` is consumed by `src/components/integrations/GoogleAccountCard.tsx` (Integrations feature, another cluster) — this is the real, working Google Calendar connect/disconnect UI. See `flows/google-calendar-sync.md`.

## Dead/orphaned path — for reference only

| route/class | method+endpoint | notes | file:line |
|---|---|---|---|
| `GET /api/calendar/availability` | Next.js route | requires `next-auth` session; proxies to Laravel `/api/calendar/availability`; no caller found | src/app/api/calendar/availability/route.ts:5 |
| `GET/PATCH /api/calendar/calendars` | Next.js route | requires `next-auth` session; proxies to Laravel `/api/calendars`; only caller is orphaned `CalendarSelection.tsx` | src/app/api/calendar/calendars/route.ts:5,39 |
| `GET/POST /api/calendar/google` | Next.js route | generates Google OAuth URL / exchanges code, using `google-auth-library` directly (no persistence implemented — comments say "Store tokens securely" but no code does it); only caller is orphaned `CalendarService.connectCalendar` | src/app/api/calendar/google/route.ts:10,25 |
| `GET /api/calendar/google/callback` | Next.js route | OAuth redirect target; no `next-auth` session check; not linked from `google/route.ts`'s redirect URI env var in any file read | src/app/api/calendar/google/callback/route.ts:4 |
| `POST /api/calendar/google/disconnect` | Next.js route | requires `next-auth` session; proxies to `NEXT_PUBLIC_API_URL/api/calendar/google/disconnect`; only caller is orphaned `CalendarService.disconnectCalendar` | src/app/api/calendar/google/disconnect/route.ts:5 |
| `GET/POST/PUT/DELETE /api/event-types` | Next.js route | requires `next-auth` session; proxies to Laravel `/event-types`; no caller found (real UI uses `eventTypeService` → axios directly, not this route) | src/app/api/event-types/route.ts:7,32,61,90 |
| `GET /api/event-types/[id]` | Next.js route | uses `next-auth` session optionally (`session?.accessToken`); proxies to Laravel; no caller found | src/app/api/event-types/[id]/route.ts:5 |
| `CalendarService` class | N/A (library, not a route) | wraps `googleapis` Calendar API v3 (list/freebusy/insert/update/delete events) plus `connectCalendar`/`disconnectCalendar` helpers that call the dead Next.js routes above | src/lib/services/calendar.ts:31 |

## Related types & validation
- `src/types/events.ts` — `EventType`, `Question`, `QuestionSection`, `SchedulingSettings`, `TimeSlot`, `TeamMember` (frontend shapes used by event type pages)
- `src/types/calendar.ts` — `CalendarCredential`, `Calendar`, `CalendarEvent`, plus a second, slightly different `SchedulingSettings`/`TimeSlot`/`Question` set (duplicated, not reused from `events.ts`) intended for the dead calendar-sync path
- `src/lib/validations/scheduling.ts` — `validateSchedulingSettings(settings)` (buffer/notice/overlap/timezone checks), `validateBookingRequest(request, settings)` — pure functions, not wired into any page read in this cluster (event type editor does its own inline validation instead)
- `src/lib/validations/questions.ts` — `validateQuestionResponse(type, value, label?)` — used live by both public booking pages for per-question validation (email/phone/date/time regex checks, with a phone-label heuristic that reclassifies a `text`-typed question as `phone` if its label contains "phone"/"mobile"/"whatsapp")
