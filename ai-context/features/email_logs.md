---
type: feature
slug: email_logs
name: Email Infrastructure Monitoring
status: active
roles: [Super Admin]
userTypes: [super_admin]
planFeatureKey: email_logs
routes: ["/admin/emails"]
relatedDocs:
  pages: [admin-emails]
  components: []
  api: [admin]
  flows: [super-admin-governance]
---
# Feature: Email Infrastructure Monitoring

## Summary
Platform-wide view into transactional email volume and health: total/monthly sent counts, System (AWS SES) vs Custom SMTP usage split, failure rate with a 5% threshold warning, a per-company table (paginated, searchable, status-filterable) with expandable rows to toggle per-user "new lead" / "meeting booked" notification emails, a company-level email kill-switch, and a live feed of the last 20 delivery failures.

## Access control
- **No `RoleGuard` wrapper in the page component itself** (`src/app/(dashboard)/admin/emails/page.tsx` has no `RoleGuard` import) — access is enforced only via the sidebar link visibility (`feature: 'email_logs'`, `roles: ['Super Admin']`, `types: ['super_admin']`) and presumably backend-side auth on `/admin/email-stats` etc. Any authenticated user who navigates directly to `/admin/emails` and whose token happens to be accepted by the backend endpoint would see the page render — the actual authorization boundary lives server-side, not client-side. This differs from `/admin/errors` (which does wrap in `RoleGuard`) — flagged as an inconsistency worth confirming with the backend team.
- Sidebar entry "Emails" (`src/components/sidebar.tsx` line ~63): `roles: ['Super Admin']`, `types: ['super_admin']`, `feature: 'email_logs'`.

## Key files
- Page: `src/app/(dashboard)/admin/emails/page.tsx`
- API calls used directly from `adminApi`: `getEmailStats`, `toggleCompanyEmail`, `toggleUserNotification` (see `api/admin.md`)
- No dedicated `components/` folder — built from `src/components/ui/*` (Card, Table, Progress, Select, Pagination, Badge).

## Notes
- "System" emails route through a shared AWS SES identity; the page explicitly warns that high failure rates on that shared channel risk platform-wide IP/domain reputation, and suggests suspending offending companies via the per-company `Power` toggle.
- Per-user notification toggles operate on `user.notification_settings.email_notifications.{new_lead|meeting_booked}` and merge the company owner into the member list for display.
