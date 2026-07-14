---
type: page
route: /admin/emails
file: src/app/(dashboard)/admin/emails/page.tsx
feature: email_logs
auth: protected
subRoutes: []
---
# Page: /admin/emails

## Purpose
"Email Infrastructure Monitoring" — platform-wide email volume/health dashboard: 4 KPI cards (all-time sent, System/SES usage %, Custom SMTP usage %, failed deliveries with a 5% failure-rate threshold indicator), a searchable/status-filterable/paginated company table with expandable rows for per-user notification toggles and a company-level email kill switch, and a "Recent Failures" live feed (last 20).

## Guard
**No `RoleGuard` in this file** — unlike most other pages in this cluster. Access is gated only by the sidebar link (`feature: 'email_logs'`, role/type Super Admin) and whatever the `/admin/email-stats` backend endpoint enforces server-side. See `../features/email_logs.md` Notes for the flagged inconsistency vs. `/admin/errors`.

## Data flow
`fetchStats(search, page, limit, filterStatus)` calls `adminApi.getEmailStats(...)` on mount, on a 500ms debounced search, and on page/limit/status changes.

## Key interactions
- **Toggle company email** (Power icon per row): `adminApi.toggleCompanyEmail(id)` — suspends/activates all email sending for that workspace.
- **Expand row**: reveals every user (owner + members, deduped) in that company with two per-user toggle buttons — "Leads: ON/OFF" and "Meeting: ON/OFF" — each calling `adminApi.toggleUserNotification(userId, type)`.
- **Open workspace** (external-link icon): navigates to `/agency?companyId={id}` (cross-links into the Agency portal view for that company).

## Notes
- Uses CSS custom properties (`var(--crm-*)`, `bg-card`, `text-muted-foreground`) rather than the raw slate/indigo Tailwind palette seen in most other admin pages — suggests a newer design-token pass was applied here.
- No dedicated components subfolder; built from `src/components/ui/*` (Card, Table, Progress, Select, Pagination).

See also: `../features/email_logs.md`, `../api/admin.md`, `../flows/super-admin-governance.md`.
