---
type: component-group
group: sidebar
directory: src/components
usedByFeatures: [dashboard, account_settings, team_management, authentication]
---

# Components: sidebar

## Sidebar (`src/components/sidebar.tsx`)
The single, dynamic left-navigation component rendered by `(dashboard)/layout.tsx`. It is the canonical source of truth for route → role/type/plan/feature mapping in the whole app.

**Props**: `mobileOpen?`, `setMobileOpen?`, `isCollapsed?`, `setIsCollapsed?` — all lifted state owned by `(dashboard)/layout.tsx`.

**Structure**:
- `mainNav: NavItemDef[]` — top-level items always shown together (Dashboard, Leads, Live Chat, Evolution Inbox, Chatbot, Evolution Chatbot, Meetings).
- `sidebarSections: NavSection[]` — grouped, collapsible-labeled sections: "Clients & Growth" (Clients, Analytics), "Organization" (Team), "Automation" (Automations), "Platform Control" (Admin, Emails, Error Logs, Finance, Payments, Dev Hub), "Integrations" (LB Forms, WhatsApp Cloud API, WhatsApp Evolution, Facebook Lead Forms, Meta Conversion API, Webhooks, Email Marketing, Facebook Auth, Integrations, WhatsApp Bot), "Account" (Settings).
- `NavItemDef` shape: `{ name, href, iconClass, roles: UserRole[], types?: UserType[], plans?: string[], feature?: string, exact?: boolean }`.

**Visibility logic** (`canSee(item)`):
1. A handful of integration nav items (`LB Forms`, `WhatsApp Cloud API`, `Facebook Lead Forms`, `Meta Conversion API`, `Webhooks`, `Email Marketing`, `Facebook Auth`, `WhatsApp (Evolution)`, and the two `/evolution/*` routes) are additionally hidden unless the corresponding integration is connected+active, checked via `integrationApi.getConnectedIntegrations()` on mount and refreshed on a custom `window` event `integrationsUpdated`.
2. Then: `hasRole(item.roles) && (!item.types || hasType(item.types)) && (!item.feature || hasFeature(item.feature)) && (!item.plans || hasPlan(item.plans) || hasType(['agency','super_admin']))`.
3. Agency and Super Admin account types always pass the `plans` check (bypass gating) per the last clause.

**Other behavior**:
- Detects impersonation via `localStorage.admin_token` presence (`isAdminImpersonating`) and renders a "Return to Admin" banner/button above the nav list when true. See [flows/impersonation.md](../flows/impersonation.md).
- `handleLogout()` calls `logout()` API, `clearSession()`, removes `admin_token`, redirects to `/signin`.
- `handleReturnToAdmin()` restores the original admin token from `localStorage.admin_token`, removes it, and hard-navigates (`window.location.href`) to `/dashboard`.
- Auto-closes on mobile whenever `pathname` changes.
- Footer shows user avatar-initial, name, email; clicking navigates to `/settings`.
- Active-link detection: `exact: true` items (Admin, Integrations root) match only exact pathname; all others match pathname-or-prefix.
