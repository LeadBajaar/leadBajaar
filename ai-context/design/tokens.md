---
type: design-tokens
generatedAt: 2026-07-05
sourceFiles: [src/styles/globals.css, tailwind.config.ts]
---

# Design Tokens

Reference for every CSS custom property and Tailwind theme extension actually used by the app. This doc exists because the token system spans two files (`src/styles/globals.css` defines the custom properties, `tailwind.config.ts` maps them to utility classes) and neither file alone shows the full picture.

## ⚠ Correction (2026-07-05)

An earlier version of this doc, and an earlier token-addition pass, targeted **`src/app/globals.css`** — which is **not imported anywhere**. The root layout (`src/app/layout.tsx`) imports `@/styles/globals.css`. All work has since been corrected to target the real file. If you find any reference elsewhere to `--success`/`--warning`/`--info`/`--text-secondary`/`--surface-elevated`/`--shadow-card-dark` as bare custom properties defined in `src/app/globals.css` — that file is dead; ignore it (it now carries a header comment saying so) and use this doc instead.

**Architecture**: the live palette is a set of custom properties prefixed `--crm-*` (colors) and `--r-*` (radius), defined in `:root`/`.dark` in `src/styles/globals.css`, plus a small number of plain (non-prefixed) vars this doc's additions introduced (`--shadow-card`, `--shadow-card-md`). Components consume them two ways, both live in this codebase:
1. **Arbitrary-value Tailwind classes** — `bg-[var(--crm-surface-1)]`, `text-[var(--crm-text-secondary)]` — the pattern used by `Card`, `Input`, `Table`.
2. **Named Tailwind utilities** — `bg-success`, `text-warning`, `shadow-card` — aliases added to `tailwind.config.ts`'s `theme.extend.colors`/`boxShadow` so common cases don't need an arbitrary-value class. **Prefer this form for new code.**

Never hardcode a hex value in a component. Reference a Tailwind utility or a `var(--crm-*)`, not a literal color, so light/dark switching stays automatic via the `.dark` class.

## Color tokens

| Tailwind utility | CSS variable(s) | Light | Dark | Note |
|---|---|---|---|---|
| `bg-background` / `text-foreground` | `--background` / `--foreground` | `#FFFFFF` / near-black | near-black / near-white | pre-existing shadcn defaults (neutral, **not** indigo — a separate unused indigo scheme exists only in the dead `src/app/globals.css`) |
| `bg-[var(--crm-bg)]` | `--crm-bg` | `#FFFFFF` | `#1A1C1E` | pre-existing, page background |
| `bg-[var(--crm-surface-1)]` (`Card`) | `--crm-surface-1` | `#FFFFFF` | `#141518` | pre-existing, base card surface |
| **`bg-surface-elevated`** | `--crm-surface-2` | `#F9FAFB` | `#22242A` | **Alias added.** Corrected from an earlier, incorrect `--surface-elevated` var — `surface-2` is the real elevated tier already used for hover/active states. |
| `bg-[var(--crm-surface-3)]` | `--crm-surface-3` | `#F3F4F6` | `#2A2D35` | pre-existing, popovers/dropdowns |
| `text-[var(--crm-text-primary)]` | `--crm-text-primary` | `#111827` | `#FFFFFF` | pre-existing |
| **`text-text-secondary`** | `--crm-text-secondary` | `#4B5563` | `#A1A1AA` | **Alias added** — this variable already existed and was already used ad hoc (`text-[var(--crm-text-secondary)]`) in `Card`, but had no named Tailwind utility until now. |
| **`text-text-tertiary`** | `--crm-text-tertiary` | `#9CA3AF` | `#71717A` | **Alias added**, same reasoning. |
| **`bg-success` / `bg-success-bg` / `border-success-border`** | `--crm-green` / `--crm-green-soft` / `--crm-green-border` | `#059669` / `#ECFDF5` / `#A7F3D0` | `#10B981` / `rgba(16,185,129,.15)` / transparent | **Alias added.** Semantic name over the pre-existing green tokens (already used for `.badge-green`) — no new color introduced. |
| **`bg-warning` / `bg-warning-bg` / `border-warning-border`** | `--crm-amber` / `-soft` / `-border` | `#D97706` / `#FFFBEB` / `#FDE68A` | `#F59E0B` / `rgba(245,158,11,.15)` / transparent | **Alias added**, same pattern. |
| **`bg-info` / `bg-info-bg` / `border-info-border`** | `--crm-blue` / `-soft` / `-border` | `#2563EB` / `#EFF6FF` / `#BFDBFE` | `#3B82F6` / `rgba(59,130,246,.15)` / transparent | **Alias added**, same pattern. |
| `bg-destructive` | `--destructive` (shadcn default red, separate from `--crm-red`) | pre-existing | pre-existing | unchanged |
| **`bg-destructive-bg` / `border-destructive-border`** | `--crm-red-soft` / `--crm-red-border` | `#FEF2F2` / `#FECACA` | `rgba(239,68,68,.15)` / transparent | **Alias added** — completes the same DEFAULT/bg/border shape as success/warning/info, reusing the pre-existing crm-red tint pair rather than `--destructive`'s own (which has no tint variant defined). |

