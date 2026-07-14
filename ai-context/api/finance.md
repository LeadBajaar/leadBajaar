---
type: api
group: finance
sourceFile: src/lib/api.ts (financeApi, line ~2031)
usedByFeatures: [finance_module]
---
# API: finance

All endpoints are prefixed `/super-admin/finance/*`. Unlike `agencyApi`/`adminApi`, these are terse arrow functions (`(...) => api.METHOD(url, ...).then(r => r.data)`) with no try/catch — callers handle errors themselves (every consuming page wraps calls in try/catch and shows a `sonner` toast on failure).

| function | method + endpoint | params | purpose | file:line |
|---|---|---|---|---|
| `getDashboard` | GET `/super-admin/finance/dashboard` | month?, year? | P&L summary: revenue, expenses, pnl, payroll, highlights, burn_trend, projections | 2033 |
| `getCategories` | GET `/super-admin/finance/categories` | — | List expense categories | 2037 |
| `createCategory` | POST `/super-admin/finance/categories` | data | Create expense category | 2039 |
| `updateCategory` | PUT `/super-admin/finance/categories/{id}` | id, data | Update expense category | 2041 |
| `deleteCategory` | DELETE `/super-admin/finance/categories/{id}` | id | Delete expense category | 2043 |
| `getExpenses` | GET `/super-admin/finance/expenses` | params (month, year, search, category_id, department) | Filtered/paginated expense list | 2047 |
| `createExpense` | POST `/super-admin/finance/expenses` | data | Log a new expense | 2049 |
| `updateExpense` | PUT `/super-admin/finance/expenses/{id}` | id, data | Edit an expense | 2051 |
| `deleteExpense` | DELETE `/super-admin/finance/expenses/{id}` | id | Delete an expense | 2053 |
| `uploadReceipt` | POST `/super-admin/finance/expenses/{id}/upload-receipt` | id, file (multipart) | Attach a receipt image/PDF | 2055 |
| `getDailyExpenses` | GET `/super-admin/finance/expenses/daily/{date}` | date | Expenses for a single day | 2061 |
| `getMonthlyExpenses` | GET `/super-admin/finance/expenses/monthly/{month}/{year}` | month, year | Monthly expense summary + by_category breakdown | 2063 |
| `getRecurringExpenses` | GET `/super-admin/finance/expenses/recurring` | — | List recurring expenses w/ due-soon flags | 2065 |
| `getEmployees` | GET `/super-admin/finance/employees` | params? | Employee list + `{total_burn, headcount}` | 2069 |
| `createEmployee` | POST `/super-admin/finance/employees` | data | Add an employee (HR + banking profile) | 2071 |
| `updateEmployee` | PUT `/super-admin/finance/employees/{id}` | id, data | Edit employee profile | 2073 |
| `deleteEmployee` | DELETE `/super-admin/finance/employees/{id}` | id | Remove employee | 2075 |
| `getEmployeeSalaryHistory` | GET `/super-admin/finance/employees/{id}/salary-history` | id | (Note: page actually calls `getSalaryHistory`, not defined here — likely dead/renamed function; see Notes) | 2077 |
| `toggleEmployeeActive` | POST `/super-admin/finance/employees/{id}/toggle-active` | id | Activate/deactivate employee | 2079 |
| `getEmployeeRevisions` | GET `/super-admin/finance/employees/{id}/revisions` | id | Salary revision history | 2081 |
| `addEmployeeRevision` | POST `/super-admin/finance/employees/{id}/revisions` | id, {new_salary, effective_date, reason, notes} | Log a salary hike/revision | 2083 |
| `getPayrollCycle` | GET `/super-admin/finance/payroll/cycle/{month}/{year}` | month, year | Payout list + summary for a payroll cycle | 2087 |
| `generatePayroll` | POST `/super-admin/finance/payroll/generate/{month}/{year}` | month, year | Auto-generate pending payouts for all active employees | 2089 |
| `markPayoutPaid` | PUT `/super-admin/finance/payroll/{payoutId}/mark-paid` | payoutId, data (payment_mode, transaction_ref, paid_at, bonus, other_deductions, remarks) | Mark a payout as paid | 2091 |
| `updatePayoutStatus` | PUT `/super-admin/finance/payroll/{payoutId}/status` | payoutId, status (`hold`\|`pending`) | Hold/resume a pending payout | 2093 |
| `uploadPayoutProof` | POST `/super-admin/finance/payroll/{payoutId}/upload-proof` | payoutId, file (multipart) | Attach payment proof | 2095 |
| `getPayrollAnnualSummary` | GET `/super-admin/finance/payroll/summary/{year}` | year | Annual payroll summary | 2101 |
| `getRevenueCompanies` | GET `/super-admin/finance/revenue/companies` | — | Company list for revenue adjustment targeting | 2105 |
| `getMrrBreakdown` | GET `/super-admin/finance/revenue/mrr` | — | MRR, ARR, growth %, active_count, plan_breakdown | 2107 |
| `getMrrHistory` | GET `/super-admin/finance/revenue/mrr/history` | — | 12-month MRR history for chart | 2109 |
| `getSubscriptions` | GET `/super-admin/finance/revenue/subscriptions` | params (search, plan) | Active subscriptions with expiry-status flags | 2111 |
| `manualRenewal` | POST `/super-admin/finance/revenue/renewals` | {company_id, extend_days, amount, notes} | Manually extend/renew a subscription | 2113 |
| `getRevenueAdjustments` | GET `/super-admin/finance/revenue/adjustments` | params? | List one-off revenue adjustments | 2115 |
| `createRevenueAdjustment` | POST `/super-admin/finance/revenue/adjustments` | {company_id, type, amount, description, effective_date, invoice_url} | Record a one-off fee/credit/refund | 2117 |
| `getRevenueTarget` | GET `/super-admin/finance/revenue/targets/{month}/{year}` | month, year | Get revenue target for a period (not observed wired to any page in this pass) | 2119 |
| `setRevenueTarget` | POST `/super-admin/finance/revenue/targets` | data | Set a revenue target (not observed wired to any page in this pass) | 2121 |
| `getUpgradeLog` | GET `/super-admin/finance/revenue/upgrade-log` | month?, year? | Plan upgrade/downgrade log (not observed wired to any page in this pass) | 2123 |
| `getChurnLog` | GET `/super-admin/finance/churn` | params? | Churn metrics + at_risk + win_back + full churn log | 2127 |
| `tagChurnReason` | POST `/super-admin/finance/churn/{id}/reason` | id, data | Tag a churn record with a reason (not observed wired to the Churn page UI in this pass) | 2129 |
| `detectChurn` | POST `/super-admin/finance/churn/detect` | — | Run backend churn-detection job | 2131 |
| `getPlans` | GET `/super-admin/finance/plans` | — | List plans for pricing view (finance-scoped, distinct from `adminApi.getPlans`) | 2135 |
| `updatePlanPricing` | PUT `/super-admin/finance/plans/pricing` | {plan_name, new_price, notes} | Change a plan's price (new subscriptions only) | 2137 |
| `getPlanPricingHistory` | GET `/super-admin/finance/plans/pricing/history` | params? | Pricing change audit log | 2139 |
| `getMonthlyPlReport` | GET `/super-admin/finance/reports/pl/{month}/{year}` | month, year | Monthly P&L report data | 2143 |
| `getAnnualReport` | GET `/super-admin/finance/reports/annual/{year}` | year | Annual summary report data | 2145 |
| `getPayrollReport` | GET `/super-admin/finance/reports/payroll/{year}` | year | Consolidated payroll/TDS report data | 2147 |
| `getGstReport` | GET `/super-admin/finance/reports/gst/{month}/{year}` | month, year | GST/ITC reconciliation report data | 2149 |

## Notes
- `employees/page.tsx` calls `financeApi.getSalaryHistory(emp.id)`, but the only salary-history export in `financeApi` is named `getEmployeeSalaryHistory`. If `getSalaryHistory` is not defined elsewhere in the file, this is a runtime bug (`TypeError: financeApi.getSalaryHistory is not a function`) — worth a targeted grep/fix if this module is touched again; not fixed here since this is a documentation-only pass.
- `getRevenueTarget`/`setRevenueTarget`/`getUpgradeLog`/`tagChurnReason` exist in the API surface but were not seen called by any of the 8 finance sub-pages read in this pass — either used by since-removed UI, reserved for a future Reports/Revenue enhancement, or wired into markup not captured by the grep passes used here.

See also: `../pages/admin-finance.md`, `../features/finance_module.md`, `../flows/finance-operations.md`, `docs/leadbajaar-finance-module-plan.md`.
