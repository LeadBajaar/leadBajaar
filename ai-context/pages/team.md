---
type: page
route: /team
file: "src/app/(dashboard)/team/page.tsx"
feature: team_management
layoutChain: ["src/app/layout.tsx", "src/app/(dashboard)/layout.tsx"]
auth: protected
---

# Page: /team

## Purpose
Team member directory and role management. Two tabs: "Directory" (search/list members with role badges, status dots, per-row actions menu) and "Roles" (static permissions matrix + role summary cards).

## Components used
`Card`, `Input`, `Button`, `Badge`, `Label`, `Table`, `Dialog`, `Select`, `DropdownMenu`, `Tabs` (shadcn/ui), `RoleGuard` (`src/components/RoleGuard.tsx`).

## Data/API calls
- `teamApi.getMembers()` — `GET /team` — populates the directory on mount.
- `teamApi.inviteMember({ email, role })` — `POST /team/invite`.
- `teamApi.updateRole(id, role)` — `PATCH /team/:id/role`.
- `teamApi.removeMember(id)` — `DELETE /team/:id`.
- `teamApi.resendInvite(id)` — `POST /team/:id/resend-invite`.
- Errors funneled through `handleError()` (`src/utils/handleError.ts`) with a per-action title.

## Notable behavior
- Wrapped in `<RoleGuard allowedFeatures={['team_management']}>`.
- Client-side `Role` type is `'Admin' | 'Manager' | 'Agent'` only — Super Admin cannot be assigned from this UI.
- "Resend Invite" action only appears in the row dropdown when `member.status === 'Invited'`.
- Stat counters (Total/Admins/Agents/Pending) are derived client-side from the fetched `members` array, not separate API calls.
- The Roles tab's permissions matrix (`permissions` constant) is static, hard-coded content — not driven by `hasFeature()` or any backend config; it will drift from actual enforcement if role capabilities change server-side.
- New team members complete activation via the separate [`/setup-account`](../pages/setup-account.md) page using the emailed invite token.
