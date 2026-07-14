---
type: page
route: "* (layout, not a routable page)"
file: "src/app/layout.tsx, src/app/(dashboard)/layout.tsx"
feature: dashboard
layoutChain: [src/app/layout.tsx]
auth: protected
---

# Page: App Shell (Root Layout + Dashboard Layout)

## Purpose
Two nested layouts that wrap every page in the app:
1. **`src/app/layout.tsx`** (root) — HTML document shell. Sets up `Inter` font, `ThemeProvider` (light/dark), `ErrorProvider` (global error modal), the global `<Toaster>` (sonner, `position="top-right" richColors closeButton`), and imports global CSS + Tabler icon webfont + `globalErrorHandler`. Applies to public auth pages too (signin/register/etc. all live outside `(dashboard)` but still under this root layout).
2. **`src/app/(dashboard)/layout.tsx`** (route group layout) — the protected shell: mounts `UserProvider` (identity/role/plan context), `WhatsAppProvider` (live-chat session context, not covered in this cluster), `SubscriptionGuard` (blocks expired/suspended companies), and renders the persistent `Sidebar` + `Header` chrome around `{children}`.

## Components used
- Root: `ThemeProvider` (`src/components/theme-provider.tsx`, not in this cluster's scope), `Toaster` (`src/components/ui/sonner.tsx`), `ErrorProvider` (`src/contexts/ErrorContext.tsx`).
- Dashboard: `Sidebar` (`src/components/sidebar.tsx`), `Header` (`src/components/header.tsx`, out of this cluster's scope), `UserProvider` (`src/contexts/UserContext.tsx`), `SubscriptionGuard` (`src/components/SubscriptionGuard.tsx`), `WhatsAppProvider` (out of scope).

## Data/API calls
None directly in the layout files. `UserProvider` fetches `getUser()` (`GET /api/user`) on mount — see [state/user-context.md](../state/user-context.md).

## Notable behavior
- Provider nesting order in `(dashboard)/layout.tsx`: `UserProvider` > `WhatsAppProvider` > `SubscriptionGuard` > shell markup. `SubscriptionGuard` reads `useUser()` so it must be inside `UserProvider` — confirmed by nesting order.
- `SubscriptionGuard` renders `null` while `isLoading` (blocks flash-of-content), bypasses restriction entirely for Super Admins and for anyone with `localStorage.admin_token` set (impersonation session), and always allows `/settings` through (so a suspended/expired company can still reach billing to fix it). See [flows/impersonation.md](../flows/impersonation.md).
- Sidebar owns local UI state (`mobileOpen`, `isCollapsed`) lifted up from the dashboard layout and passed down as props — the layout is a thin container, not a state owner beyond that.
- Mobile: clicking the dark overlay (`mobileOpen && ...`) closes the sidebar; `Sidebar` also self-closes on route change (`pathname` effect).
- `main` content area uses `overflow-y-auto` with a `no-scrollbar` utility class — check `globals.css` if scrollbars behave unexpectedly.
