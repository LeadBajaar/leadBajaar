---
type: flow
slug: finance-operations
featuresInvolved: [finance_module]
---
# Flow: Finance Operations (Revenue, Expenses, Payroll, Churn, Reporting)

Monthly operating cycle for the platform's internal finance team inside `/admin/finance/*` (see [`../pages/admin-finance.md`](../pages/admin-finance.md), [`../api/finance.md`](../api/finance.md), design source: `docs/leadbajaar-finance-module-plan.md`).

## 1. Track expenses (ongoing)
1. Finance admin logs an expense on `/admin/finance/expenses` — date, amount, description, category, vendor, payment mode, department, optional GST fields, optional recurring cycle → `financeApi.createExpense`.
2. Optionally attaches a receipt (`financeApi.uploadReceipt`, multipart).
3. Recurring expenses (subscriptions, rent, etc.) surface in the "Recurring" tab with due-soon highlighting; the "Daily Log" tab lets finance drill into a specific day (`financeApi.getDailyExpenses`).

## 2. Run monthly payroll
1. On `/admin/finance/employees`, finance maintains the employee roster (HR + banking details) — add/edit via `financeApi.createEmployee`/`updateEmployee`; deactivate leavers via `toggleEmployeeActive`.
2. Salary changes are logged as discrete revisions (`financeApi.addEmployeeRevision`) rather than silently overwriting `base_salary` — preserves a hike history with reason and effective date.
3. On `/admin/finance/payroll`, for the target month/year: if no payouts exist yet, "Generate Payroll" (`financeApi.generatePayroll`) creates one pending payout per active employee (gross salary, TDS auto-deducted per employee's `tds_percentage`).
4. For each payout, finance either "Pays" it (opens a modal, can add bonus/other deductions, records payment mode + transaction reference + date → `financeApi.markPayoutPaid`) or "Holds" it (`financeApi.updatePayoutStatus('hold')`) if there's a dispute.
5. After paying, finance can upload a payment proof screenshot/UTR (`financeApi.uploadPayoutProof`).

## 3. Manage revenue
1. On `/admin/finance/revenue`, finance monitors Net MRR/ARR and a 12-month MRR trend (`financeApi.getMrrBreakdown`, `getMrrHistory`).
2. The Subscriptions tab surfaces every paid workspace with an expiry-status traffic light (critical/warning/expired); finance can manually renew a subscription outside the normal self-serve payment flow (`financeApi.manualRenewal` — used for bank-transfer/offline payments), which is distinct from the Super Admin's `adminApi.renewCompany` used in the platform-governance flow.
3. One-off charges (setup fees, custom-plan invoices, refunds, discounts, credits) are logged as Revenue Adjustments (`financeApi.createRevenueAdjustment`) so they factor into MRR/P&L without being mistaken for recurring subscription revenue.

## 4. Monitor churn & retention
1. `/admin/finance/churn` surfaces at-risk accounts (expiring within 7 days) for proactive outreach (email/phone icons) and recently-churned accounts as win-back targets.
2. "Detect Churn" (`financeApi.detectChurn`) triggers a backend job to reconcile expired-but-unrenewed subscriptions into the churn log.
3. The full Churn Log table tracks whether a churned account was later reactivated.

## 5. Review the P&L and report out
1. `/admin/finance/dashboard` composes Revenue − (Opex + Payroll) into a live Net P&L, runway (months of cash left at current burn), and a 6-month burn trend chart — the single "are we profitable" view, refreshed by month/year selectors (`financeApi.getDashboard`).
2. For formal reporting (accountant/CA, GST filing, annual review), `/admin/finance/reports` generates one of 4 report types (Monthly P&L, Annual Summary, Payroll/TDS, GST reconciliation) and exports client-side to CSV or triggers browser print — there is no server-side PDF/export endpoint.
3. Pricing changes to SaaS plans are tracked separately on `/admin/finance/plans` (`financeApi.updatePlanPricing`) with a full audit trail, explicitly scoped to affect only new subscriptions.

## Cross-references
- This module's client-side access control is unusually loose — no `RoleGuard` anywhere in `/admin/finance/*` — see the Notes in [`../features/finance_module.md`](../features/finance_module.md).
- The Plans-pricing history tracked here is separate from the plan **feature/capability** editor inside `/admin` (`system_admin`), covered in [`../flows/super-admin-governance.md`](../flows/super-admin-governance.md).
