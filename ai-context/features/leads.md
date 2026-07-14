---
type: feature
slug: leads
name: Leads (CRM)
status: active
roles: ["Super Admin", "Admin", "Manager", "Agent"]
userTypes: []
planFeatureKey: leads
routes: ["/leads", "/leads/[id]"]
relatedDocs:
  pages: [../pages/leads.md, ../pages/leads-detail.md]
  components: [../components/leads.md]
  api: [../api/leads.md]
  flows: [../flows/lead-lifecycle.md]
---
# Feature: Leads (CRM)

## Summary
Core CRM lead management: list/search/filter leads, kanban pipeline by stage, bulk operations (delete/stage-change/broadcast), CSV import/export, Facebook Lead Ads retrieval, deal-value/payment recording on close, per-lead detail view, and agent assignment. Entry point gated by `RoleGuard allowedFeatures={['leads']}`.

## Access control
- Sidebar entry `Leads` (`src/components/sidebar.tsx` line ~31): `roles: ['Super Admin','Admin','Manager','Agent']`, `feature: 'leads'`, no `types` restriction (visible to individual/agency/super_admin).
- Both `/leads` and `/leads/[id]` pages wrap content in `<RoleGuard allowedFeatures={['leads']}>`, which requires `hasFeature('leads')` to be true (Super Admin always passes; others depend on `company.plan_details.features`).
- No explicit `allowedRoles`/`allowedTypes` in the page-level `RoleGuard` — role restriction is enforced only by the sidebar not surfacing the link and by `hasFeature`.

## Key files
- Pages: `src/app/(dashboard)/leads/page.tsx` (list/kanban), `src/app/(dashboard)/leads/[id]/page.tsx` (detail)
- Header/toolbar (currently unused, see Notes): `src/app/(dashboard)/leads/LeadsHeader.tsx`
- Route-local subcomponents referenced by `page.tsx` (not part of this cluster's component docs, colocated in the route folder): `LeadsFilters`, `LeadsTable`, `LeadsMobileView`, `KanbanBoard`, `ImportLeadsDialog`, `FacebookRetrievalDialog`, `DeleteConfirmationDialog`, `ExportLeadsDialog`, `BroadcastMessageDialog`, `StageManagerDialog`, `StageChangeDialog`, `DealValueDialog`, `EditLeadDialog`, `AddLeadDialog`, `AssignAgentDialog`, `types.ts`
- Placeholder/unused component-group: `src/components/leads/*` — see [components/leads.md](../components/leads.md)
- API: `src/lib/api.ts` — see [api/leads.md](../api/leads.md)

## Notes
- **`LeadsHeader.tsx` is dead code for `/leads`**: `page.tsx` imports and renders `LeadsFilters` (a different, richer toolbar component in the same directory), not `LeadsHeader`. `LeadsHeader`'s props (`setShowStageManager`, `openFacebookRetrieval`, etc.) match the same handlers wired to `LeadsFilters` in `page.tsx`, suggesting `LeadsHeader` is an earlier/alternate version of the toolbar left in the tree unused. Grep confirms no other file imports it.
- `src/components/leads/*` (7 files) is a **separate, unused placeholder UI kit** (Tabler-icon-based mockups: `LeadsTable`, `KanbanBoard`, `PageHeader`, `Sidebar`, `Helpers`, `MetricCard`, `ActivityTimeline`) with different prop shapes than the real, wired components living in `src/app/(dashboard)/leads/`. Nothing in `src` imports from `@/components/leads/*`. Treat as inert scaffold, not the real leads UI — do not confuse with the actual `LeadsTable`/`KanbanBoard` used by `page.tsx` (those live at `src/app/(dashboard)/leads/LeadsTable.tsx` / `KanbanBoard.tsx`, outside this cluster's read list).
- Deal-close flow: changing a lead's stage to `'Deal Closed'` or `'Closed Won'` intercepts the normal stage-change and opens `DealValueDialog` instead, which calls `updateLeadStage(id, 'Deal Closed', amount)` and optionally `createPayment(...)`.
- Facebook Lead Ads retrieval (`integrationApi.getFacebookLeadForms` / `retrieveFacebookLeads`) is a cross-feature integration entry point embedded in the leads toolbar — full integration doc is out of this cluster's scope.
- Broadcast messaging from the leads list (`integrationApi.sendBroadcast`, `getWhatsAppAccounts` for templates) overlaps with WhatsApp Business API integration — noted here as a one-line cross-reference only; not documented under this cluster's API docs beyond the call site.
- Company scoping, auth, and toast conventions follow the shared rules in `context/ai-context.md`.
