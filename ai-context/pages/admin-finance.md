---
type: page
route: /admin/finance
file: src/app/(dashboard)/admin/finance/layout.tsx
feature: finance_module
auth: protected
subRoutes: ["/admin/finance/dashboard", "/admin/finance/revenue", "/admin/finance/expenses", "/admin/finance/employees", "/admin/finance/payroll", "/admin/finance/churn", "/admin/finance/reports", "/admin/finance/plans"]
---
# Page group: /admin/finance

## Purpose
Internal finance/accounting suite for the platform operator. `FinanceLayout` renders a sticky sub-header with a tab-style nav (Dashboard, Revenue, Expenses, Employees, Payroll, Churn, Reports, Plans; icons via lucide-react) that highlights the active segment via `usePathname()`, and wraps `{children}` in a padded content area.

## Guard
**No `RoleGuard` anywhere in this page group** — not in `layout.tsx`, not in any of the 8 sub-pages, not in the `/admin/finance` index redirect. The entire module's client-side access control is the sidebar link visibility (`feature: 'finance_module'`, Super Admin only) plus whatever `/super-admin/finance/*` enforces server-side. This is the loosest client-side guard of any feature in this cluster — see `../features/finance_module.md` Notes.

## Route: /admin/finance (index)
`src/app/(dashboard)/admin/finance/page.tsx` — client-only redirect stub, `useEffect(() => router.replace('/admin/finance/dashboard'))`, renders nothing.

## Route: /admin/finance/dashboard
`FinanceDashboardPage` — month/year picker driving `financeApi.getDashboard(month, year)`. Renders 4 summary cards (Revenue, Total Burn, Net P&L with profit/loss coloring, Payroll with pending-count badge), a text P&L statement (revenue subscriptions/adjustments, expense-by-category breakdown, salaries, net profit/loss with margin %), a "Financial Runway" card (`projections.runway_months`, avg monthly burn), a static "Cash Flow Projection" card, a stacked bar chart of the last 6 months' burn (payroll vs opex via `burn_trend`), and a donut chart of expense-by-category.

## Route: /admin/finance/revenue
`RevenuePage` — fetches in parallel: `getMrrBreakdown`, `getMrrHistory`, `getSubscriptions({search, plan})`, `getRevenueAdjustments`, `getRevenueCompanies`. Shows Net MRR (with growth % vs previous), ARR, active-subscription count, adjustments total; a 12-month MRR line chart; a revenue-by-plan breakdown; two tabs — **Subscriptions** (searchable/plan-filterable table with expiry-status coloring critical/warning/expired and a "Renew" action opening a manual-renewal dialog → `financeApi.manualRenewal({company_id, extend_days, amount, notes})`) and **Adjustments** (log table of one-off fees/credits, plus an "Add Adjustment" dialog → `financeApi.createRevenueAdjustment({company_id, type, amount, description, effective_date, invoice_url})`, types: `one_time_fee|setup_charge|custom_plan|refund|discount|credit`).

## Route: /admin/finance/expenses
`ExpensesPage` — fetches in parallel: `getExpenses(filters)`, `getCategories`, `getRecurringExpenses`, `getMonthlyExpenses(month, year)`. 3 local tabs: **All Expenses** (filterable table by search/category/department/month/year; add/edit dialog with recurring-cycle and GST sub-fields; receipt upload via file input → `financeApi.uploadReceipt`; delete → `financeApi.deleteExpense`), **Recurring** (table of recurring expenses with due-soon highlighting), **Daily Log** (date picker → `financeApi.getDailyExpenses(date)`). Category budget bars show spend vs budget per category.

## Route: /admin/finance/employees
`EmployeesPage` — `financeApi.getEmployees()` returns `{employees, total_burn, headcount}`. Card grid per employee (avatar initial, role, contact, join date, base salary, active/inactive badge, current-month payout status badge). Add/Edit dialog captures full HR + banking profile (name/email/phone/role/department/employment_type/base_salary/tds_percentage/joining_date/relieving_date/bank_account/bank_ifsc/bank_name/upi_id/pan_number/notes) → `createEmployee`/`updateEmployee`. Toggle active/inactive → `toggleEmployeeActive`. "View" opens a dialog with **Payouts** (salary history table) and **Revisions** (salary-hike history) tabs, each with a "Log Salary Hike" action → `addEmployeeRevision({new_salary, effective_date, reason, notes})`.

## Route: /admin/finance/payroll
`PayrollPage` — month/year picker → `financeApi.getPayrollCycle(month, year)` returning `{payouts[], summary}`. Summary cards: Total Payout, Paid count/amount, Pending count/amount, Cycle Status (Open/Closed). "Generate Payroll" button (only shown when no payouts exist for the period) → `financeApi.generatePayroll(month, year)` creates pending payouts for all active employees. Per-payout row actions: **Pay** (opens modal computing `net = gross + bonus - tds - other_deductions`, captures payment mode/reference/date/remarks → `markPayoutPaid`), **Hold/Resume** (`updatePayoutStatus`), proof upload (`uploadPayoutProof`) once paid.

## Route: /admin/finance/churn
`ChurnPage` — `financeApi.getChurnLog()` returns `{churns, metrics, at_risk, win_back}`. Metrics cards: Churn Rate (target <5%/mo), Lost MRR, At-Risk MRR (companies expiring within 7 days), Recoverable (win-back value from last-30-day churns). "Detect Churn" button → `financeApi.detectChurn()` runs the backend detection job. Two live lists (At-Risk, Win-Back) plus a full historical Churn Log table with Reactivated/Churned status badges.

## Route: /admin/finance/reports
`ReportsPage` — month/year selectors + a 4-tab report generator: **Monthly P&L** (`getMonthlyPlReport`), **Annual Summary** (`getAnnualReport`), **Payroll (CA)** (`getPayrollReport` — TDS-compliance-oriented consolidated payroll report), **GST Report** (`getGstReport` — GSTR-2B-style expense reconciliation with vendor GSTIN and ITC total). Includes client-side CSV export (`exportToCsv` builds and downloads a Blob, no server export endpoint) and browser-native Print (`window.print()`, page has `print:` Tailwind variants for print-specific layout).

## Route: /admin/finance/plans
`PlansPage` — `financeApi.getPlans()` + `financeApi.getPlanPricingHistory()`. Card per plan (name, current price, last-changed date, previous price) with an edit-price dialog → `financeApi.updatePlanPricing({plan_name, new_price, notes})`, explicitly warned in-UI to only affect **new** subscriptions, not existing ones. A full pricing-change audit log table below. Distinct from the Plans tab in `/admin` (`system_admin`) which edits feature/capability gating, not just price — see `../features/finance_module.md`.

## Notes
- Every sub-page independently redefines a local `fmt()` currency formatter (`Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0})`) — a natural extraction candidate.
- No dedicated `components/finance` folder anywhere in this route group; all built from `src/components/ui/*` and `recharts`.

See also: `../features/finance_module.md`, `../api/finance.md`, `../flows/finance-operations.md`.
