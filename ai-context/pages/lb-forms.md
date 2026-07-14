---
type: page
route: /lb-forms
file: src/app/(dashboard)/lb-forms/page.tsx
feature: lb_forms
auth: protected
---
# Page: /lb-forms

## Purpose
List all LB Forms belonging to the workspace in a table (name/slug, active/auto-lead badges, submission count linking to the submissions page, created date), with row actions to share/edit/toggle-active/delete, and a "New Form" CTA.

## Components used
- `DeleteConfirmationModal` (`@/components/shared/DeleteConfirmationModal`).
- Plain shadcn `Dialog`/`Tabs`/`Tooltip`/`DropdownMenu` for the Share dialog (Share Link tab + Embed Code tab).

## Data/API calls
- Raw `fetch` calls to `${API_BASE_URL}/lb-forms` (GET list, PUT `{id}` for active toggle, DELETE `{id}` / `{id}?force=true`) with manual `Authorization: Bearer {localStorage.token}` headers — **not** via a wrapped `integrationApi`/`lbFormsApi` service (see [features/lb_forms.md](../features/lb_forms.md) Notes for why this is an outlier).

## Notable behavior
- No `RoleGuard` wrapper on this page.
- Share dialog generates two things client-side: the public URL `${window.location.origin}/lb-f/{slug}` and an `<iframe>` embed snippet (both copy-to-clipboard via `navigator.clipboard`).
- Delete supports a `forceDelete` flag appended as `?force=true` — presumably bypasses a backend guard when the form still has submissions (the confirmation modal doesn't currently surface a checkbox for this in the reviewed code path; `forceDelete` state exists but its toggle UI wasn't found wired to a visible control in this file — treat as inferred backend contract, not fully confirmed UI).
- Loading state renders skeleton table rows; empty state shows a CTA to create the first form.
