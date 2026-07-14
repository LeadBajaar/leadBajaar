---
type: flow
slug: super-admin-governance
featuresInvolved: [system_admin, email_logs, error_logs]
---
# Flow: Super-Admin Governance (Platform Oversight)

How a Super Admin monitors and operates the whole platform via `/admin`, `/admin/payments`, `/admin/emails`, and `/admin/errors` (see [`../pages/admin-dashboard.md`](../pages/admin-dashboard.md), [`../pages/admin-payments.md`](../pages/admin-payments.md), [`../pages/admin-emails.md`](../pages/admin-emails.md), [`../pages/admin-errors.md`](../pages/admin-errors.md), [`../api/admin.md`](../api/admin.md)).

## 1. Company lifecycle management
1. On `/admin` → Companies tab, Super Admin searches/filters the global company list (plan, status, tag, expiry window, subscription-start window) via `adminApi.getCompanies`.
2. Edits a company's plan, status, subscription start/expiry dates (linked via a "days" control), or email-enable flag via `adminApi.updateCompany`.
3. Renews (`adminApi.renewCompany`, custom day count + notes — more flexible than the agency-side fixed-30-day `agencyApi.renewClient`), reviews its subscription history (`adminApi.getCompanyHistory`), or deletes it (`adminApi.deleteCompany`).
4. If a company reports a payment issue paid outside the automated flow (bank transfer, etc.), Super Admin instead goes to `/admin/payments` → Pending Approvals, reviews the submitted proof/notes, and approves via `adminApi.approvePayment`, which fully activates the account.

## 2. User & impersonation management
1. On `/admin` → Users tab, Super Admin searches/filters every user on the platform (role, status, user type, tag) via `adminApi.getUsers`.
2. Edits role/status/company assignment/tags via `adminApi.updateUser`, or deletes a user via `adminApi.deleteUser`.
3. To debug or support any account, Super Admin clicks "Impersonate": current token → `localStorage.admin_token`, `adminApi.loginAsAnyUser(userId)` swaps in the target's token via `setSession`, then hard-navigates to `/dashboard`. Identical `admin_token` mechanism to the agency-impersonation flow (see [`../flows/agency-client-management.md`](../flows/agency-client-management.md)), but scoped platform-wide instead of to one agency's own clients.

## 3. Plan & feature-capability governance
1. On `/admin` → Plans tab, Super Admin edits the platform's subscription tiers: display features (marketing bullet list) and a `capabilities` map assigning which roles (Admin/Manager/Agent) can use each gatable feature id (`AVAILABLE_PLATFORM_FEATURES`, which includes every feature this documentation cluster covers — `agency_management`, `analytics`, `system_admin`, `email_logs`, `error_logs`, `finance_module`, `developer_tools` — alongside tenant-facing ones like `chatbot`, `whatsapp_bot`).
2. Save packages both into one "Smart JSON" payload (`{display, permissions}`) sent to `adminApi.createPlan`/`updatePlan`.
3. This is the actual gating mechanism `UserContext.hasFeature()` reads from `user.company?.plan_details?.features` for non-Super-Admin accounts — editing it here changes what every tenant on that plan can see, platform-wide, immediately.

## 4. Communications & compliance oversight
1. Announcements tab composes and sends in-app broadcasts (targeted to all companies or specific ones) via `adminApi.sendBroadcast`, reviewable in history via `adminApi.getBroadcastHistory`.
2. Meta Deletions tab tracks GDPR/Meta-mandated data-deletion callback requests via `integrationApi.getDeletionRequests()` (owned by the integrations cluster, only consumed here for oversight).
3. Tester Requests tab approves/rejects beta access requests via `adminApi.updateTesterRequestStatus`.

## 5. Infrastructure health monitoring
1. `/admin/emails` gives a platform-wide view of email deliverability (System/SES vs Custom SMTP split, failure rate vs a 5% threshold) with per-company drill-down and kill-switches (`adminApi.getEmailStats`, `toggleCompanyEmail`, `toggleUserNotification`) — critical because sustained high failure rates on the shared SES channel risk platform-wide sender-reputation damage.
2. `/admin/errors` gives a live tail of backend application errors/crashes (`GET /errors` via the raw `api` instance) for operational debugging, with a destructive "Clear Logs" action (`DELETE /errors/clear`).
3. `/admin` → Health tab shows coarse platform metrics (total leads, meetings, active integrations, system load) from the same `adminApi.getStats()` call used for the header tiles.

## Cross-references
- Company-level financial detail (P&L, revenue/MRR, payroll, churn) is a separate, deeper module — see [`../flows/finance-operations.md`](../flows/finance-operations.md).
- Client-side authorization is inconsistent across this flow: `/admin`, `/admin/payments`, and `/admin/errors` all wrap in `RoleGuard`; `/admin/emails` does not (see [`../features/email_logs.md`](../features/email_logs.md) Notes).
