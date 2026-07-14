---
type: page
route: /agency
file: src/app/(dashboard)/agency/page.tsx
feature: agency_management
auth: protected
subRoutes: []
---
# Page: /agency

## Purpose
Agency Portfolio dashboard. Lists all sub-client companies the current agency owns, with portfolio-level stats (managed clients, total leads managed across clients, active chat sessions), a searchable client table, and per-client actions.

## Guard
`RoleGuard allowedTypes={['agency','super_admin']} allowedFeatures={['agency_management']}` wraps the whole page.

## Data flow
On mount, `fetchData()` runs `Promise.all([agencyApi.getClients(), agencyApi.getStats()])` and populates `clients`/`stats`. Search filters `clients` client-side by name/owner name (no server round-trip).

## Key interactions
- **Onboard New Client** (dialog): posts `agencyApi.onboardClient({company_name, owner_name, owner_email, password, plan})`. If `password` is left blank, backend returns `invitation_link` shown for copy; otherwise credentials are emailed and the dialog just closes.
- **Open** (per row): `handleOpenPanel` — caches current agency token to `localStorage.admin_token`, calls `agencyApi.loginAsClient(id)`, calls `setSession(token)`, then hard-navigates (`window.location.href`) to `/dashboard` as the client.
- **History** (clock icon): `agencyApi.getClientHistory(id)` populates a modal table of subscription events (type, plan, new expiry).
- **Renew** (refresh icon): confirmation modal → `agencyApi.renewClient(id)` extends the client's plan by 30 days (hardcoded).
- **Delete** (trash icon): confirmation modal → `agencyApi.deleteClient(id)` — permanently removes the client workspace.

## Notes
- Table shows Plan badge + expiry date, managed-lead count, Active/inactive status badge.
- Uses `useToast` from `@/components/ui/use-toast`, which the project's own architecture doc (`context/ai-context.md`) flags as legacy in favor of `sonner` — this page has not been migrated.
- No dedicated components subfolder; composes `src/components/ui/*` directly plus `src/components/shared/ConfirmationModal.tsx`.

See also: `../features/agency_management.md`, `../api/agency.md`, `../flows/agency-client-management.md`.
