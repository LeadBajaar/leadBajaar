---
type: component-group
group: ui-primitives
directory: src/components/ui
usedByFeatures: [authentication, dashboard, account_settings, team_management]
---

# Components: ui-primitives

Catalog of `src/components/ui/*` — mostly shadcn/ui wrappers around Radix UI primitives, plus a few hand-rolled utilities. One row per file.

| File | Purpose |
|---|---|
| `accordion.tsx` | Radix Accordion wrapper (collapsible sections). |
| `alert.tsx` | Static alert banner (`default`/`destructive` variants) via `cva`. |
| `avatar.tsx` | Radix Avatar (image + fallback initials circle). |
| `badge.tsx` | Small pill label (`default`/`secondary`/`destructive`/outline variants) via `cva`. |
| `button.tsx` | Radix `Slot`-based button with `cva` variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, ...) mapped to custom CRM classes (`btn-primary`, `btn-danger`, etc.). |
| `calendar.tsx` | `react-day-picker` wrapper styled with shadcn conventions. |
| `card.tsx` | `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter` composable container using CRM CSS vars. |
| `checkbox.tsx` | Radix Checkbox wrapper with check icon. |
| `custom-calendar.tsx` | Hand-built (non-Radix) calendar grid with `selectedDate`/`availableDates`/`disabledDates` props — used where `react-day-picker`'s API is too rigid (e.g. meeting booking availability). |
| `date-range-picker.tsx` | Popover + custom date math (date-fns) for picking a `{from, to}` range; not Radix-based internally beyond the Popover shell. |
| `dialog.tsx` | Radix Dialog wrapper (`Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`). |
| `Dropdown.tsx` | Lightweight hand-rolled dropdown (`Dropdown`, `DropdownItem`, `DropdownDivider`) using plain CSS classes, not Radix — distinct from `dropdown-menu.tsx`. |
| `dropdown-menu.tsx` | Full Radix DropdownMenu wrapper (items, checkboxes, radio, submenus, separators). |
| `ErrorDialog.tsx` | Dialog for surfacing a titled error with optional `action`/`refId`/external `url` link — used for structured API error display (e.g. integration errors). |
| `input.tsx` | Styled `<input>` wrapper using CRM CSS vars. |
| `label.tsx` | Radix Label wrapper with `cva` text styling. |
| `loading-spinner.tsx` | Minimal inline spinner + "Loading..." text, no props. |
| `Modal.tsx` | Hand-rolled modal primitives (`ModalBackdrop`, `Modal`, `ModalHeader`) using plain CSS classes — a non-Radix alternative to `dialog.tsx`. |
| `pagination.tsx` | Pagination nav built from `Button` variants + lucide chevron icons. |
| `popover.tsx` | Radix Popover wrapper (`Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`). |
| `progress.tsx` | Simple percentage progress bar (`value`, `indicatorClassName`), not Radix-based. |
| `radio-group.tsx` | Radix RadioGroup wrapper with filled-circle indicator. |
| `reconnection-modal.tsx` | `TokenUpdateModal` — dialog for re-entering an expired/invalid integration access token (e.g. WhatsApp), with show/hide toggle and error message display. |
| `scroll-area.tsx` | Radix ScrollArea wrapper for custom-styled scrollbars. |
| `select.tsx` | Radix Select wrapper (`Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, etc.). |
| `separator.tsx` | Radix Separator (horizontal/vertical divider line). |
| `skeleton.tsx` | Pulsing placeholder `<div>` for loading states. |
| `sonner.tsx` | Wires `next-themes` into the `sonner` `<Toaster>` so toasts match light/dark mode — this is the toaster mounted in the root layout. |
| `switch.tsx` | Radix Switch wrapper (on/off toggle). |
| `table.tsx` | `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` composable table primitives with a custom `crm-table` class. |
| `table-column-toggle.tsx` | `DropdownMenu` of checkboxes to show/hide table columns dynamically (`columns`, `visibleColumns`, `onColumnToggle` props). |
| `tabs.tsx` | Radix Tabs wrapper (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`). |
| `textarea.tsx` | Styled `<textarea>` wrapper. |
| `toast.tsx` | Radix Toast primitive wrapper (legacy toast system — see `use-toast.ts`). |
| `toaster.tsx` | Renders the legacy Radix-toast queue from `use-toast.ts` — **do not use**; the app standardizes on `sonner.tsx` instead (see `context/ai-context.md`). |
| `tooltip.tsx` | Radix Tooltip wrapper (`TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`). |
| `use-toast.ts` | Legacy toast state manager (reducer + listener pattern) powering `toast.tsx`/`toaster.tsx`. Superseded by `sonner`; still imported by some pages (e.g. `dashboard/page.tsx`) — inconsistent with repo convention. |

## Notes
- Design tokens (colors, typography, shadows) consumed by these components are cataloged in [design/tokens.md](../design/tokens.md) — includes success/warning/info semantic aliases (over the pre-existing `--crm-green/-amber/-blue` vars) and a `text-stat-value` size, added for the Honest Home dashboard redesign.
- A separate, higher-level state-handling component group exists at [components/state.md](state.md) (`EmptyState`, `ErrorState`, `SkeletonCard`, `SkeletonDashboard`, `DismissibleCard`) — prefer those over hand-rolling loading/empty/error markup with these primitives directly.
- Two independent toast systems coexist: the legacy Radix one (`toast.tsx` + `toaster.tsx` + `use-toast.ts`, mounted nowhere in the layouts read in this cluster) versus `sonner.tsx` (mounted in `src/app/layout.tsx` as the global `<Toaster>`). Only `sonner` is guaranteed to actually render on screen app-wide; pages importing `useToast` (e.g. `dashboard/page.tsx`) get functional toast *state* but should double check it visibly renders, since no `<Toaster/>` from `toaster.tsx` was found wired into either layout in this cluster's scope.
- There are two unrelated "dropdown" implementations (`Dropdown.tsx` hand-rolled vs `dropdown-menu.tsx` Radix-based) and two unrelated "modal" implementations (`Modal.tsx` hand-rolled vs `dialog.tsx` Radix-based) — check which one a given page already imports before adding new UI to avoid mixing patterns in the same view.
