---
type: api
group: team
sourceFile: src/lib/api.ts
usedByFeatures: [team_management, authentication]
---

# API: team

`teamApi` object, defined at `src/lib/api.ts:1605`.

| Function | HTTP | Params | Purpose | Line ref |
|---|---|---|---|---|
| `getMembers` | `GET /team` | none | Returns `response.data.members` — the team directory list. | `src/lib/api.ts:1606` |
| `inviteMember` | `POST /team/invite` | `{ email, role }` | Sends an email invitation to join the workspace with a given role. | `src/lib/api.ts:1611` |
| `resendInvite` | `POST /team/:id/resend-invite` | `id` | Resends a pending invite email. | `src/lib/api.ts:1616` |
| `updateRole` | `PATCH /team/:id/role` | `id, role` | Changes an existing member's role. | `src/lib/api.ts:1621` |
| `removeMember` | `DELETE /team/:id` | `id` | Removes a member from the workspace. | `src/lib/api.ts:1626` |
| `setupAccount` | `POST /setup-account` | `{ token, name, password, password_confirmation }` | Activates an invited account (consumes the invite token); throws a normalized `Error` with the server message on failure. Called from `/setup-account` — see [pages/setup-account.md](../pages/setup-account.md). | `src/lib/api.ts:1631` |

## Notes
- All functions except `setupAccount` throw the raw axios/error object on failure (no try/catch wrapping) — callers (`team/page.tsx`) rely on `handleError()` (`src/utils/handleError.ts`) to normalize and toast these.
- `company_id`/tenant scoping is never passed by the client — resolved server-side from the bearer token, consistent with the repo-wide multi-tenancy rule.
