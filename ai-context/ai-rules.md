---
type: meta
generatedAt: 2026-07-04
---

# Rules for maintaining ai-context/

This folder is meant to be regenerated **incrementally**, not thrown away and rebuilt from scratch each time. Follow these rules when updating it.

## 1. Don't hardcode feature names — discover them

Feature names, slugs, and groupings must come from the actual repo, in this priority order:

1. `src/components/sidebar.tsx` — the `feature:` key on each `NavItemDef` is the canonical plan-gating slug; `roles`/`types`/`plans` are the canonical access rules.
2. Route directories under `src/app/(dashboard)/**` and `src/app/**` — anything not in the sidebar (public pages, orphan routes) still needs a doc, just note it has no nav entry.
3. `src/contexts/UserContext.tsx` — `hasFeature()`/`hasRole()`/`hasType()`/`hasPlan()` logic defines what gating actually means at runtime.
4. Existing prose docs (`context/ai-context.md`, `docs/*.md`, root `*.md`) — use as corroborating context, never as the sole source; verify every claim against current code before repeating it, since these docs drift.

## 2. Every doc file needs frontmatter

`features/*.md`, `pages/*.md`, `components/*.md`, `api/*.md`, `flows/*.md`, `state/*.md` must start with a YAML frontmatter block (see any existing file in this folder for the exact schema per type — `type`, plus `slug`/`route`/`group`, `status`, `roles`, `routes`, etc.). This is what makes `manifest.json` and `feature-map.md` reconstructable by scanning frontmatter instead of re-reading the whole app on every run.

## 3. When re-running this generation process

- **New route/component/API added**: add a new doc file for it, add its frontmatter-derived row to `manifest.json` and `feature-map.md`. Don't touch unrelated files.
- **Existing route/component/API changed**: re-read the changed file(s) only, update the corresponding doc's body and frontmatter (especially `status` if a bug was fixed or newly introduced). Update its `manifest.json`/`feature-map.md` row.
- **Route/component/API removed**: delete its doc file, remove its row from `manifest.json` and `feature-map.md`, and check nothing else links to the deleted file.
- Update `generatedAt` only in files you actually touched — don't bulk-rewrite timestamps across the whole folder, it defeats the point of incremental updates and makes diffs noisy.
- If splitting the work across parallel agents (as was done for the initial generation), assign each agent a **disjoint** set of output file paths up front to avoid write collisions — see the git history of this folder's initial commit for the cluster boundaries used.

## 4. Verify before writing, don't pad

- Never invent a route, prop, endpoint, or behavior that isn't actually in the code. If something is thin, unused, or a placeholder, say so plainly — that's more valuable to an agent than padded prose.
- If you find a real bug while documenting (dead code, mismatched API calls, broken imports), record it in the doc's `## Notes` section AND add/update it in `manifest.json`'s `knownIssues` array and the "Known issues" section of `feature-map.md`. Don't silently fix it as a side effect of a documentation pass — flag it and let a human/separate task decide.

## 5. Style

- Frontmatter + tight markdown body. Tables and bullets over paragraphs — this is written for AI agents to parse quickly, not for human leisure reading.
- Cross-link with relative markdown links between docs in this folder.
- Keep each doc file scoped to one feature/page/component-group/api-group/flow — don't merge unrelated things into one file to save effort.

## 6. Context packs (`context-packs/`)

- Context packs are a derived layer — built from `manifest.json`, `feature-map.md`, `dependency-map.md`, and feature frontmatter, not from a fresh source read. Regenerate a pack by re-deriving from those, not by re-reading `src/`.
- Every pack's `## Manual Notes` section is append-only — never delete or overwrite existing text there when regenerating. It's the one place human/agent judgment calls survive a regeneration.
- See [context-packs/index.md](context-packs/index.md) for the full pack-specific incremental-update rules (adding/removing/moving a feature between packs) and the reasoning behind the current 7-system grouping.
