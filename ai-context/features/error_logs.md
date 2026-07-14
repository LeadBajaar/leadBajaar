---
type: feature
slug: error_logs
name: Application Error Monitoring
status: active
roles: [Super Admin]
userTypes: [super_admin]
planFeatureKey: error_logs
routes: ["/admin/errors"]
relatedDocs:
  pages: [admin-errors]
  components: []
  api: []
  flows: [super-admin-governance]
---
# Feature: Application Error Monitoring

## Summary
A live-tail viewer for backend application error/crash logs. Shows summary tiles (total errors, API failures, client crashes, environment), a searchable/filterable table of log entries with expandable rows revealing raw JSON metadata and system context (environment, IP, HTTP status, client time), and a destructive "Clear Logs" action.

## Access control
- Page wrapped in `RoleGuard allowedFeatures={['error_logs']}` (`src/app/(dashboard)/admin/errors/page.tsx`) — no explicit `allowedRoles`/`allowedTypes`, so gating relies entirely on the `error_logs` feature flag (which Super Admin always passes).
- Sidebar entry "Error Logs" (`src/components/sidebar.tsx` line ~64): `roles: ['Super Admin']`, `types: ['super_admin']`, `feature: 'error_logs'`.

## Key files
- Page: `src/app/(dashboard)/admin/errors/page.tsx`
- Uses the generic `api` axios instance directly (not a dedicated `errorLogsApi` group in `src/lib/api.ts`): `api.get('/errors')` and `api.delete('/errors/clear')`.
- No dedicated `components/` folder — built from `src/components/ui/*` (Card, Table, Badge, Input).

## Notes
- This page calls raw `api.get`/`api.delete` rather than a named function in `src/lib/api.ts`, unlike every other feature in this cluster — worth adding a proper `errorLogsApi` wrapper for consistency if this codebase convention (`docs`/`context/ai-context.md` rule #2: "always use `src/lib/api.ts`... never fetch directly in components") is meant to be strict; currently it is a partial exception (still goes through the shared `api` axios instance, just not a named export).
- `getStatusColor()` heuristically colors rows by matching substrings in `log.message` (`Crash`, `422`/`Validation`, `401`) — purely a client-side display heuristic, not derived from a structured severity field.
- The environment stat card is hardcoded to display `"local"` rather than reading from `log.env` or a config value.
