---
type: feature
slug: meetings
name: Meetings & Scheduling
status: active
roles: [Super Admin, Admin, Manager, Agent]
userTypes: [individual, agency, super_admin]
planFeatureKey: meetings
routes: ["/meetings", "/meetings/event-types", "/meetings/event-types/[id]", "/book/[eventTypeId]", "/[username]/[eventSlug]"]
relatedDocs:
  pages: [meetings, meetings-event-types, meetings-event-type-detail, public-booking-by-event-type, public-booking-by-username]
  components: [automations]
  api: [calendar-scheduling]
  flows: [meeting-scheduling-public-flow, google-calendar-sync]
---
# Feature: Meetings & Scheduling

## Summary
A Cal.com-style scheduling system. Internally, users manage "event types" (bookable meeting templates: 1-on-1 or group, with duration, location, custom questionnaire, and availability rules) and view/manage the resulting bookings ("meetings") on `/meetings`. Externally, unauthenticated visitors book a slot against a published event type via public pages at `/book/[eventTypeId]` or `/[username]/[eventSlug]`. A parallel, currently non-functional Google Calendar sync layer exists under `src/app/api/calendar/*` — see Notes.

## Access control
- Sidebar entry: `{ name: 'Meetings', href: '/meetings', roles: ['Super Admin','Admin','Manager','Agent'], feature: 'meetings' }` (src/components/sidebar.tsx:36) — no `types` restriction, so all account tiers see the nav item subject to role.
- `/meetings` page itself is wrapped in `<RoleGuard allowedFeatures={['meetings']}>` (src/app/(dashboard)/meetings/page.tsx:1149), gating by `hasFeature('meetings')` against `user.company.plan_details.features.permissions.meetings` (role-keyed) — see `src/contexts/UserContext.tsx`.
- Event type CRUD pages (`/meetings/event-types`, `/meetings/event-types/[id]`) have no explicit `RoleGuard`/role check in the files read — access is effectively gated only by being able to reach the route (protected dashboard layout) plus the sidebar link visibility.
- The two `/book/*` and `/[username]/*` pages are **public, unauthenticated** — no RoleGuard, no auth check, reachable by anyone with the link.

## Key files
- `src/app/(dashboard)/meetings/page.tsx` — bookings list/detail (internal)
- `src/app/(dashboard)/meetings/event-types/page.tsx` — event type list, share/embed dialog
- `src/app/(dashboard)/meetings/event-types/[id]/page.tsx` — event type editor (tabs: Basic/Questions/Scheduling/Team), local tab components under `./components/`
- `src/app/book/[eventTypeId]/page.tsx`, `src/app/[username]/[eventSlug]/page.tsx` — public booking pages
- `src/services/event-types.ts`, `src/lib/api.ts` (`getBookings`, `updateBooking`, `deleteBooking`, `rescheduleBooking`)
- `src/types/events.ts`, `src/lib/validations/scheduling.ts`, `src/lib/validations/questions.ts`

## Notes
- Real Google Calendar connect/disconnect UI lives in the **Integrations** feature (`src/components/integrations/GoogleAccountCard.tsx`, another cluster) via `googleIntegrationApi` (`src/lib/api.ts:2154`), which calls the Laravel backend directly (`/google/status`, `/google/connect`, `/google/disconnect`). This is the working path.
- The Next.js route handlers under `src/app/api/calendar/*` and `src/app/api/event-types/*`, plus `src/lib/services/calendar.ts` (`CalendarService`, using `googleapis`) and the `CalendarIntegration.tsx`/`CalendarSelection.tsx` components appear to be **dead/orphaned scaffold code**: they depend on `next-auth` sessions (`getServerSession`), a mechanism not used anywhere else in the app (the app uses Bearer-token axios via `src/lib/api.ts`); `CalendarIntegration`/`CalendarSelection` are never imported by any page; and the "Connect Google Calendar" button on `/meetings/event-types` points at `/api/auth/google`, a route that does not exist in the repo. Treat this whole sub-path as non-functional legacy code, not the real calendar-sync mechanism.
- See `flows/google-calendar-sync.md` for the full breakdown of working vs. dead paths.
