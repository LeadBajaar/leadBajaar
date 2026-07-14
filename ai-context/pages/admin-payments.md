---
type: page
route: /admin/payments
file: src/app/(dashboard)/admin/payments/page.tsx
feature: system_admin
auth: protected
subRoutes: []
---
# Page: /admin/payments

## Purpose
Manual payment approval and billing-history console, plus coupons and payment settings, as 4 tabs: Pending Approvals, All Payments, Coupons, Settings.

## Guard
`RoleGuard allowedTypes={['super_admin']} allowedFeatures={['system_admin']}` — stricter than `/admin` (adds an explicit `user_type` check).

## Tabs
### Pending Approvals
Paginated table (`adminApi.getPendingPayments`) of manually-submitted payments awaiting approval (bank transfer/UPI proof workflow). Approve action opens a `ConfirmationModal` → `adminApi.approvePayment(id)`, which fully activates the company's account. Flags companies in a `"Temporary Active"` grace-period state with a badge.

### All Payments
Paginated table (`adminApi.getBilling`) — full billing/payment history across the platform with type, amount, status (pending/approved/other), and processor name.

### Coupons
Delegated to page-local component `src/app/(dashboard)/admin/payments/components/CouponsTab.tsx`, backed by `adminApi.getCoupons`/`createCoupon`/`updateCoupon`/`deleteCoupon`.

### Settings
Delegated to page-local component `src/app/(dashboard)/admin/payments/components/SettingsTab.tsx`, backed by `adminApi.getSettings`/`updateSettings`.

## Notes
- `src/app/(dashboard)/admin/payments/components/` is a **page-colocated** components folder (Next.js convention, sits inside the route segment) — not a shared/reusable folder under `src/components`, so it isn't tracked as a general components doc for this cluster, but is flagged here since it's a real, previously-unlisted component subfolder.
- Both custom pagination widgets (Pending/All tabs) use `src/components/ui/pagination.tsx` primitives directly (`Pagination`, `PaginationContent`, `PaginationItem`, etc.) rather than the `PaginationSection` helper defined inside `/admin`'s page component.

See also: `../features/system_admin.md`, `../api/admin.md`, `../flows/super-admin-governance.md`, `./admin-dashboard.md`.
