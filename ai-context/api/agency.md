---
type: api
group: agency
sourceFile: src/lib/api.ts (agencyApi, line ~1949)
usedByFeatures: [agency_management]
---
# API: agency

All functions throw a `new Error(message)` on failure (extracted from `error.response?.data?.message`, with a static fallback string) and return `response.data` on success.

| function | method + endpoint | params | purpose | file:line |
|---|---|---|---|---|
| `getClients` | GET `/agency/clients` | — | List all sub-client companies owned by the current agency | api.ts:1950 |
| `onboardClient` | POST `/agency/onboard` | `data: {company_name, owner_name, owner_email, password, plan}` | Create a new client workspace; returns `invitation_link` if `password` omitted | api.ts:1959 |
| `getStats` | GET `/agency/stats` | — | Portfolio stats (total_clients, total_leads_managed, active_chats) | api.ts:1968 |
| `loginAsClient` | POST `/agency/clients/{id}/login` | `id: number` | Impersonate a client; returns `{token}` for the client's session | api.ts:1977 |
| `deleteClient` | DELETE `/agency/clients/{id}` | `id: number` | Permanently delete a client workspace | api.ts:1986 |
| `renewClient` | POST `/agency/clients/{id}/renew` | `id: number` | Extend client subscription by 30 days (server-side default) | api.ts:1995 |
| `getClientHistory` | GET `/agency/clients/{id}/history` | `id: number` | Subscription/plan-change audit log for one client | api.ts:2004 |

Used exclusively by `src/app/(dashboard)/agency/page.tsx` — see `../pages/agency.md` and `../flows/agency-client-management.md`.
