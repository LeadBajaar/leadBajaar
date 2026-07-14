---
type: page
route: /admin
file: src/app/(dashboard)/admin/page.tsx
feature: system_admin
auth: protected
subRoutes: []
---
# Page: /admin

## Purpose
Single-page Super Admin console (~3260 lines, one client component, `SuperAdminPage`) with a tabbed interface over the entire platform: Companies, Users, Billing, Plans, Health, Meta Deletions, Announcements, Tester Requests. Header shows 4 global summary tiles (Total Revenue, Active Companies, Platform Users, API Health) plus a "Demo Data" toggle that swaps all state to local mock data (`initialCompanies`, `demoStats`, `initialUsers`, `initialPlans`) without hitting the API.

## Guard
`RoleGuard allowedFeatures={['system_admin']}` wraps the page.

## Data flow
`fetchData()` always fetches `adminApi.getStats()` for the header tiles, then fetches **only the data needed for the active tab** (to avoid connection exhaustion, per an in-code comment) — e.g. `companies` tab fetches `getCompanies` + `getTags` + `getPlans`; `users` tab fetches `getUsers` + `getTags`; `billing` fetches `getBilling`; `announcements` fetches `getBroadcastHistory` + a companion `getCompanies(1,100)` for the targeting picker; `testers` fetches `getTesterRequests`; `plans` fetches `getPlans`; `meta-deletions` fetches `integrationApi.getDeletionRequests()` (cross-cluster API). A 500ms debounce re-runs `fetchData()` on any filter/search/page-state change.

## Tabs
### Companies
Paginated, multi-filter (plan, status, tag, expiration window incl. custom date range, subscription-start window) table of every company on the platform. Inline actions: edit modal (plan, status, subscription start/expiry dates with a linked "days" slider, email-enable toggle → `adminApi.updateCompany`), renew (`adminApi.renewCompany`), view subscription history (`adminApi.getCompanyHistory`), delete (`adminApi.deleteCompany`).

### Users
Paginated, filterable (role, status, user type, tag) table of every user on the platform. Edit modal changes role/status/company/tags (`adminApi.updateUser`); delete (`adminApi.deleteUser`); "Impersonate" triggers `handleImpersonate` → same admin_token-swap pattern as the Agency portal, then redirects to `/dashboard`.

### Billing
Paginated table over `adminApi.getBilling` — all-time payment/billing records across every company (a superset of the "All Payments" tab on `/admin/payments`).

### Plans
Card grid of every subscription plan (`adminApi.getPlans`). Each plan tracks a `features` array (display toggles like "Unlimited Leads") and a `capabilities` map (`{ featureId: allowedRoles[] }`) driven by `AVAILABLE_PLATFORM_FEATURES` (dashboard, leads, live_chat, chatbot, meetings, integrations, agency_management, analytics, team_management, automations, whatsapp_bot, whatsapp_cloud_api, system_admin, email_logs, error_logs, finance_module, developer_tools, account_settings) and `PLATFORM_ROLES` (Admin/Manager/Agent). Save goes through `adminApi.createPlan`/`updatePlan`, packaging both into a single "Smart JSON" `features` payload: `{ display, permissions }`.

### Health
Platform metrics tiles (total leads, meetings, active integrations, system load) sourced from `stats.platformMetrics`.

### Meta Deletions
Table of Meta (Facebook) data-deletion callback requests via `integrationApi.getDeletionRequests()` — this API belongs to the integrations cluster, only consumed here.

### Announcements
Broadcast composer (title, message, type, target `all`|`company` with a company multi-picker, image URL, modal toggle, frequency `once`|`session`|`always`, CTA text/link, expiry) → `adminApi.sendBroadcast`. History list via `adminApi.getBroadcastHistory`.

### Tester Requests
Paginated list of beta-tester access requests; status update via `adminApi.updateTesterRequestStatus`.

## Notes
- `PaginationSection` is a locally-defined reusable pagination control (first/prev/numbered/next/last) shared across tabs within this file only.
- No dedicated components subfolder; everything lives in this one file plus `src/components/ui/*`, `src/components/RoleGuard.tsx`, `src/components/shared/ConfirmationModal.tsx`.

See also: `../features/system_admin.md`, `../api/admin.md`, `../flows/super-admin-governance.md`, `./admin-payments.md`.
