---
type: feature
slug: finance_module
name: Finance Module (Internal P&L, Revenue, Payroll)
status: active
roles: [Super Admin]
userTypes: [super_admin]
planFeatureKey: finance_module
routes: ["/admin/finance", "/admin/finance/dashboard", "/admin/finance/revenue", "/admin/finance/expenses", "/admin/finance/employees", "/admin/finance/payroll", "/admin/finance/churn", "/admin/finance/reports", "/admin/finance/plans"]
relatedDocs:
  pages: [admin-finance]
  components: []
  api: [finance]
  flows: [finance-operations]
---
# Feature: Finance Module (Internal P&L, Revenue, Payroll)

## Summary
An internal accounting/BI suite for the company that operates LeadBajaar (not tenant-facing). Tracks three ledgers — Revenue (subscriptions + one-off adjustments), Expenses (categorized, recurring, GST-tagged, receipt uploads), and Payroll (employees, monthly payout cycles, salary revisions) — and rolls them into a P&L dashboard with runway/burn projections, a churn/retention tracker, SaaS plan pricing history, and exportable reports (Monthly P&L, Annual Summary, Payroll/TDS compliance, GST reconciliation). Matches the design in `docs/leadbajaar-finance-module-plan.md`.

## Access control
- Shared layout `src/app/(dashboard)/admin/finance/layout.tsx` renders the Finance sub-nav (Dashboard/Revenue/Expenses/Employees/Payroll/Churn/Reports/Plans) for every route under `/admin/finance/*`, but **the layout itself has no `RoleGuard`**, and **none of the 8 finance sub-pages import `RoleGuard`** either. Client-side authorization for this entire module relies solely on: (1) the sidebar hiding the "Finance" link from non-Super-Admins, and (2) backend enforcement on the `/super-admin/finance/*` endpoints. Any authenticated user who deep-links to `/admin/finance/dashboard` will render the page shell client-side (API calls would then fail/401 if unauthorized) — this is a materially looser client-side guard than `/admin/errors` or `/agency`.
- Sidebar entry "Finance" (`src/components/sidebar.tsx` line ~65): `roles: ['Super Admin']`, `types: ['super_admin']`, `feature: 'finance_module'`, links directly to `/admin/finance/dashboard`.
- `/admin/finance` (bare route) is a client-side redirect stub (`FinancePage` in `finance/page.tsx`) that immediately `router.replace('/admin/finance/dashboard')`.

## Key files
- Layout/sub-nav: `src/app/(dashboard)/admin/finance/layout.tsx`
- Index redirect: `src/app/(dashboard)/admin/finance/page.tsx`
- Sub-pages: `dashboard/page.tsx`, `revenue/page.tsx`, `expenses/page.tsx`, `employees/page.tsx`, `payroll/page.tsx`, `churn/page.tsx`, `reports/page.tsx`, `plans/page.tsx`
- API group: `financeApi` in `src/lib/api.ts` (line ~2031) — see `api/finance.md`
- Design doc: `docs/leadbajaar-finance-module-plan.md`
- No dedicated `components/finance` folder — every sub-page is self-contained, built from `src/components/ui/*` (Card, Dialog, Tabs, Select, Skeleton, Badge) plus `recharts` directly. Currency formatting (`fmt()`, `Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'})`) is duplicated per-file rather than shared.

## Notes
- All monetary values are formatted as INR (₹) via a locally-redefined `fmt()` helper in nearly every sub-page — a good candidate for extraction into a shared util if touched again.
- Employees carry sensitive payment fields (bank account, IFSC, UPI, PAN); the Employees page masks the bank account only when the backend returns `masked_bank_account` on payout objects.
- Reports page performs **client-side CSV export** (`exportToCsv` builds a Blob and triggers a synthetic anchor download) — no server-side export endpoint is called for CSV; "Print" is `window.print()`.
- Revenue page's "Add Adjustment" dialog posts to `financeApi.createRevenueAdjustment` with types `one_time_fee | setup_charge | custom_plan | refund | discount | credit`.
- Plans page here is distinct from the Plans tab inside `/admin` (`system_admin` feature) — this one (`financeApi.getPlans`/`updatePlanPricing`) only tracks pricing history for CA/finance purposes; the `/admin` Plans tab (`adminApi.getPlans`/`createPlan`/`updatePlan`) edits the actual feature/capability JSON that drives plan gating platform-wide.
