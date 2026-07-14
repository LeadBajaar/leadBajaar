---
type: component-group
group: leads
directory: src/components/leads
usedByFeatures: []
---
# Components: leads

**Status: unused placeholder/mockup set.** Nothing under `src` imports from `@/components/leads/*` (verified via grep). This directory appears to be an earlier or exploratory presentational-component kit (Tabler-icon classes like `ti ti-*`, bare `className`/inline-`style` CSS-var driven mockups) with prop shapes that do **not** match the real, wired leads UI. The actual, in-use leads table/kanban/etc. live as route-local files in `src/app/(dashboard)/leads/` (e.g. `LeadsTable.tsx`, `KanbanBoard.tsx` there — different files, same names) — see [pages/leads.md](../pages/leads.md). Do not wire new work to this directory without confirming intent; it looks like dead scaffold.

## MetricCard.tsx
- Path: `src/components/leads/MetricCard.tsx`
- Purpose: generic stat-card display (label/value/trend arrow)
- Props: `{ label: string; value: string; trend?: string; trendUp?: boolean }`

## Helpers.tsx
- Path: `src/components/leads/Helpers.tsx`
- Purpose: shared presentational helpers for the mockup set
- Exports:
  - `StageBadge({ stage })` — maps a fixed set of stage names (`Appointment Booked`, `Qualified`, `In Progress`, `Contacted`, `Lost`, `New Lead`) to badge color classes; unrecognized stages fall back to `badge-neutral`. Note: this stage list is a **hardcoded, different set** from the real app's dynamic/DB-driven stages (`getStages()` API, `defaultStages` in `app/leads/types.ts`).
  - `getAvatarColor(name)` / `getInitials(name)` / `Avatar({ name, size })` — deterministic (first-char-based) avatar color + initials generator, 5-color palette.

## KanbanBoard.tsx
- Path: `src/components/leads/KanbanBoard.tsx`
- Purpose: static kanban mockup, columns of lead cards
- Props: `{ columns: { id: string; name: string; color: string; leads: any[] }[] }`
- Note: same component name as `src/app/(dashboard)/leads/KanbanBoard.tsx` (the real one used by `/leads`), but a completely different, simpler implementation — no drag/drop, no API wiring, `leads: any[]`.

## ActivityTimeline.tsx
- Path: `src/components/leads/ActivityTimeline.tsx`
- Purpose: static activity/notes timeline mockup (note/call/stage_change/created icons) plus a bare `<textarea>` for adding a note — no submit handler wired.
- Props: `{ activities: any[] }`

## LeadsTable.tsx
- Path: `src/components/leads/LeadsTable.tsx`
- Purpose: minimal static table mockup (checkbox, name+avatar, phone, stage badge, created date, edit/chat/delete icon buttons — none wired to handlers)
- Props: `{ leads: any[] }`
- Note: distinct from and much simpler than the real `src/app/(dashboard)/leads/LeadsTable.tsx` used by `/leads`.

## PageHeader.tsx
- Path: `src/components/leads/PageHeader.tsx`
- Purpose: generic page-header mockup (title/subtitle/actions slot)
- Props: `{ title: string; subtitle?: string; actions?: React.ReactNode }`

## Sidebar.tsx
- Path: `src/components/leads/Sidebar.tsx`
- Purpose: static app-nav mockup (Dashboard/Leads/Live Chat/Chatbot/Meetings + Integrations section) — no props, no routing, hardcoded "active" state on Dashboard.
- **Distinct from** `src/components/sidebar.tsx`, the real, dynamic, role/type/plan-filtered navigation component used by the app shell.
