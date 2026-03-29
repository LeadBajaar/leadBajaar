# Frontend Architecture Guide: Multi-Tenant Workspace Integration

> **Last Updated:** March 28, 2026 (Refined RBAC Audit Completed)  
> **Status:** Production-Ready (Full Page-Level Guards Implemented)

---

## 📌 Overview

LeadBajar's frontend supports a **Multi-Tenant (Workspace-Centric)** architecture where all data is scoped to a **Company (workspace)**. The UI enforces three access dimensions simultaneously:

1. **Role** — what actions a user can take (`Admin`, `Manager`, `Agent`, `Super Admin`)
2. **Account Type** — what kind of account the user holds (`individual`, `agency`, `super_admin`)
3. **Subscription Plan** — which features are unlocked (`Free`, `Pro`, `Enterprise`)

---

## 🏗️ Access Control Architecture

All three access dimensions are managed through a single context:

### `UserContext` (`/src/contexts/UserContext.tsx`)

The `UserProvider` wraps the entire dashboard layout (`layout.tsx`) and provides:

```typescript
type UserRole = 'super_admin' | 'Admin' | 'Manager' | 'Agent' | 'Super Admin'
type UserType = 'agency' | 'individual' | 'super_admin'

interface User {
  name: string;
  email: string;
  role: UserRole;
  user_type: UserType;        // Account tier
  company_id: number | null;  // Workspace FK
  company?: {
    name?: string;            // Workspace display name
    plan?: string;            // 'Free' | 'Pro' | 'Enterprise'
  };
}
```

**Context helpers:**

| Helper | Signature | Purpose |
| :--- | :--- | :--- |
| `hasRole()` | `(roles: UserRole[]) → boolean` | Role-based access (Admin, Manager, etc.) |
| `hasType()` | `(types: UserType[]) → boolean` | Account type gating |
| `hasPlan()` | `(plans: string[]) → boolean` | Subscription plan gating |

---

## ⚠️ Critical: Company Field Rendering

The `/api/user` endpoint returns `user.company` as a **full database object**, not a string. Rendering the object directly as a React child crashes the application (React error #31).

```tsx
// ✅ CORRECT — access specific string fields
<span>{user?.company?.name || 'Not provided'}</span>
<span>{user?.company?.plan || 'Free'}</span>

// ❌ WRONG — crashes in production with React error #31
<span>{(user as any).company}</span>
```

This applies to every component that displays workspace info — especially the Dashboard profile card.

---

## 🔐 Authorization Patterns

### 1. Protecting Pages — `RoleGuard`

```tsx
import { RoleGuard } from '@/components/RoleGuard'

// Restrict by role:
<RoleGuard allowedRoles={['Super Admin', 'Admin']}>
  <AdminContent />
</RoleGuard>

// Restrict by account type:
<RoleGuard allowedTypes={['agency', 'super_admin']} fallbackPath="/dashboard">
  <AgencyContent />
</RoleGuard>

// Restrict by plan (NEW):
<RoleGuard allowedPlans={['pro', 'enterprise']}>
  <PremiumContent />
</RoleGuard>
```

### 2. Conditional Rendering — `useUser` Hook

```tsx
const { hasRole, hasType, hasPlan } = useUser()

// Role-based:
{hasRole(['Admin', 'Super Admin']) && <DeleteButton />}

// Account type-based:
{hasType(['agency']) && <AgencyMetrics />}

// Plan-based:
{hasPlan(['pro', 'enterprise'])
  ? <IntegrationsPanel />
  : <UpgradePrompt />
}
```

---

## 🧭 Sidebar Navigation — Plan-Based Feature Gating

Navigation items use a `plans` field to gate access by subscription:

```typescript
interface NavItemDef {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];    // Who can see this by role
  types?: UserType[];   // Restrict to specific account types
  plans?: string[];     // Restrict to specific subscription plans
}
```

**Filtering rule:**  
- Items with `plans` are hidden from `Free` individual accounts.  
- Agency and Super Admin accounts **always bypass plan checks**.

```typescript
const planMatch = !item.plans
  || hasPlan(item.plans)
  || hasType(['agency', 'super_admin'])  // Bypass for non-individual accounts
```

**Account tier behaviour:**

| Account Type | Plan Check Applied? | Notes |
| :--- | :--- | :--- |
| `individual` | ✅ Yes | Sees only items matching their plan |
| `agency` | ❌ No | Full platform access regardless of plan |
| `super_admin` | ❌ No | Full platform access |

---

## 🎨 Design Principles

- **Collaborative**: Team members within a workspace share Leads, Bookings, Integrations, and Notifications.
- **Isolated**: Workspace boundaries are enforced via `company_id` on the backend. The frontend never needs to manually pass `company_id` — the backend resolves it from the session.
- **Gated by Tier**: Individual account features are unlocked progressively by subscription plan.

---

## 🛠️ Agency Onboarding Workflow

Agencies onboard clients via the `AgencyPortalPage` (`/agency`):

- **Direct Password Setup**: Client is created with a password — can log in immediately.
- **Setup Links**: If no password provided, a unique `/setup-account?token=...` URL is generated.
- **Confirmation UX**: A success modal shows the setup link for easy copying and sharing.

---

## 🖥️ Super Admin Portal (`/admin`)

The Super Admin portal (`super_admin` type only) provides full platform governance:

- **Company Management**: View all workspaces, update plan/status/type, adjust subscription dates (including backdating for pre-existing clients).
- **Subscription Extension**: Manually extend any company's subscription by N days. History is automatically logged.
- **User Management**: View/edit users across all tenants, change roles, reassign companies.
- **Impersonation**: Log in as any user. The sidebar shows an "Exit Impersonation" banner when active.
- **Platform Metrics**: MRR totals, active companies, total users, integration health.

---

## ⚙️ Key API Behaviour

- **Authentication**: All API calls pass a `Bearer` token via `Authorization` header. The backend resolves `company_id` from the authenticated user automatically — the frontend never passes it explicitly.
- **Authenticated User Endpoint**: `GET /api/user` returns the user **with the company relationship eager-loaded**. This provides `company.name` and `company.plan` for feature gating.
- **Data Scope**: All CRUD endpoints (Leads, Bookings, Integrations, etc.) automatically filter by the authenticated user's workspace. No client-side filtering by `company_id` is needed.

---

## 🚀 Adding New Features — Checklist

When building a new feature that respects multi-tenancy:

- [ ] Data is fetched via `src/lib/api.ts` functions — never fetch directly in components
- [ ] If the feature should be role-gated: wrap with `<RoleGuard allowedRoles={[...]}>` or check `hasRole()`
- [ ] If the feature is agency-only: add `hasType(['agency', 'super_admin'])` check
- [ ] If the feature is plan-gated: add `plans: [...]` to the nav item AND `hasPlan()` check inside the component
- [ ] Never render `user.company` as a React child — always access `user.company?.name` or `user.company?.plan`
- [ ] The `ChatUser` interface (live chat visitors) has its own separate `company: string` field — do not confuse with the auth user's `company` object

---

## ⏳ Pending / Future UI Work

| Item | Priority | Notes |
| :--- | :--- | :--- |
| **Upgrade Banner Component** | High | Show when a user hits a plan gate, with CTA to upgrade |
| **Settings Page — Real Data** | Medium | Currently uses hardcoded placeholders; should load from `/api/user` |
| **Global Revenue Dashboard** | Low | Super Admin analytics: per-agency MRR, growth, churn |
| **Automated Expiry UI** | Low | Show "subscription expired" state when `company.status === 'Suspended'` |
