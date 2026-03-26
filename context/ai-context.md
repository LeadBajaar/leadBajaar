# LeadBajaar Web - AI Context

This document provides context for AI assistants to understand the project structure, technology stack, and business logic of the LeadBajaar web application.

---

## Project Overview

LeadBajaar is a full-stack CRM and lead management platform. The frontend is a Next.js 15 app that serves three distinct user tiers: **Individual subscribers**, **Agencies** (managing sub-clients), and **Super Admins** (platform operators). All data is scoped to a **Company (workspace)** via multi-tenant architecture.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/docs) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Shadcn UI pattern)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context (`UserContext`) + React Hooks
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) toast library (NOT `useToast` — do not mix them)
- **Charts**: [Recharts](https://recharts.org/)
- **Real-time**: [Laravel Echo](https://laravel.com/docs/11.x/broadcasting) & [Pusher JS](https://pusher.com/)
- **Workflow Builder**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **API Client**: [Axios](https://axios-http.com/)

---

## Directory Structure

- `/src/app/(dashboard)`: All protected dashboard routes (leads, chatbot, integrations, admin, etc.)
- `/src/components`: Shared UI components
  - `/ui`: Low-level Radix/Shadcn base components
  - `sidebar.tsx`: Dynamic, role/type/plan-filtered navigation
  - `RoleGuard.tsx`: Page-level access control HOC
- `/src/contexts/UserContext.tsx`: **The source of truth** for identity, roles, and subscription state
- `/src/lib/api.ts`: All API service functions — always use these, never fetch directly in components
- `/src/lib/auth.ts`: Auth token utilities (localStorage `token` and `admin_token` for impersonation)
- `/src/hooks`: Custom hooks (`useMediaQuery`, `useDebounce`, etc.)

---

## Multi-Tenancy & Access Control Architecture

### Three-Dimensional Access Control

Every UI feature is gated by three dimensions simultaneously:

1. **Role** (`hasRole()`): `Admin` | `Manager` | `Agent` | `Super Admin`
2. **Account Type** (`hasType()`): `individual` | `agency` | `super_admin`
3. **Subscription Plan** (`hasPlan()`): `free` | `pro` | `enterprise`

All three helpers are exposed by `useUser()` from `UserContext`.

### User Interface (Critical)

```typescript
interface User {
  name: string;
  email: string;
  role: UserRole;
  user_type: 'agency' | 'individual' | 'super_admin';
  company_id: number | null;
  company?: {            // Full Company object from DB — NOT a string
    name?: string;
    plan?: string;
    // May also contain: id, parent_id, status, expires_at, type, settings, created_at, updated_at
  };
}
```

### ⚠️ Critical Rule — Company Rendering

`user.company` is a **full database object**. Rendering it as a React child causes a production crash (React error #31). Always access specific fields:

```tsx
// ✅ Correct
user.company?.name
user.company?.plan

// ❌ Crash in production
{user.company}
{(user as any).company}
```

### Sidebar Feature Gating

`NavItemDef` accepts `roles`, `types`, and `plans` arrays. Agency and Super Admin accounts bypass `plans` checks.

---

## Account Tier Behaviour

| `user_type` | Plan Gating | Impersonation | Portal |
| :--- | :--- | :--- | :--- |
| `individual` | ✅ Enforced | No | `/dashboard` |
| `agency` | ❌ Bypassed | Yes (of sub-clients) | `/agency` |
| `super_admin` | ❌ Bypassed | Yes (any user) | `/admin` |

---

## Key Pages

| Route | Description | Access |
| :--- | :--- | :--- |
| `/dashboard` | Company-wide performance overview | All |
| `/leads` | Lead CRM with filtering, bulk ops, import/export | All |
| `/live-chat` | Real-time WhatsApp messaging | All |
| `/chatbot` | Node-based chatbot flow builder | Pro/Enterprise or Agency |
| `/integrations` | Facebook & WhatsApp integration setup | Pro/Enterprise or Agency |
| `/analytics` | Aggregated workspace analytics | Enterprise or Agency |
| `/meetings` | Scheduling and calendar management | All |
| `/agency` | Agency client management portal | Agency + Super Admin |
| `/admin` | Super Admin governance platform | Super Admin only |
| `/settings` | User profile & preferences | All |
| `/team` | Team member management | Admin+ |

---

## Notification System

**Use `sonner` exclusively.** The `useToast` hook from shadcn (`@/components/ui/use-toast`) is legacy and causes TypeScript errors in newer code.

```typescript
import { toast } from 'sonner'

toast.success('Saved!')
toast.error('Something went wrong')
```

---

## API Interaction Rules

1. **Authentication**: Bearer token in `Authorization` header — managed by `/src/lib/api.ts`.
2. **Company scoping**: Automatically resolved by the backend from the auth token. Never pass `company_id` manually from the frontend.
3. **User profile**: `GET /api/user` returns the full user with `company` relationship loaded. Access via `useUser()` context — do not re-fetch this route in components.
4. **Admin actions**: Super Admin routes are prefixed `/api/admin/super/...` and checked server-side.

---

## Impersonation Flow (Super Admin)

1. Super Admin calls login-as endpoint → receives target user's token.
2. Frontend stores original token as `localStorage.admin_token`, sets `localStorage.token` to impersonated token.
3. Sidebar detects `admin_token` presence and renders an "Exit Impersonation" banner.
4. Exit restores the original admin token and redirects to `/agency`.

---

## Development Standards

- **Component Architecture**: Small, reusable components. Shadcn pattern for base elements.
- **Data Fetching**: Use `src/lib/api.ts` — never use raw `axios` or `fetch` in page components.
- **Types**: Always define TypeScript interfaces for API response shapes and component props.
- **Styling**: Tailwind utility-first CSS. No inline styles except for dynamic values (e.g., chart colors).
- **Toasts**: Use `sonner` (`toast.success()`, `toast.error()`). Do NOT use `useToast`.
- **Form Handling**: `react-hook-form` + `zod` where applicable.

---

## AI Tool Instructions

When assisting with this codebase:

1. Check `src/contexts/UserContext.tsx` to understand the current User type shape before reading or writing any user-related code.
2. Use `src/lib/api.ts` for all API calls — check existing functions before creating new ones.
3. When a feature needs access control, use `hasRole()`, `hasType()`, or `hasPlan()` from `useUser()`.
4. Never render `user.company` directly — always use `user.company?.name` or `user.company?.plan`.
5. For toasts/notifications, import from `sonner`, not from `@/components/ui/use-toast`.
6. The `ChatUser` interface (live chat visitors) has a `company: string` field — this is a plain string from the Lead model, completely separate from the auth user's `company` object.
7. Refer to `docs/multi_tenant_architecture.md` for the full workspace architecture.
8. Refer to backend docs at `../leadbajar-backend/docs/rbac_ui_implementation.md` for the complete RBAC and multi-tenancy frontend guide.
