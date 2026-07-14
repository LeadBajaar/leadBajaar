---
type: api
group: company
sourceFile: src/lib/api.ts
usedByFeatures: [account_settings]
---

# API: company

`companyApi` object, defined at `src/lib/api.ts:1450`. Scoped to the current user's own company (not to be confused with the Super Admin `/admin/companies/*` endpoints in `adminApi`, which manage *other* companies and are out of this cluster's scope).

| Function | HTTP | Params | Purpose | Line ref |
|---|---|---|---|---|
| `getSettings` | `GET /company/settings` | none | Returns `response.data.settings` — company-level configuration (not currently consumed by any page in this cluster; `settings/page.tsx` reads company fields from `useUser()`'s `user.company` instead). | `src/lib/api.ts:1451` |
| `updateSettings` | `PATCH /company/settings` | `settings: Record<string, any>` | Updates company-level configuration. Not called by any page in this cluster. | `src/lib/api.ts:1461` |

## Notes
- Neither function is referenced by `settings/page.tsx`, `team/page.tsx`, or `dashboard/page.tsx` — they appear to be provisioned for a company-settings UI that either lives elsewhere in the app or hasn't been built yet. Flag as unused/`status: placeholder` if asked to audit dead code.
- Company identity/plan/status data actually rendered in this cluster's pages comes from `user.company` via `useUser()`, not from this API group — see [state/user-context.md](../state/user-context.md).
