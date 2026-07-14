---
type: component-group
group: custom-hooks
directory: src/hooks
usedByFeatures: [dashboard, account_settings, team_management, authentication]
---

# Hooks: src/hooks

## `use-toast.ts`
Legacy toast state manager (reducer + subscriber-list pattern, `TOAST_LIMIT = 1`, `TOAST_REMOVE_DELAY = 1_000_000`ms). Exports `useToast()` and `toast()`. Powers `src/components/ui/toast.tsx` + `toaster.tsx`. **Superseded by `sonner`** per repo convention (`context/ai-context.md`) — still used by `dashboard/page.tsx` for the tester-request toast, which is an inconsistency worth flagging if modernizing that page. Note: a second, near-identical copy of this same reducer/toast logic also lives at `src/components/ui/use-toast.ts` (`TOAST_LIMIT = 5`, `TOAST_REMOVE_DELAY = 5000`ms) — the two are not the same file and have different limits/delays; confirm which one a given import resolves to (`@/hooks/use-toast` vs `@/components/ui/use-toast`) since they are easy to conflate.

## `use-debounce.ts`
`useDebounce<T>(value, delay): T` — standard debounce hook, delays propagating a changing value by `delay`ms via `setTimeout`/cleanup. Generic, no dependencies beyond React.

## `use-media-query.ts`
`useMediaQuery(query: string): boolean` — wraps `window.matchMedia`, returns whether the query currently matches, and subscribes to `change` events for live updates. `'use client'` hook (browser-only).

## `echo.ts`
**Empty file** (contains a single whitespace character) — dead/stub file, not a functioning module. Do not import from it.

## `echo.js`
The real Laravel Echo/Pusher hook (a `.js` sibling to the empty `echo.ts`). Exports default `useEcho()`, which:
- Instantiates a `laravel-echo` `Echo` client configured for a `reverb` broadcaster, using `NEXT_PUBLIC_REVERB_APP_KEY`/`NEXT_PUBLIC_REVERB_HOST`/`NEXT_PUBLIC_REVERB_PORT` env vars.
- Wires a custom `authorizer` that calls `api.post('/broadcasting/auth', { socket_id, channel_name })` (from `src/lib/api.ts`) to authorize private/presence channel subscriptions using the app's own bearer-token auth rather than Echo's default cookie-based auth.
- Assigns `window.Pusher = Pusher` (required by laravel-echo's pusher transport) inside a `typeof window !== 'undefined'` guard.
- Disconnects the Echo instance on unmount.
- Used for real-time features (e.g. live chat) — not consumed by any page in this cluster's scope, but documented here since it's the only hook with meaningful side effects.

## Notes
- Having both `echo.ts` (empty) and `echo.js` (real implementation) in the same directory is almost certainly an accidental leftover from a migration — any import of `@/hooks/echo` in a bundler that resolves `.ts` before `.js` could silently import the empty stub instead of the real hook. Worth flagging as a cleanup candidate.
