---
type: page
route: /leads
file: src/app/(dashboard)/leads/page.tsx
feature: leads
auth: protected
---
# Page: /leads

## Purpose
Main CRM lead list. Supports table and kanban views, search/filter, pagination, bulk selection actions (delete, stage change, broadcast), CSV import/export, Facebook Lead Ads sync, stage management, deal-value/payment capture on close, and agent assignment. Mobile view renders a card list instead of the table.

## Components used
All colocated in `src/app/(dashboard)/leads/` (sibling files to `page.tsx`, not under `src/components`):
- `LeadsFilters` — actual toolbar rendered (search, status/stage/source filters, column toggle, view-mode switch, new-lead/import/export/Facebook-sync triggers). **Note:** `LeadsHeader.tsx` (assigned doc target) is *not* used here — see [features/leads.md](../features/leads.md) Notes.
- `LeadsTable` / `LeadsMobileView` / `KanbanBoard` — the three list-rendering modes (desktop table, mobile cards, kanban board)
- `ImportLeadsDialog`, `FacebookRetrievalDialog`, `DeleteConfirmationDialog`, `ExportLeadsDialog`, `BroadcastMessageDialog`, `StageManagerDialog`, `StageChangeDialog`, `DealValueDialog`, `EditLeadDialog`, `AddLeadDialog`, `AssignAgentDialog` — modals for each respective action
- `TableColumnToggle` (`@/components/ui/table-column-toggle`), `DateRangePicker`, shadcn primitives (`Table`, `Dialog`, `Select`, `Badge`, etc.)
- Guarded by `RoleGuard allowedFeatures={['leads']}`

## Data/API calls
From `src/lib/api.ts` (see [api/leads.md](../api/leads.md) for signatures):
- `getLeads(params)` — main list fetch, driven by page/perPage/search/status/stage/source/date filters
- `getStages()` — populates stage config (colors/icons) for badges and kanban columns
- `teamApi.getMembers()` — populates agent-assignment dropdown
- `createLead`, `updateLead`, `deleteLead`, `bulkDeleteLeads`, `bulkUpdateLeadStage`, `updateLeadStage`
- `importLeads` (CSV import after client-side parsing/column-mapping), `exportLeads` (CSV blob download)
- `createStage`, `updateStage`, `deleteStage`, `syncDefaultStages` (via Stage Manager dialog)
- `createPayment` (from `src/lib/api.ts`, not in this cluster's assigned read list) — records initial payment when a deal closes
- `integrationApi.sendBroadcast`, `integrationApi.getWhatsAppAccounts`, `integrationApi.getFacebookLeadForms`, `integrationApi.retrieveFacebookLeads` — cross-feature (WhatsApp/Facebook integrations), called directly from this page

## Notable behavior
- Client-side CSV parsing (`parseCSVLine`) handles quoted fields before sending mapped rows to `importLeads`.
- Changing a lead's stage to `Deal Closed`/`Closed Won` (single or bulk) intercepts the update and opens the Deal Value dialog instead of calling `updateLeadStage` directly; the dialog then calls `updateLeadStage(id, 'Deal Closed', amount)` plus optional `createPayment`.
- Debounced search (500ms, `useDebounce`) drives `fetchLeads`; a separate `isSearching` flag shows a spinner state.
- Desktop table has a synced sticky bottom horizontal scrollbar (manual scroll-position mirroring + `ResizeObserver`).
- `isMobile` (via `useMediaQuery('(max-width: 768px)')`) switches to `LeadsMobileView`; clicking a card/row navigates to `/leads/${id}`.
- Bulk action bar appears only when `selectedLeads.length > 0`, offering Broadcast / Change Stage / Delete.
