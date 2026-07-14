---
type: component-group
group: state
directory: src/components/state
usedByFeatures: [dashboard]
---

# Components: state

Reusable state-handling primitives — the standard way any screen should represent "loading / empty / error" instead of writing its own ad hoc conditional per page. Built on the tokens in [design/tokens.md](../design/tokens.md). First adopted by the [dashboard](../features/dashboard.md) ("Honest Home" rebuild, 2026-07-05) — see that doc for the reference integration.

## Components

| File | Purpose |
|---|---|
| `EmptyState.tsx` | Generic empty state: optional lucide icon, title, description, up to two actions (`primaryAction`/`secondaryAction`, each `{ label, onClick?, href? }`), `size: 'sm' \| 'md' \| 'lg'`. Reusable across Leads, Inbox, Meetings, Integrations, Dashboard — deliberately has no feature-specific copy baked in. Used by `PipelineCard.tsx`/`ActivityCard.tsx`. |
| `ErrorState.tsx` | Generic error state: `title`/`description`, `onRetry` (sync or async — button shows an inline spinner and disables itself while pending), `supportHref`/`supportLabel`, `variant: 'inline' \| 'page'`, optional `lastUpdated` (renders "Showing data from {time}"). After a second consecutive failed retry, appends a line nudging toward the support link if one was provided. Used by `dashboard/page.tsx`. |
| `SkeletonCard.tsx` | Loading placeholder matched to real card geometry. `variant: 'stat' \| 'list' \| 'table' \| 'activity' \| 'form'`, optional `rows` for the repeatable variants. Built on the existing `.skeleton` CSS class (`styles/globals.css`) — not the shadcn `Skeleton` component (`components/ui/skeleton.tsx`), which uses a different, non-token-driven `bg-primary/10` fill; `.skeleton` is the one actually wired to `--crm-surface-3` and (as of this pass) reduced-motion. Used by `StatGrid.tsx`. |
| `SkeletonDashboard.tsx` | Full-page skeleton at the Honest Home working-mode layout's exact geometry: 3-column Today Strip, 4 stat cards, pipeline + activity row. Composes `SkeletonCard`. Used by `dashboard/page.tsx` for the first-load, no-cache case. |
| `DismissibleCard.tsx` | A card the user can permanently dismiss. Persists to `localStorage` under `lb_dismissed_<id>` (same pattern as the pre-existing `lb_dashboard_banner_minimized` key noted in `features/dashboard.md`, generalized). `persist={false}` for session-only dismissal. Respects `prefers-reduced-motion` (skips the collapse animation, just unmounts). Used by `dashboard/page.tsx` and `SetupChecklist.tsx`. |
| `index.ts` | Barrel export — `import { EmptyState, ErrorState, SkeletonCard, SkeletonDashboard, DismissibleCard } from "@/components/state"`. |

## Usage examples

**A standalone empty state:**
```tsx
import { EmptyState } from "@/components/state"
import { Search } from "lucide-react"

<EmptyState size="sm" icon={Search} title="No results" description="Try a different search term." />
```

**A dismissible setup nudge:**
```tsx
import { DismissibleCard } from "@/components/state"

<DismissibleCard id="finish-setup-booking-page">
  <p className="text-[13px]">Finish setup (1 of 4 left): Create your booking page</p>
</DismissibleCard>
```

**An error region with retry:**
```tsx
import { ErrorState } from "@/components/state"

<ErrorState variant="page" title="We couldn't load your dashboard" onRetry={refetch} />
```

## Suggested migration targets

`dashboard/page.tsx` is done. None of the rest have been touched yet — ranked by how much of the current UX gap each closes:

1. **`leads/page.tsx`** (list + kanban) — empty table/board today likely has no dedicated empty state.
2. **`live-chat/page.tsx`** / **`evolution/inbox/page.tsx`** — conversation list empty state, and a loading skeleton for the currently-unhandled initial fetch.
3. **`meetings/page.tsx`** and **`meetings/event-types/page.tsx`** — both list views likely lack a first-run empty state distinct from "table with zero rows."
4. **`integrations/page.tsx`** hub — connection-error states (a disconnected/expired integration) are a natural `ErrorState` (`variant="inline"`) use.
5. **`admin/errors/page.tsx`** / **`admin/emails/page.tsx`** — table-heavy admin screens with no documented empty/error handling today.
6. **`automated-sync/AutomatedSyncDashboard.tsx`** — currently mock-data-only (per `dependency-map.md`); once real API calls are restored, this is a candidate too.

## Notes
- **No `StateContainer` composing wrapper exists** — one was built during the dashboard rebuild but deleted (2026-07-05) because it was never actually adopted: `dashboard/page.tsx`'s state machine has an extra dimension (stale cached data during a background refetch) that a simple `loading/error/empty/success` union doesn't model, so the page composes `ErrorState`/`SkeletonDashboard` directly with its own status logic instead. If a future screen's needs are simpler (no stale-cache requirement), it's reasonable to reintroduce a thin wrapper — but don't assume one already exists.
- `SkeletonCard`'s five variants are geometry presets, not a general-purpose skeleton primitive — a screen with a genuinely different card shape should compose its own skeleton from the same `.skeleton` CSS class rather than force-fitting one of the five variants.
- `ErrorState` never fabricates data. If a screen wants to keep showing a stale cached value while a background refetch fails, that "dim the existing content + show a small inline banner" pattern is the caller's responsibility — `ErrorState` (as a full replacement of the content region) is for when there's nothing valid to show at all.
- `EmptyState`/`ErrorState` deliberately take no feature-specific copy as defaults (`ErrorState` has generic fallback copy; `EmptyState`'s `title` is required) — every call site should pass copy specific to what's actually empty/erroring.
- No Storybook/demo page exists in this repo for this component group — none was kept as scaffolding. Verify changes against the real `/dashboard` route.
