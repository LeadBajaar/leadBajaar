---
type: page
route: /dashboard
file: "src/app/(dashboard)/dashboard/page.tsx"
feature: dashboard
layoutChain: ["src/app/layout.tsx", "src/app/(dashboard)/layout.tsx"]
auth: protected
---

# Page: /dashboard

## Purpose
Company performance overview: stat cards (leads, meetings, conversion, response time), monthly leads/meetings chart, lead pipeline funnel, recent activity feed, and a compact account-info card for the logged-in user. Also hosts an Android app download promo (with QR modal) and a beta-tester request form.

## Components used
`Avatar`, `Badge`, `Skeleton`, `Dialog`, `Input`, `Label`, `Button` (shadcn/ui), `Overview` (chart, `src/components/overview.tsx`), dynamic `lucide-react` icons resolved by name string.

## Data/API calls
- `getDashboardStats()` — `GET /dashboard/stats` — returns `{ stats, monthly_overview, pipeline, recent_activity }`.
- `submitTesterRequest({ name, email, phone })` — `POST /tester-requests`.
- `useUser()` — reads `user` for the account card and prefills the tester-request form.

## Notable behavior
- Falls back to hard-coded `demoDashboardData` if the API returns empty/zeroed stats or throws — see [features/dashboard.md](../features/dashboard.md) notes for the exact condition (`!statsData.stats.length || every stat value === 0`).
- Uses the **legacy** `useToast` hook (`@/components/ui/use-toast`) for the tester-request toast — inconsistent with the repo's `sonner`-only convention used everywhere else in this cluster.
- Persists "banner minimized" state to `localStorage.lb_dashboard_banner_minimized`, restored on mount before first paint via a loaded-flag (`hasLoadedPersistence`) to avoid overwriting saved state with the default.
- Renders `user.company?.name` (never the raw `company` object) in the account info rows — correct per the critical rendering rule.
- Uses fixed skeleton bar heights (`SKELETON_BAR_HEIGHTS` array) instead of `Math.random()` specifically to avoid SSR/client hydration mismatches — a deliberate pattern worth reusing elsewhere if adding new skeletons.
