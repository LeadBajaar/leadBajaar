---
type: page
route: /admin/errors
file: src/app/(dashboard)/admin/errors/page.tsx
feature: error_logs
auth: protected
subRoutes: []
---
# Page: /admin/errors

## Purpose
"Error Monitoring" — live-tail viewer of backend application error/crash logs, with summary tiles (Total Errors, API Failures, Client Crashes, Environment), a searchable table with expandable rows showing raw JSON metadata + system context, and a "Clear Logs" destructive action.

## Guard
`RoleGuard allowedFeatures={['error_logs']}` wraps the page.

## Data flow
`fetchLogs()` calls `api.get('/errors')` directly on mount (no dedicated named function in `src/lib/api.ts` — see notes in `../features/error_logs.md`) and populates `logs: AppErrorLog[]` (`{time, env, level, message, details}`).

## Key interactions
- **Refresh**: re-runs `fetchLogs()`.
- **Clear Logs**: native `confirm()` dialog → `api.delete('/errors/clear')`, then clears local state.
- **Row click**: toggles an expanded panel showing `log.details.data` as pretty-printed JSON plus environment/IP/HTTP-status/client-time chips.
- Client-side search filters on `log.message` and `log.time` substrings only (no server-side search param).

## Notes
- `getStatusColor(message)` is a naive substring-match heuristic ("Crash" → red, "422"/"Validation" → orange, "401" → purple, else blue) — not based on a real severity enum from the backend.
- The "Environment" stat card is hardcoded to display the string `"local"`.
- Defines a local inline `CheckCircle2` SVG component at the bottom of the file (duplicate of the Lucide icon of the same name, shadowing the import) — worth deduplicating if this file is touched again.

See also: `../features/error_logs.md`, `../flows/super-admin-governance.md`.
