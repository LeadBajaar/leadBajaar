---
type: feature
slug: dashboard
name: Dashboard (Honest Home)
status: active
roles: [Super Admin, Admin, Manager, Agent]
userTypes: []
planFeatureKey: dashboard
routes: ["/dashboard"]
relatedDocs:
  pages: [pages/dashboard.md]
  components: [components/ui-primitives.md, components/state.md]
  design: [design/tokens.md]
  api: [api/auth.md, api/dashboard-analytics.md, api/calendar-scheduling.md, api/chat-messaging.md]
  flows: []
---

# Feature: Dashboard (Honest Home)

## Summary
Landing page after login. Rebuilt as "Honest Home" (2026-07-05): the fabricated-demo-data fallback is gone. The page now has three real modes — **Setup Mode** (new/near-empty accounts get a 4-step checklist instead of stats), **Working Mode** (Today Strip + stat grid + pipeline + recent activity, all from real endpoints), and **Error Mode** (never fabricates data; retries; dims and keeps showing last-known-good data via a `localStorage` cache when a refresh fails). Available to every role (`Super Admin`, `Admin`, `Manager`, `Agent`) with no plan/type restriction — the universal home route, gated only by `feature: 'dashboard'` in the sidebar nav.

## Access control
Unchanged: sidebar entry `roles: ['Super Admin', 'Admin', 'Manager', 'Agent']`, no `types`/`plans` restriction, `feature: 'dashboard'`. No page-level `RoleGuard` — access is enforced by the sidebar link visibility and `(dashboard)/layout.tsx`'s `UserProvider` + `SubscriptionGuard`.

## Key files
- `src/app/(dashboard)/dashboard/page.tsx` — top-level state machine (loading/success/error, stale-cache handling, setup-mode gate) and the two modals (QR download, become-a-tester).
- `src/app/(dashboard)/dashboard/TodayStrip.tsx` — meetings today, unread conversations, automation health (placeholder — see Known issues).
- `src/app/(dashboard)/dashboard/StatGrid.tsx` — the 4 clickable stat cards (leads/meetings/conversion/response), semantic delta chips, tabular numbers.
- `src/app/(dashboard)/dashboard/SetupChecklist.tsx` — shared between Setup Mode's hero list and the persistent compact footer chip.
- `src/app/(dashboard)/dashboard/PipelineCard.tsx`, `ActivityCard.tsx` — pipeline funnel and recent-activity feed, each with a real `EmptyState` for the zero-data case.
- `src/lib/api.ts` — `getDashboardStats()` (`GET /dashboard/stats`), `submitTesterRequest()` (`POST /tester-requests`), `integrationApi.getConnectedIntegrations()` (`GET /integrations/connected`), `getBookings()` (`GET /bookings`), `getLeadsWithLatestMessages()` (`GET /conversations`) — all pre-existing endpoints, no backend changes made.
- `src/services/event-types.ts` (`eventTypeService.getAll()`, `GET /event-types`) — used for the "create your booking page" checklist item.
- `src/components/state/*` — `EmptyState`, `ErrorState`, `SkeletonDashboard`, `DismissibleCard` (see [components/state.md](../components/state.md)).
- `src/components/overview.tsx` — the old monthly bar chart component. **No longer rendered** by this page (superseded by the Today Strip + stat grid + pipeline); left in place in case another page still uses it — not verified in this pass.

No demo/preview harness route exists for this feature — verify changes directly against the real `/dashboard` route.

