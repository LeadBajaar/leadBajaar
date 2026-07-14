---
type: component-group
group: automated-sync
directory: src/components/automated-sync
usedByFeatures: []
---
# Components: automated-sync

## AutomatedSyncDashboard
- Path: `src/components/automated-sync/AutomatedSyncDashboard.tsx`
- Purpose (as built): Dashboard intended to show the health of a background job that periodically catches lead-sync failures/webhook misses (sync status, health score, today/this-week processed/new/existing/error counts, "Manual Sync" trigger, static "Recent Activity" feed).
- Key props: none.
- **Entirely mock data — not wired to any real API.** `fetchSyncStatus()` and `fetchSyncStats()` both have their real `api.get(...)` calls commented out and instead `setState` with hardcoded literal objects (e.g. `lastRun: '2024-01-15T10:30:00Z'`, `healthScore: 95.6`). The "Manual Sync" button's handler also has its `api.post('/automated-sync/trigger')` call commented out — it only shows a success toast and re-runs the same mock fetchers. The "Recent Activity" list is static JSX, not data-driven.
- **Not imported or rendered anywhere in the codebase** (confirmed via repo-wide search — no other file references `AutomatedSyncDashboard`). Status: unused placeholder component, not reachable from any route in this cluster or elsewhere.
- If a real automated-sync feature is built later, this component is the closest existing scaffold, but its API surface (`/automated-sync/status`, `/automated-sync/stats`, `/automated-sync/trigger`) does not exist in `src/lib/api.ts` today.
