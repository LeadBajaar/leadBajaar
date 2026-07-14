---
type: page
route: /leads/[id]
file: src/app/(dashboard)/leads/[id]/page.tsx
feature: leads
auth: protected
---
# Page: /leads/[id]

## Purpose
Single-lead profile view: overview (deal value, paid amount, representative/agent assignment), contact details, background info, internal notes (JSON or plain text), and quick-action floating bar (WhatsApp deep-link, call).

## Components used
- shadcn primitives: `Button`, `Badge`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Skeleton`
- `RoleGuard` (`allowedFeatures={['leads']}`)
- `getAgentColor` (`@/utils/agentColors`) for rep-assignment avatar colors
- Local inline `CheckCircle` SVG icon component (defined at bottom of file, not from lucide)
- Uses `temperatureConfig` and `defaultStages` from `../types` (shared with `/leads` list page) for status/stage badge styling

## Data/API calls
- `getLead(Number(id))` on mount — fetches the full lead record
- `teamApi.getMembers()` on mount — populates the "Representative" assignment `<Select>`
- `updateLead(lead.id, { user_id })` — on changing the representative dropdown (re-fetches the lead via `getLead` afterward to refresh `agent` relation)

## Notable behavior
- Loading state shows skeleton cards; not-found state shows a "Lead not found" screen with a back button.
- Notes field: attempts `JSON.parse(lead.notes)` and renders key/value pairs if it parses to an object; otherwise renders as plain italic text.
- Floating action bar (WhatsApp + call) is fixed to viewport bottom, WhatsApp button deep-links via `https://wa.me/{digits-only phone}`.
- Header edit/delete icon buttons are present but **not wired to any handler** (no `onClick`) — visually present, non-functional (placeholder).
- Uses `useTheme` from `next-themes` for `isDark` but the variable is computed and unused in the visible JSX (no conditional styling branches reference it directly beyond CSS vars) — likely vestigial.