**Do not confuse with `tailwind.config.ts`'s `crm.*` color group** (`crm.bg: '#0f0f0f'`, `crm.accent: '#6b5ce7'`) — a third, separate, hardcoded (non-theme-reactive) palette, seemingly for one specific mockup, not wired to the `--crm-*` CSS variables above despite the confusingly identical name. Do not use it for new work; flagged here so it isn't mistaken for the live system.

## Typography tokens

| Utility | Size / weight | Note |
|---|---|---|
| `text-label` / `body-sm` / `body-md` / `body-lg` / `heading-sm` / `heading-lg` / `display` | 10–22px | pre-existing, unchanged |
| **`text-stat-value`** (Tailwind utility) / **`.text-stat-value`** (plain CSS class, `styles/globals.css`) | 28px / 600, -0.01em | **Added**, both forms, for stat-card figures — needs to outrank its own label without competing with `display`. The plain class exists for non-Tailwind call sites (e.g. inline styles on `.metric-value`-style elements); the Tailwind utility is for component `className` use. |
| `tabular-nums` | — | Tailwind core utility, already available — no addition needed. Use on any numeric value that sits in a column (stat figures, deltas) so digits don't jitter in width. |

## Shadow tokens

| Utility | Value | Note |
|---|---|---|
| `shadow-card` / `shadow-card-md` | via `--shadow-card` / `--shadow-card-md` | **Corrected.** Previously hardcoded rgba-black values baked directly into `tailwind.config.ts` (invisible in dark mode — rgba-black shadows don't read against a near-black background). Now sourced from CSS variables in `styles/globals.css` with a `.dark` override using an inset top-highlight instead, so both utilities are automatically theme-correct. |
| `shadow-primary-glow` | unchanged | pre-existing, reserve for primary CTAs only |

## Motion tokens

| Selector | Behavior | Note |
|---|---|---|
| `.skeleton` | `animate: pulse 1.5s ease-in-out infinite` | pre-existing |
| `.skeleton` under `@media (prefers-reduced-motion: reduce)` | animation disabled, static `opacity: 0.6` | **Added.** The pulse previously had no reduced-motion guard. |

## Radius tokens (pre-existing, unchanged)
`--r-xs` 4px · `--r-sm` 6px · `--r-md` 8px · `--r-lg` 12px · `--r-xl` 16px · `--r-pill` 9999px.

## Related docs
- [components/ui-primitives.md](../components/ui-primitives.md) — component-level catalog.
- [components/state.md](../components/state.md) — the reusable state-system component group built on top of these tokens (EmptyState, ErrorState, SkeletonCard, SkeletonDashboard, DismissibleCard).
- [features/dashboard.md](../features/dashboard.md) — the feature these tokens were originally scoped for; the Honest Home dashboard rebuild itself has not started — only tokens and the reusable state system exist so far.
