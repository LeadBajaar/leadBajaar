---
type: flow
slug: meeting-scheduling-public-flow
featuresInvolved: [meetings]
---
# Flow: Public Meeting Scheduling

End-to-end path from an internal user publishing a bookable event type to an external, unauthenticated visitor completing a booking.

1. **Internal user creates an event type.** On [`/meetings/event-types`](../pages/meetings-event-types.md), user picks "One-on-One Event" or "Group Event" from the "New Event Type" menu → navigates to [`/meetings/event-types/new?type=...`](../pages/meetings-event-type-detail.md).
2. **Configure the event type** across four tabs: Basic (title/description/duration/location/color), Questions (custom questionnaire, NAME/PHONE locked by default), Scheduling (weekly recurring time slots with breaks, or specific-date overrides; buffers; minimum notice; daily/weekly limits), Team (assign hosts). Saved via `eventTypeService.create()` → Laravel `POST /event-types` ([api/calendar-scheduling.md](../api/calendar-scheduling.md)).
3. **Get the public link.** Back on `/meetings/event-types`, user opens the share dialog (link icon or "Share/Embed") which builds `{origin}/{username}/{slug-or-id}` client-side, or copies an `<iframe src="...?embed=true">` embed snippet.
4. **External visitor opens the link.** Lands on [`/[username]/[eventSlug]`](../pages/public-booking-by-username.md) (vanity URL) or [`/book/[eventTypeId]`](../pages/public-booking-by-event-type.md) (direct ID link) — **both are unauthenticated public pages**, no login, no session.
5. **Event type loads.** Page does a raw, unauthenticated `fetch(GET {API_BASE_URL}/event-types/{id-or-slug})` to get title, description, duration, questions, scheduling rules, and owner display info.
6. **Visitor picks a date.** `CustomCalendar` restricts selectable dates using `isDateAvailable()`, which checks `scheduling.timeSlots[].daysOfWeek` (day-of-week numbers) as the primary source of truth, falling back to the legacy `scheduling.availableDays` string array if no `timeSlots` are configured.
7. **Available slots are fetched** for the chosen date via unauthenticated `fetch(GET {API_BASE_URL}/event-types/{id}/availability?date&timezone&duration&buffer_before&buffer_after)` — includes `spotsRemaining`/`maxInvitees` for group events.
8. **Visitor picks a time slot**, then clicks Next → moves to the questionnaire step (or straight to submit if the event type has no custom questions).
9. **Visitor answers questions** one at a time (multi-step wizard with a progress indicator); each answer is validated live via `validateQuestionResponse()` ([api/calendar-scheduling.md](../api/calendar-scheduling.md)) — email/phone/date/time format checks, plus a heuristic that treats a `text` question as a phone field if its label mentions phone/mobile/whatsapp.
10. **Submit.** All answers are re-validated in bulk, then `fetch(POST {API_BASE_URL}/bookings)` is called with `{ eventTypeId, date, time, duration, timezone, answers }`, still unauthenticated.
11. **Race handling.** If the backend responds 422 or with a "slot no longer available"/"group slot already full" message, the UI evicts that slot from the local list, shows a `sonner` error toast, and sends the visitor back to slot selection — it does not silently retry.
12. **Success.** On success the page shows a confirmation panel with date/time/duration and a note that a calendar invite was emailed; if the event type has a `redirect_url`, the visitor is auto-redirected there after ~2.5s.
13. **Internal user sees the booking.** The new booking now appears in [`/meetings`](../pages/meetings.md) (Upcoming tab), fetched via `getBookings({ type: 'upcoming' })`. Group-event bookings sharing the same event type + start time are merged client-side into one card listing all attendees.
14. **Internal user manages the booking** from the detail dialog on `/meetings`: edit notes/outcome/host (`updateBooking`), reschedule (`rescheduleBooking`), or cancel (`deleteBooking`).

Security note: steps 4–11 are entirely unauthenticated by design (this is the public booking surface), so anything the event type owner puts in the title/description/questions is visible to any visitor with the link, and there is no visible rate-limiting or CSRF protection in the frontend code for the booking POST.
