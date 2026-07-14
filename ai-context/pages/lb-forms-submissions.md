---
type: page
route: /lb-forms/[id]/submissions
file: src/app/(dashboard)/lb-forms/[id]/submissions/page.tsx
feature: lb_forms
auth: protected
---
# Page: /lb-forms/[id]/submissions

## Purpose
Table view of all submissions received for one LB Form: first 5 field values shown as columns, a "View All" dialog per row with every field + IP address + submitted timestamp, and a client-side CSV export.

## Components used
- Plain shadcn `Dialog` for the per-row "View All" detail modal.

## Data/API calls
- `GET ${API_BASE_URL}/lb-forms/{id}` — form title + `fields[]` (for column headers), raw `fetch` with manual bearer token.
- `GET ${API_BASE_URL}/lb-forms/{id}/submissions` — submission list (`id`, `data` JSON object keyed by field label, `ip_address`, `created_at`).

## Notable behavior
- CSV export (`exportSubmissionsToCSV`) is fully client-side: unions all keys across all submissions' `data` objects, builds a header row (`Submitted At`, `IP Address`, ...field keys), quotes/escapes values, joins into a `Blob`, and triggers a download named `form_submissions_{id}.csv` — no server-side export endpoint is called.
- Table only renders the first 5 fields as columns (`fields.slice(0, 5)`); all fields are still visible via the "View All" dialog.
- Array-valued answers (e.g. multi-select checkboxes) are joined with `', '` for display and `'; '` for CSV.
- No `RoleGuard` wrapper.
