---
type: feature
slug: team_management
name: Team Management
status: partial
roles: [Super Admin, Admin]
userTypes: []
planFeatureKey: team_management
routes: ["/team"]
relatedDocs:
  pages: [pages/team.md]
  components: [components/ui-primitives.md]
  api: [api/team.md]
  flows: [flows/authentication-and-onboarding.md]
---

# Feature: Team Management

## Summary
Lets Admins/Super Admins invite new team members by email + role (Admin/Manager/Agent), view a member directory, edit a member's role, resend pending invites, and remove members. Also includes a static, read-only "Permissions Matrix" tab documenting what each role can do (not enforced from this UI — it's informational).

## Access control
Wrapped in `<RoleGuard allowedFeatures={['team_management']}>`. Sidebar entry: `roles: ['Super Admin', 'Admin']` only (Manager/Agent never see the "Team" nav item), no `types` restriction, `feature: 'team_management'`.

## Key files
- `src/app/(dashboard)/team/page.tsx` — directory + roles tabs, invite/edit/delete dialogs.
- `src/lib/api.ts` — `teamApi` group: `getMembers`, `inviteMember`, `resendInvite`, `updateRole`, `removeMember`, `setupAccount`.
- `src/app/setup-account/page.tsx` — the acceptance side of an invite (consumes the emailed token, calls `teamApi.setupAccount`).
- `src/utils/handleError.ts` — centralized error-toast helper used for every mutation on this page (not read in full; referenced for error display).

## Notes
- The `Role` type used client-side (`'Admin' | 'Manager' | 'Agent'`) omits `'Super Admin'` — a team member can never be invited/promoted to Super Admin from this UI, only the three tenant-level roles.
- "Permissions Matrix" tab is a hard-coded static table (`permissions` array in the page) — it does not reflect live `hasFeature()`/plan config and won't update if backend RBAC changes. Treat as documentation-only, not a live permission editor.
- "Reports Generation" and "Custom role creation" mentions in the UI ("limited to enterprise plans") reference features not implemented in this page — informational copy only.
- Error state (`error`) set from `handleError` calls is displayed inline inside the Invite/Edit dialogs but the `handleError` utility itself likely also raises a toast — check `src/utils/handleError.ts` if duplicate error UI appears.
