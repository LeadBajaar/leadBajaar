---
type: feature
slug: agency_management
name: Agency Client Management
status: active
roles: [Super Admin, Admin]
userTypes: [agency, super_admin]
planFeatureKey: agency_management
routes: ["/agency"]
relatedDocs:
  pages: [agency]
  components: []
  api: [agency]
  flows: [agency-client-management]
---
# Feature: Agency Client Management

## Summary
Lets an `agency`-type account (or Super Admin) onboard, monitor, and manage a portfolio of sub-client companies (individual workspaces created and owned by the agency). Provides portfolio-level stats, client onboarding with either an invitation link or a direct password, subscription renewal, deletion, subscription-history audit, and one-click "Open Panel" impersonation into the client's own `/dashboard`.

## Access control
- Page wrapped in `RoleGuard allowedTypes={['agency','super_admin']} allowedFeatures={['agency_management']}` (`src/app/(dashboard)/agency/page.tsx`).
- Sidebar entry "Clients" (`src/components/sidebar.tsx` line ~43): `roles: ['Super Admin','Admin']`, `types: ['agency','super_admin']`, `feature: 'agency_management'`.
- Individual-type users never see or can access this route (RoleGuard `allowedTypes` blocks them even if somehow granted the feature flag).
- Agency and Super Admin bypass plan-based `hasFeature` gating per `UserContext.hasFeature` (Super Admin always true; agency/individual still evaluated against `company.plan_details` unless Super Admin).

## Key files
- Page: `src/app/(dashboard)/agency/page.tsx`
- API group: `agencyApi` in `src/lib/api.ts` (line ~1949) — see `api/agency.md`
- Impersonation session helper: `src/lib/auth.ts` (`setSession`)
- Shared modal: `src/components/shared/ConfirmationModal.tsx`
- No dedicated `components/agency` folder exists — the page composes directly from `src/components/ui/*` (Card, Table, Dialog, Badge, Tooltip, etc.)

## Notes
- Impersonation ("Open" button) stashes the agency's own token into `localStorage.admin_token` before swapping in the client's token, then hard-navigates to `/dashboard`. This is the same admin_token pattern used by Super Admin impersonation (see `flows/agency-client-management.md` and `flows/super-admin-governance.md`).
- Onboarding a client either returns an `invitation_link` (password left blank) or emails login details directly (password supplied) — UI branches accordingly.
- Team management for a company's own internal members is a separate feature owned by another documentation cluster; only cross-referenced here.
