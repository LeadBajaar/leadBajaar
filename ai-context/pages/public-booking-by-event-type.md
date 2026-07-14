---
type: page
route: /book/[eventTypeId]
file: src/app/book/[eventTypeId]/page.tsx
feature: meetings
auth: public
---
# Page: /book/[eventTypeId]

## Purpose
**Public, unauthenticated** booking page addressed by numeric/opaque event-type ID rather than owner username. An external visitor picks a date/time and answers the event type's custom questionnaire to create a booking. Functionally identical to [public-booking-by-username](./public-booking-by-username.md) — differs only in how the event type is resolved (by ID here vs. `username`+`slug` there); the two files are near-duplicate implementations.

## Components used
`src/components/ui/*` primitives directly: Button, Card, `CustomCalendar` (`@/components/ui/custom-calendar`), Avatar, Input, Label, Textarea, RadioGroup, Checkbox, Select, Dialog. No shared "booking" component folder — all step logic (calendar step, questionnaire step, success state) lives inline in this page component.

## Data/API calls
This page bypasses `src/lib/api.ts` entirely and calls the Laravel backend directly via raw `fetch()` against `API_BASE_URL` (from `@/lib/api`), with **no auth header** (correct, since this is a public surface):
- `GET {API_BASE_URL}/event-types/{eventTypeId}` — load event type, questions, scheduling rules, owner
- `GET {API_BASE_URL}/event-types/{id}/availability?date&timezone&duration&buffer_before&buffer_after` — available time slots for a chosen date (`cache: 'no-store'`)
- `POST {API_BASE_URL}/bookings` — create the booking, body `{ eventTypeId, date, time, duration, timezone, answers }`

## Notable behavior
- **Security/context note**: fully unauthenticated — no session, no CSRF token, no rate-limit visible in this file. Anyone with the URL can view the event type's owner name/avatar and submit bookings.
- `?embed=true` query param strips page chrome (for the iframe embed snippet generated on `/meetings/event-types`).
- Client-side date availability (`isDateAvailable`) prefers `scheduling.timeSlots[].daysOfWeek` (day-of-week numbers) over the legacy `scheduling.availableDays` string-name array, per an inline comment noting the former is the real source of truth.
- Answers are validated per-question via `validateQuestionResponse` (`@/lib/validations/questions.ts`) both incrementally (multi-step questionnaire wizard) and again in bulk before submit.
- Handles the double-booking race: if the backend returns 422 / "slot no longer available" / "group slot already full", the UI evicts that slot from `availableSlots` and prompts the visitor to pick another, showing a `sonner` toast.
- On success, optionally auto-redirects to `eventType.redirect_url` after 2.5s.
- Cross-reference: end-to-end flow documented in [meeting-scheduling-public-flow](../flows/meeting-scheduling-public-flow.md).
