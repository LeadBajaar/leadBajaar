---
type: feature
slug: lb_forms
name: LB Forms
status: active
roles: ["Super Admin", "Admin", "Manager"]
userTypes: ["agency", "super_admin", "individual"]
planFeatureKey: integrations
routes: ["/lb-forms", "/lb-forms/new", "/lb-forms/[id]", "/lb-forms/[id]/submissions"]
relatedDocs:
  pages: [../pages/lb-forms.md, ../pages/lb-forms-new.md, ../pages/lb-forms-detail.md, ../pages/lb-forms-submissions.md]
  components: []
  api: []
  flows: []
---
# Feature: LB Forms

## Summary
Native drag-and-drop form builder for creating standalone public lead-capture forms hosted at `/lb-f/[slug]` (public route, outside `(dashboard)` — not read as part of this cluster) and embeddable via `<iframe>`. Each form has a title/description, an ordered list of typed fields (text/textarea/email/phone/number/date/select/radio/checkbox) built with `@hello-pangea/dnd` drag-and-drop, an `active` flag gating public submissions, an `auto_create_lead` flag to auto-create a CRM Lead on each submission, and an optional post-submit `redirect_url`. Submissions are stored per-form and viewable/exportable as CSV. Listed as the `lb_forms` card in the Integrations hub (`allowMultiple: false` — one connection toggles the feature on but the actual forms list lives at `/lb-forms`, independent of the hub's connect/disconnect flow).

## Access control
- Sidebar item `LB Forms` (`src/components/sidebar.tsx` line ~73): `roles: ['Super Admin','Admin','Manager']`, `types: ['agency','super_admin','individual']`, `feature: 'integrations'`. Additionally hidden by `canSee()` unless `lbFormsEnabled` is true, i.e. unless the company has an active `integrations` row with `type === 'lb_forms'` (toggled on from the Integrations hub's "LB Forms" card, or activated directly).
- **None of the four `/lb-forms*` pages wrap content in `RoleGuard`** — unlike most other dashboard features in this cluster, access is enforced only by (a) the sidebar link being hidden per above and (b) the shared dashboard layout's auth check. There is no explicit `hasFeature('lb_forms')` or similar guard inside the page components themselves.
- The public submission page `/lb-f/[slug]` (outside this cluster) is unauthenticated by design — it is the form's public-facing embed target.

## Key files
- List page: `src/app/(dashboard)/lb-forms/page.tsx`
- Builder (new): `src/app/(dashboard)/lb-forms/new/page.tsx`
- Builder (edit): `src/app/(dashboard)/lb-forms/[id]/page.tsx`
- Submissions viewer: `src/app/(dashboard)/lb-forms/[id]/submissions/page.tsx`
- No dedicated `lb-forms` API group in `src/lib/api.ts` — see Notes.

## Notes
- **Deviates from the "always use `src/lib/api.ts`" convention**: all four LB Forms pages call the backend directly with raw `fetch(`${API_BASE_URL}/lb-forms...`)` calls (manually attaching `Authorization: Bearer ${localStorage.getItem('token')}`), rather than going through a wrapped `api`/`lbFormsApi` object. `API_BASE_URL` is imported from `src/lib/api.ts` but no `lbFormsApi` service object exists there. Any future refactor should introduce one for consistency; until then, treat these four pages as an intentional (if inconsistent) exception.
- Backend endpoints inferred from the raw fetch calls (no formal `api.ts` wrapper — infer signatures from call sites, not verified against backend source):
  - `GET /lb-forms` — list forms for the company
  - `POST /lb-forms` — create form (`title`, `description`, `fields[]`, `active`, `auto_create_lead`, `redirect_url`, `theme_color`)
  - `GET /lb-forms/{id}` — fetch one form (used by both edit page and submissions page for the title/fields)
  - `PUT /lb-forms/{id}` — update form (partial: `active` toggle from list page also uses this)
  - `DELETE /lb-forms/{id}` and `DELETE /lb-forms/{id}?force=true` — delete, with a "force" variant (`forceDelete` state on the list page, presumably to bypass a check for existing submissions)
  - `GET /lb-forms/{id}/submissions` — list submissions (`data` JSON blob, `ip_address`, `created_at`)
- Public URL pattern: `${window.location.origin}/lb-f/{slug}` — the list page's Share dialog generates both a direct link and an `<iframe>` embed snippet (`?embed=true` query param) for this.
- CSV export (submissions page) is done fully client-side: flattens each submission's `data` object to a row, joins to CSV text, and triggers a `Blob` download — no server export endpoint involved.
- The builder pages duplicate ~90% of their code between `new/page.tsx` and `[id]/page.tsx` (same `FIELD_TYPES`, drag-and-drop canvas, field-settings sidebar) — a shared component/hook would reduce duplication but none currently exists.
