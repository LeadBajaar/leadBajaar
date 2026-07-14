---
type: api
group: leads
sourceFile: src/lib/api.ts
usedByFeatures: [leads]
---
# API: leads

All functions are top-level exports from `src/lib/api.ts` using the shared `api` axios instance (bearer token auto-attached via interceptor; 401 triggers global logout+redirect; company scoping is implicit server-side — see `context/ai-context.md`).

| Function | Method + Endpoint | Params | Purpose | file:line |
|---|---|---|---|---|
| `createLead` | `POST /leads` | `CreateLeadDto` (defaults `stage: 'New'`) | Create a new lead | api.ts:247 |
| `importLeads` | `POST /leads/import` | `{ leads: CreateLeadDto[] }` | Bulk-create leads from parsed CSV | api.ts:255 |
| `getLeads` | `GET /leads` | `GetLeadsParams` (page, search, status, stage, source, last_contact_from/to, created_from/to, per_page) | Paginated/filterable lead list; normalizes response into `{ data, meta/total/last_page }` shape | api.ts:312 |
| `getLead` | `GET /leads/{id}` | `id: number` | Fetch single lead detail | api.ts:344 |
| `deleteLead` | `DELETE /leads/{id}` | `id: number` | Delete one lead | api.ts:349 |
| `bulkDeleteLeads` | `POST /leads/bulk-destroy` | `{ ids: number[] }` | Delete many leads | api.ts:353 |
| `bulkUpdateLeadStatus` | `POST /leads/bulk-update-status` | `{ ids, status }` | Bulk temperature (Hot/Warm/Cold) change | api.ts:357 |
| `bulkUpdateLeadStage` | `POST /leads/bulk-update-stage` | `{ ids, stage }` | Bulk pipeline-stage change | api.ts:361 |
| `updateLead` | `PUT /leads/{id}` | `id, Partial<Lead>` | Full lead update (used for edits and agent assignment via `{ user_id }`) | api.ts:365 |
| `updateLeadStage` | `PATCH /leads/{id}/stage` | `id, stage, deal_value?` | Single-lead stage change; `deal_value` passed when closing a deal | api.ts:370 |
| `getStages` | `GET /stages` | — | Fetch company's pipeline stage list (name/color/icon/order) | api.ts:386 |
| `createStage` | `POST /stages` | `Partial<Stage>` | Create a pipeline stage | api.ts:391 |
| `updateStage` | `PUT /stages/{id}` | `id, Partial<Stage>` | Edit a stage (name/color) | api.ts:396 |
| `deleteStage` | `DELETE /stages/{id}` | `id: number` | Delete a stage | api.ts:401 |
| `reorderStages` | `POST /stages/reorder` | `{ stages: {id, order}[] }` | Persist stage order | api.ts:405 |
| `syncDefaultStages` | `POST /stages/initialize-default` | — | Seed/reset default stage set | api.ts:409 |
| `updateLeadDetails` | `PUT /leads/{id}` | `id, Partial<Lead>` | Duplicate of `updateLead` (same endpoint/verb); appears unused by pages read in this cluster — likely redundant alias | api.ts:424 |
| `exportLeads` | `POST /leads/export` | `ids?: number[]` (blob response) | CSV export + client-side download trigger (`Blob`/`createObjectURL`) | api.ts:1474 |

## Related types
- `Lead` interface (api.ts:261) — id, name, email, phone, company, stage, status (`'Hot'|'Warm'|'Cold'`), source, city, profession, notes?, deal_value?, paid_amount?, last_contact, created_at, updated_at, user_id?, agent?, new_note?
- `Stage` interface (api.ts:375) — id, company_id, name, color, icon, order, created_at, updated_at
- `CreateLeadDto`, `ImportLeadDto`, `GetLeadsParams`, `LeadsResponse` — request/response shape helpers

## Notes
- `createPayment` (api.ts:413, `POST /payments`) is called from the leads page's deal-close flow but is not part of this cluster's assigned function list — documented here only as a cross-reference since it's tightly coupled to `updateLeadStage(..., 'Deal Closed', amount)`.
- `teamApi.getMembers()` (used for agent-assignment dropdowns on both `/leads` and `/leads/[id]`) lives outside the assigned grep list; treat as a team-management API, cross-referenced only.
- See [flows/lead-lifecycle.md](../flows/lead-lifecycle.md) for how these compose into create → pipeline → close/import/export flows.
