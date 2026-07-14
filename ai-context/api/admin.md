---
type: api
group: admin
sourceFile: src/lib/api.ts (adminApi, line ~1642)
usedByFeatures: [system_admin, email_logs]
---
# API: admin

All functions are `async`, wrap the call in try/catch, and throw `new Error(error.response?.data?.message || <fallback>)`. Endpoints are prefixed `/admin/*` and are checked server-side for Super Admin role (per `context/ai-context.md` rule: "Admin actions: Super Admin routes are prefixed `/api/admin/super/...`" — in this codebase the client-visible prefix is `/admin/...`).

| function | method + endpoint | key params | purpose | file:line |
|---|---|---|---|---|
| `getStats` | GET `/admin/stats` | — | Global platform stat tiles (revenue, active_companies, total_users, api_health, platformMetrics) | 1643 |
| `getCompanies` | GET `/admin/companies` | page, limit, search, plan, status, tag, expiration, started, expStart, expEnd, startStart, startEnd | Paginated/filterable company list | 1652 |
| `updateCompany` | PATCH `/admin/companies/{id}` | plan?, status?, expires_at?, subscription_started_at?, is_email_enabled? | Edit a company's plan/status/dates/email toggle | 1672 |
| `getUsers` | GET `/admin/users` | page, limit, search, tag, role, status, userType | Paginated/filterable global user list | 1681 |
| `updateUser` | PATCH `/admin/users/{id}` | any (role, status, company_id, tags used by UI) | Edit a user's role/status/company/tags | 1696 |
| `getTesterRequests` | GET `/admin/tester-requests` | page, limit, search | List beta tester access requests | 1705 |
| `updateTesterRequestStatus` | PATCH `/admin/tester-requests/{id}/status` | status | Approve/reject a tester request | 1716 |
| `deleteUser` | DELETE `/admin/users/{id}` | id | Permanently delete a user | 1725 |
| `getEmailStats` | GET `/admin/email-stats` | search, page, limit, filterStatus | Platform email volume/health + per-company breakdown (used by `email_logs`) | 1734 |
| `toggleUserNotification` | POST `/admin/users/{userId}/toggle-notification` | userId, type (`new_lead`\|`meeting_booked`) | Toggle a user's email notification preference | 1742 |
| `toggleCompanyEmail` | POST `/admin/companies/{id}/toggle-email` | id | Enable/suspend all email sending for a company | 1750 |
| `deleteCompany` | DELETE `/admin/companies/{id}` | id | Permanently delete a company workspace | 1759 |
| `renewCompany` | POST `/admin/companies/{id}/renew` | id, days, notes? | Extend a company's subscription by N days | 1768 |
| `getCompanyHistory` | GET `/admin/companies/{id}/history` | id | Subscription/plan-change audit log for one company | 1777 |
| `loginAsAnyUser` | POST `/admin/users/{id}/login` | id | Impersonate any platform user; returns `{token}` | 1786 |
| `getBilling` | GET `/admin/billing` | page, limit, search | Paginated all-time billing/payment history | 1795 |
| `getPendingPayments` | GET `/admin/payments/pending` | page, limit | Paginated payments awaiting manual approval | 1805 |
| `approvePayment` | POST `/admin/payments/{id}/approve` | id | Approve a pending payment, activating the company | 1815 |
| `getPlans` | GET `/admin/plans` | — | List all subscription plans (feature/capability config) | 1824 |
| `createPlan` | POST `/admin/plans` | `{name, price, features: {display, permissions}}` | Create a new plan | 1833 |
| `updatePlan` | PATCH `/admin/plans/{id}` | same shape as create | Update an existing plan's price/features/capabilities | 1842 |
| `getTags` | GET `/admin/tags` | — | Global list of assignable tags (used for company/user tag filters+editing) | 1851 |
| `sendBroadcast` | POST `/admin/broadcast` | title, message, type, target(`all`\|`company`), company_id?, company_ids?, image_url?, is_modal?, frequency, cta_text?, cta_link?, expires_at? | Send a platform-wide or company-scoped in-app announcement | 1860 |
| `getBroadcastHistory` | GET `/admin/broadcast/history` | — | List past broadcasts | 1882 |
| `getCoupons` | GET `/admin/payments/coupons` | — | List discount coupons | 1892 |
| `createCoupon` | POST `/admin/payments/coupons` | data | Create a coupon | 1901 |
| `updateCoupon` | PATCH `/admin/payments/coupons/{id}` | data | Update a coupon | 1910 |
| `deleteCoupon` | DELETE `/admin/payments/coupons/{id}` | id | Delete a coupon | 1919 |
| `getSettings` | GET `/admin/payments/settings` | — | Get global payment settings | 1929 |
| `updateSettings` | POST `/admin/payments/settings` | data | Update global payment settings | 1938 |

Consumed by: `src/app/(dashboard)/admin/page.tsx` (Companies/Users/Billing/Plans/Announcements/Testers tabs), `src/app/(dashboard)/admin/payments/page.tsx` + its `CouponsTab`/`SettingsTab` components, `src/app/(dashboard)/admin/emails/page.tsx`. The Meta Deletions tab on `/admin` instead uses `integrationApi.getDeletionRequests()` (owned by another cluster, not part of `adminApi`). `/admin/errors` uses the raw `api` instance directly (`GET /errors`, `DELETE /errors/clear`), not a named `adminApi` function.

See also: `../pages/admin-dashboard.md`, `../pages/admin-payments.md`, `../pages/admin-emails.md`, `../flows/super-admin-governance.md`.