## Data sources (all pre-existing, no new backend endpoints)
| Slot | Source | Notes |
|---|---|---|
| Stats, pipeline, recent activity | `getDashboardStats()` | Same endpoint as before; response is used as-is, no more empty/zero-value override |
| Meetings today | `getBookings({ type: 'upcoming', per_page: 50 })`, filtered client-side by `start_time` === today | No dedicated "today" backend filter exists — see Known issues |
| Waiting conversations | `getLeadsWithLatestMessages()`, counted where `unread_count > 0` | |
| Facebook connected | `integrationApi.getConnectedIntegrations()`, `type === 'facebook_auth' && is_active` | |
| WhatsApp connected | same call, `type === 'whatsapp' \|\| type === 'evolution'` | |
| Has a booking page | `eventTypeService.getAll()`, `length > 0` | |
| Has a first lead | `data.stats` entry with `key === 'leads'`, value `> 0` | |
| Automation health | **none** | See Known issues — rendered as an honest "Not available yet" placeholder, not a fabricated number |

## Behavior notes
- **Stale-data pattern**: successful fetches are cached to `localStorage` (`lb_dashboard_cache_v1`) with a timestamp. Every mount/retry always shows the loading skeleton first (no eager cache hydration — a fresh load always feels fresh). The cache is consulted **only on fetch failure**: if the live request fails and a cached response exists, that cached data renders dimmed with a "Couldn't refresh — showing data from {time}" banner and a retry button, instead of the full-page error; only a failure with no cache at all shows `ErrorState`.
- **Setup Mode gate**: `checklistReady && leadsCount === 0 && completedChecklistItems < 2`. Deliberately waits for the checklist calls to resolve before committing to a mode, to avoid flashing an established account into Setup Mode. **Known cosmetic gap**: on a brand-new account's very first paint, if `getDashboardStats()` resolves before the checklist calls, Working Mode's stat grid can flash briefly before flipping to Setup Mode. Not fixed in this pass — see Remaining gaps.
- **Semantic delta coloring**: each stat's trend arrow is colored by whether the direction is actually good for that metric (`upIsGood`, defaulted `true`, set `false` for `response`) — a rising average-response-time is colored as a regression (red), not a naive "up = green."
- Persists "banner minimized" `localStorage` key is gone — the Android app promo is now a `DismissibleCard` (`dashboard-mobile-app-promo`) at the bottom of Working Mode, demoted from the old full-width hero per the Honest Home principle that promos never outrank content. Functionality (QR modal, become-a-tester form) is unchanged, just relocated.
- Toast calls migrated from the legacy `useToast` to `sonner` (`toast.success`/`toast.error`) on this page as part of this pass — see Known issues in [components/ui-primitives.md](../components/ui-primitives.md) for the app-wide migration status (still incomplete elsewhere).
- Dynamic Lucide icon rendering via `(LucideIcons as any)[name]` for `recent_activity.icon_name` is unchanged (now lives in `ActivityCard.tsx`) — falls back to `Zap` if the backend sends an unknown icon name.
- Analytics (`/analytics`, `getAnalyticsData()`) remains a separate feature, not covered here.

## Known issues
1. **No backend endpoint for automation health** (paused/failed enrollment counts) — the Today Strip's third slot is a placeholder ("Not available yet", links to `/automations`) rather than a fabricated number. See the `TODO(backend)` comment in `TodayStrip.tsx`. Needs something like `GET /automations/health` before this slot can show real data.
2. **No backend "meetings today" filter** — the frontend fetches up to 50 upcoming bookings and filters by `start_time` client-side; an account with >50 upcoming bookings could undercount today's meetings. A `GET /bookings?date=today` (or similar) would remove this limitation.
3. **Setup-vs-Working Mode flash** on a brand-new account's first paint (see Behavior notes) — cosmetic only, not fixed in this pass.
4. **`leadsCount` parsing assumes `data.stats` contains a `key: 'leads'` entry with a numeric-or-numeric-string `value`** — if the backend ever renames or omits this key, the checklist's "add a lead" item silently falls back to "unknown" (never triggers Setup Mode incorrectly, but also won't tick off the checklist item). Verify against the real `DashboardController::stats()` response if this checklist item is ever reported as stuck.

## Superseded
The `demoDashboardData` fallback and its `isDemo` state (previously the top item in this section) are **deleted**, not just deprecated — grep confirms no remaining references in `page.tsx`.
