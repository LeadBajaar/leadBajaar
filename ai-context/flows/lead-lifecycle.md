---
type: flow
slug: lead-lifecycle
featuresInvolved: [leads]
---
# Flow: Lead Lifecycle

Covers how a lead moves from creation through the pipeline to a closed deal, plus the bulk import/export paths. All steps happen on `/leads` ([pages/leads.md](../pages/leads.md)) unless noted; API calls detailed in [api/leads.md](../api/leads.md).

## 1. Creation
1. User clicks "New Lead" → `AddLeadDialog` opens.
2. Client-side validation (`validateAndSubmit` in `page.tsx`): required `name`, required+regex-validated `email`, optional regex-validated `phone`.
3. On success: `createLead(data)` → `POST /leads` (server defaults `stage: 'New'` if omitted) → list refetched via `fetchLeads()`.
4. Alternative bulk-creation path: **Facebook Lead Ads sync** — `openFacebookRetrieval()` → `integrationApi.getFacebookLeadForms()` lists connected forms → user picks form + date range → `integrationApi.retrieveFacebookLeads(...)` creates/matches leads server-side → `fetchLeads()` refresh. (Cross-feature: Facebook/Meta integration, not detailed further here.)
5. Alternative bulk-creation path: **CSV Import** — see step 5 below.

## 2. Stage pipeline (Kanban / table)
1. Stages are dynamic per-company records (`getStages()` → `Stage[]` with name/color/icon/order), rendered as both table badges and kanban columns. `defaultStages` (from `app/leads/types.ts`) is a client-side fallback/seed shape used before stages load.
2. Changing a lead's stage (drag in kanban, or `StageChangeDialog` for single/bulk):
   - **Non-terminal stage** → `updateLeadStage(id, stage)` (single) or `bulkUpdateLeadStage(ids, stage)` (bulk) → local state patched optimistically (single) or full refetch (bulk).
   - **Terminal stage** (`'Deal Closed'` or `'Closed Won'`) → intercepted, see step 3.
3. Stage administration (`StageManagerDialog`, accessible via "View settings" in the toolbar): `createStage`, `updateStage`, `deleteStage`, `syncDefaultStages` (reseeds the default set). All refetch `getStages()` afterward.

## 3. Deal close (convert/win)
1. Triggered when a stage change (single, bulk, or via `EditLeadDialog`) targets `'Deal Closed'`/`'Closed Won'` and the lead wasn't already in that stage.
2. `DealValueDialog` opens instead of applying the stage change directly; user enters `dealValueAmount` and optionally an initial payment (`recordInitialPayment`, `initialPaymentAmount`, `paymentMethod`).
3. On save: `updateLeadStage(id, 'Deal Closed', amount)` (persists stage + `deal_value`), then optionally `createPayment({ lead_id, amount, payment_method, status: 'Completed', payment_date: today })`.
4. Local state patched with new stage + `deal_value`; no full refetch needed.

## 4. Loss / other bulk status changes
- `bulkUpdateLeadStatus(ids, status)` exists in the API layer (Hot/Warm/Cold temperature) but no explicit "mark as lost" UI path was observed in the read files beyond generic stage naming conventions (a `'Lost'` stage name is referenced only in the unused `src/components/leads/Helpers.tsx` mockup, not the real stage-management flow). Treat "lost" as just another stage value set via the same stage-change mechanism, not a distinct code path.

## 5. Import
1. User selects a `.csv` file → client parses header + preview rows (`parseCSVLine`, quote-aware).
2. User maps CSV columns → lead fields (`ColumnMapping[]`) in `ImportLeadsDialog`.
3. On confirm: full file re-parsed, mapped into `CreateLeadDto[]`, sent as `importLeads({ leads })` → `POST /leads/import`.
4. Response stats (`successful`, `skipped`, `errors[]`) populate an import report; `fetchLeads()` refreshes the list.

## 6. Export
1. `ExportLeadsDialog` offers "export selected" or "export all".
2. `exportLeads(ids?)` → `POST /leads/export` with `responseType: 'blob'` → client builds a `Blob` and triggers a download via a synthetic `<a>` click; filename from `Content-Disposition` header or a date-stamped default.

## 7. Detail view / assignment
- Navigating to `/leads/{id}` ([pages/leads-detail.md](../pages/leads-detail.md)) shows full lead info; the only mutating action there is representative (agent) reassignment: `updateLead(id, { user_id })` → re-fetch `getLead(id)`.
- Assignment is also available inline on `/leads` via `AssignAgentDialog` → same `updateLead(id, { user_id })` call, sourced from `teamApi.getMembers()`.

## Cross-references
- Broadcast messaging to selected leads (`integrationApi.sendBroadcast`) and WhatsApp/Facebook integration setup are adjacent features triggered from this page but documented in the integrations cluster, not here.
- Messaging a lead directly (WhatsApp deep link `wa.me/{phone}` from both `/leads` and `/leads/[id]`) is a simple `window.open`, not part of the in-app chat feature — see [flows/realtime-messaging.md](./realtime-messaging.md) for the actual chat inboxes.
