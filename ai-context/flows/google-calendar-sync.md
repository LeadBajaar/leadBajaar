---
type: flow
slug: google-calendar-sync
featuresInvolved: [meetings]
---
# Flow: Google Calendar Sync (Connect / Disconnect / Availability)

There are two competing implementations in the repo for Google Calendar integration. Only one is actually wired up.

## A. Live/working path

1. User goes to the **Integrations** feature (another cluster) and opens `GoogleAccountCard` (`src/components/integrations/GoogleAccountCard.tsx`).
2. On mount, the card calls `googleIntegrationApi.getStatus()` → axios `GET /google/status` (Laravel backend, Bearer token) to show connected/disconnected state.
3. User clicks Connect → `googleIntegrationApi.getConnectUrl(scope?)` → axios `GET /google/connect` returns an OAuth consent `url`; the frontend does `window.location.href = url`, handing off entirely to the Laravel backend for the OAuth dance (code exchange, token storage happen server-side, not in this Next.js app).
4. User clicks Disconnect → `googleIntegrationApi.disconnect()` → axios `DELETE /google/disconnect`.
5. Any downstream "check my calendar for conflicts" / availability-sync logic driven by this connection lives entirely in the Laravel backend — nothing in this frontend repo reads Google Calendar free/busy data directly.

All three `googleIntegrationApi` calls are defined at `src/lib/api.ts:2154-2184`. See [api/calendar-scheduling.md](../api/calendar-scheduling.md).

## B. Dead/orphaned path (do not build on this)

This path exists in the repo but is not reachable from any live UI:

1. `src/app/(dashboard)/meetings/event-types/[id]/components/CalendarIntegration.tsx` renders Connect/Disconnect buttons for Google/Outlook/Apple calendars and a "Check for Conflicts" switch, backed by `new CalendarService()` (`src/lib/services/calendar.ts`). **This component is never imported by `SchedulingTab.tsx` or any other page** (verified by repo-wide search) — it does not render anywhere.
2. `CalendarService.connectCalendar('google')` calls `fetch('/api/calendar/google')` (a Next.js route handler using `google-auth-library` directly) to get an auth URL, then redirects. That route's `POST` handler exchanges the code for tokens but only has a comment — `// Store tokens securely in your database` — with no actual persistence implemented.
3. `src/app/api/calendar/google/callback/route.ts` is the intended OAuth redirect target, but nothing in the `google/route.ts` auth-URL generation sets its redirect URI to this path (that comes from `process.env.GOOGLE_REDIRECT_URI`, unverified in this codebase), and it performs no session check.
4. `src/app/api/calendar/availability/route.ts`, `src/app/api/calendar/calendars/route.ts`, and `src/app/api/calendar/google/disconnect/route.ts` all guard on `getServerSession(authOptions)` from `next-auth` — but **no `next-auth` catch-all route exists** (`src/app/api/auth/*` is empty), so these handlers can never actually obtain a session in production; every request would 401.
5. Separately, the "Connect Google Calendar" button on [`/meetings/event-types`](../pages/meetings-event-types.md) points at `window.location.href = '/api/auth/google'` — a path that doesn't exist anywhere in the routes above either. Clicking it 404s.

## Takeaway for future work
If asked to "fix" or "wire up" Google Calendar sync inside the Meetings feature, the correct move is almost certainly to reuse path A (`googleIntegrationApi`, already working in Integrations) rather than resurrecting path B's `next-auth`/`googleapis` scaffold, which appears to be an earlier, abandoned implementation attempt.
