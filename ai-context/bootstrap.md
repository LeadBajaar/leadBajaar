---
type: bootstrap
generatedAt: 2026-07-04
---

# Bootstrap — Start Here

This is the **single entry point** for any AI agent about to work in `f:/LeadBajar/leadbajaar1.0`. Read this file first, every time, before touching anything else — including before opening `index.md`. It tells you what to read, in what order, how much of it to read, and when it's acceptable to fall back to reading the actual source code.

The short version: **load the minimum set of docs that lets you act correctly, and no more.** This folder exists so you rarely need to grep the whole app — use it that way.

---

## The workflow

Follow these steps in order. Steps 4–8 are conditional — skip the ones the task doesn't need.

### 1. Read `repo-info.md`
One paragraph. What this repo is, what it depends on, what it exports. Costs almost nothing, orients you instantly.

### 2. Read `ai-rules.md`
Tells you how the rest of this folder is structured and how much to trust it: the frontmatter schema, the "don't pad, flag bugs instead of silently fixing them" rule, and the context-pack maintenance rules (§6). Read this before the manifest so you interpret everything else correctly — e.g. so you know a `status: partial` or a `## Known issues` entry is a verified finding from reading the code, not speculation.

### 3. Read `manifest.json`
The machine-readable index: every feature (with `slug`, `status`, `roles`, `routes`, `doc`, and now `documentation`/`tests`/`knownIssues` fields), every page/component-group/API-group/flow/state-context, the `contextPacks` array, and the top-level `knownIssues` array. This is where you resolve "which feature/pack owns the thing I need to touch."

### 4. Determine required context packs
Using `manifest.json`'s `features[]` and `contextPacks[]` (or `feature-map.md` if you want the human-readable table instead), work out:
- **Which feature(s)** the task touches — match by route, feature name, or keyword.
- **Which pack** each feature belongs to (`contextPacks[].features`).
- **Which other packs that pack depends on** (`contextPacks[].dependencies`) — only pull these in if the task actually crosses that dependency edge, not automatically. See the lookup table below.

### 5. Load only those context packs
Read `context-packs/<system>.md` for each pack determined in step 4. A pack's own "Purpose," "Common implementation patterns," and "Known issues" sections are often enough to act on their own — check before going further.

### 6. Load feature docs only if implementation detail is needed
If the pack's summary isn't specific enough (exact function signatures, exact file names, edge-case behavior), open `features/<slug>.md` for the specific feature(s) in scope. Don't open every feature doc for every pack member — just the one(s) the task touches.

### 7. Load page/component docs only if UI changes are required
If the task changes what renders or how — open the relevant `pages/<route>.md` and/or `components/<group>.md`. Skip these entirely for backend-call-only changes, pure refactors with no visible UI diff, or bug fixes confined to a service file. **Exception**: when generating tests, treat "I need the exact call sites and props to write accurate mocks" as equivalent to a UI-change need — load the page/component doc even though nothing visibly changes.

### 8. Consult known-issues docs before modifying a feature
Check, in this order, before writing any code: the pack's own "Known issues" section → the feature's `## Notes` section → `manifest.json`'s `knownIssues` array → `feature-map.md`'s "Known issues" section. A task that looks like "fix X" is very often already root-caused in one of these — don't rediscover it from scratch.

### 9. Do not scan the repository unless one of these is true
- The documentation for the area you need **doesn't exist** (check `manifest.json` first — a missing `doc` entry or missing route means it's genuinely undocumented, not that you searched wrong).
- The documentation **conflicts with what you observe in the actual code** (e.g., a doc says a function exists and it doesn't) — verify, then fix the doc per `ai-rules.md` rather than just working around the discrepancy silently.
- **The user explicitly asks** for a full rescan (e.g., "ignore the docs and check the current code," "re-audit this area").

Otherwise, once steps 1–8 have identified the exact file(s) to change, reading *those specific files* to make the edit is expected and is not "scanning the repository" — it's the normal last step of using the documentation to do the work.

---

## Determining required context packs — lookup table

| Task mentions... | Pack(s) to load |
|---|---|
| leads, pipeline, kanban, live chat, evolution inbox, analytics, workspace stats | [context-packs/crm-system.md](context-packs/crm-system.md) |
| meetings, bookings, event types, public booking page, Google Calendar | [context-packs/meeting-system.md](context-packs/meeting-system.md) |
| chatbot, flow builder, React Flow canvas, node/trigger, `/chatbot`, `/evolution/chatbot` | [context-packs/chatbot-system.md](context-packs/chatbot-system.md) |
| integrations hub, Facebook/Meta, WhatsApp connect (Cloud API or Evolution), webhooks, email marketing, LB Forms, WhatsApp Bot, Meta Ads | [context-packs/integration-system.md](context-packs/integration-system.md) |
| drip sequences, automation rules, global triggers, `/automations` | [context-packs/automation-system.md](context-packs/automation-system.md) |
| agency/clients, `/admin`, Super Admin, email logs, error logs, finance/P&L/payroll, developer hub | [context-packs/admin-system.md](context-packs/admin-system.md) |
| sign in/up, password reset, team invites, `/dashboard` landing, `/settings`, billing/subscription | [context-packs/core-platform-system.md](context-packs/core-platform-system.md) |

If a task doesn't clearly match a row, resolve it properly instead of guessing: look up the route or feature name in `manifest.json.features[]`, find its slug, then find which `contextPacks[].features` array contains that slug.

**Crossing systems**: if the task explicitly asks to wire two systems together (e.g., "make automations send via WhatsApp Bot," "let Live Chat show Facebook-sourced leads"), load both packs. If it doesn't, load only the primary pack — don't preemptively pull in everything a pack's `dependencies` array lists just because the array exists.

---

## Context loading priority order

Load strictly in this order, stopping as soon as you have enough to act:

| Priority | What | When |
|---|---|---|
| 0 | `bootstrap.md` (this file), `repo-info.md`, `ai-rules.md` | Always, every session |
| 1 | `manifest.json` | Always |
| 2 | The 1–2 relevant `context-packs/*.md` | Almost always — this is the main working unit |
| 3 | `features/<slug>.md` for the specific feature(s) in scope | Only if the pack's summary lacks the detail you need |
| 4 | `pages/*.md`, `components/*.md` | Only if UI changes (or test generation) require exact call sites/props |
| 5 | `api/*.md`, `state/*.md` | Only if adding/changing an endpoint or a context beyond what the pack already summarizes |
| 6 | `flows/*.md`, `dependency-map.md`, `feature-map.md` | Only for genuinely cross-feature/cross-system behavior, or to disambiguate which pack owns something |
| 7 | Actual source files named by the docs above | Always, at the point of making the edit — this is expected, not "scanning" |
| 8 | A broader source scan/grep across the repo | **Last resort only** — the three conditions in step 9 above |

## Token optimization guidelines

- **A context pack replaces reading its member features' individual page/component/api/flow docs.** Reach for the pack first; only drop down to the individual docs it links when the pack's own summary genuinely isn't enough.
- **Never read `src/lib/api.ts` end to end.** It's 2000+ lines. The `api/*.md` docs already cite exact `file:line` references — if you must verify against source, jump straight to the cited lines, don't scan the file.
- **Trust documented Known Issues without re-verifying them** unless the task is specifically about that issue or something looks stale — they were confirmed by reading the actual code when written, per `ai-rules.md` §4.
- **Batch your reads.** If step 4–6 above identify 3–4 files you'll need, request them in one multi-tool call rather than one-by-one round trips.
- **Don't reload anything already in context this session** — if you read `context-packs/crm-system.md` two turns ago for the same task, don't re-read it.
- **Skip `components/ui-primitives.md`** unless you're adding a genuinely new base/shadcn primitive — it's a low-value catalog for almost every task.
- **For multi-system tasks, prefer reading N packs over reading (N × 5) individual feature/page/component/api/flow docs** — that's the entire reason the pack layer exists.
- **Stop as soon as you can act.** Loading "just in case" docs that step 4–6 didn't actually call for is the most common way to blow past a reasonable context budget on this repo.

---

## Examples

Each example shows the workflow applied end to end: which files get loaded, in what order, and — just as important — what gets explicitly skipped.

### Example 1 — Implementing a feature
> "Add a 'snooze' action to leads so a lead can be hidden from the active list until a future date."

1. `repo-info.md`, `ai-rules.md` — baseline orientation.
2. `manifest.json` — `leads` feature found (`features/leads.md`, plan key `leads`); `contextPacks[]` shows `leads` belongs to `crm-system`.
3. **Pack determined**: `crm-system` only (single-feature UI addition, no cross-system wiring requested).
4. Load `context-packs/crm-system.md` — gives the API surface (`api/leads.md` functions), the "stage-change interception" pattern already used for `Deal Closed`, and points at the real colocated components under `src/app/(dashboard)/leads/`, not the unused `src/components/leads/*` kit.
5. Load `features/leads.md` — implementation detail needed: exact key files, the note that `LeadsHeader.tsx` is dead code (don't extend it), the deal-close interception mechanics to model the snooze interception after.
6. Load `pages/leads.md` (and `leads-detail.md` if snoozing should also be available there) — UI change, need the exact toolbar/dialog component list and existing bulk-action pattern.
7. Known issues checked: `crm-system.md` + `features/leads.md` notes (dead `LeadsHeader`, `updateLeadDetails` duplicate function — don't accidentally call that instead of `updateLead`).
8. No rescan — proceed straight to editing `src/app/(dashboard)/leads/page.tsx` and its sibling components as named by the docs.

**Skipped**: all 6 other context packs, all other feature docs, `dependency-map.md`/`feature-map.md` (not ambiguous, no need), `api/*.md` beyond `api/leads.md`.

### Example 2 — Fixing a bug
> "Users report that toggling a chatbot flow on/off does nothing."

1. `repo-info.md`, `ai-rules.md`.
2. `manifest.json` — search `knownIssues[]` first: an exact match already exists for `chatbot` ("toggleFlow/duplicateFlow don't exist on the actual `chatbotService` export"). Feature `chatbot` → pack `chatbot-system`.
3. **Pack determined**: `chatbot-system` only.
4. Load `context-packs/chatbot-system.md` — its own "Known issues" section already root-causes this precisely (mismatch between `src/services/chatbot.ts`, the one actually imported, and the unused, more complete `chatbot-service.ts`) and names the exact files.
5. **Feature doc skipped** — the pack's explanation is already sufficient; re-reading `features/chatbot.md` would add nothing new here.
6. **Page/component docs skipped** — the bug is in the service layer, not the UI; no rendering behavior needs to change.
7. Known issue already fully consulted in step 4.
8. No rescan — go straight to `src/services/chatbot.ts` and `src/services/chatbot-service.ts` (both named by the pack) to decide whether to wire in the missing methods or replace the import.

**Skipped**: `features/chatbot.md`, every `pages/*.md`/`components/*.md`, every other pack. This is the cheapest possible path because the known-issues layer had already done the diagnosis.

### Example 3 — Refactoring
> "The currency-formatting helper is copy-pasted across the finance pages — extract it into a shared util."

1. `repo-info.md`, `ai-rules.md`.
2. `manifest.json` — `finance_module` feature → pack `admin-system`.
3. **Pack determined**: `admin-system` only.
4. Load `context-packs/admin-system.md` — its "Known issues" (#6) already flags this exact duplication ("Currency formatting (`fmt()`, `Intl.NumberFormat('en-IN', ...)`) is duplicated per-file across all 8 finance sub-pages") and its "Common implementation patterns" section confirms there's no existing shared util to reuse instead.
5. Load `features/finance_module.md` — need the precise list of the 8 affected sub-page file paths.
6. **Page docs skipped** — this is a pure internal refactor with no visible UI change, so `pages/admin-finance.md` isn't needed beyond the file list already in the feature doc.
7. Known issue already the trigger for this task — nothing further to consult.
8. No rescan — the 8 files are already named; extract the shared util and update each call site directly.

**Skipped**: every `pages/*.md`, every other pack, `dependency-map.md` (no cross-feature ambiguity here).

### Example 4 — Adding an integration
> "Add a new 'Instagram Direct' messaging integration alongside WhatsApp Cloud API and Evolution."

1. `repo-info.md`, `ai-rules.md`.
2. `manifest.json` — no existing feature matches; this is new, so resolve by *pattern* instead of *lookup*: nearest existing integrations are `integrations` (feature) → pack `integration-system`.
3. **Pack determined**: `integration-system`. (Not `crm-system` — the task is "add the connector," not "wire it into Live Chat"; only pull in `crm-system` too if a later ask explicitly extends Live Chat to the new channel.)
4. Load `context-packs/integration-system.md` — gives the reusable `IntegrationCard`/`UnifiedIntegrationDialog` pattern, the generic `integrations` table model (`type`/`config`/`is_active`), the sidebar `canSee()` + `integrationsUpdated` event convention for nav visibility, and flags known anti-patterns to avoid repeating (dead commented-out code in the hub, mock `dummyLogs`).
5. Load `features/integrations.md` and `api/integrations.md` — need the full existing `integrationApi` shape and an existing similar connect flow (Evolution's QR-code flow is the closest precedent) to mirror.
6. Load `pages/integrations-hub.md`, `pages/integrations-evolution.md` (as the closest template), and `components/integrations.md` — this is a UI-heavy addition (new catalog card, new sub-page, new dialog).
7. Known issues from `integration-system.md` consulted in step 4 — avoid the hub's known dead-code and mock-data patterns in the new work.
8. No rescan — build the new sub-page/dialog following the Evolution template identified above.

**Skipped**: `crm-system.md` and every other pack unless the task later asks to feed this channel into Live Chat; `dependency-map.md` (not needed — precedent-following task).

### Example 5 — Generating tests
> "Write tests for the lead stage-change flow, including the 'Deal Closed' interception behavior."

1. `repo-info.md`, `ai-rules.md`.
2. `manifest.json` — `leads` feature → pack `crm-system`.
3. **Pack determined**: `crm-system`.
4. Load `context-packs/crm-system.md` — "Common implementation patterns" section already documents the exact interception behavior under test.
5. Load `features/leads.md` — precise mechanism needed for accurate assertions: stage change to `'Deal Closed'`/`'Closed Won'` opens `DealValueDialog` instead of calling `updateLeadStage` directly, which then calls `updateLeadStage(id, 'Deal Closed', amount)` plus an optional `createPayment`.
6. Load `pages/leads.md` — **loaded despite no UI change**, per the test-generation exception in step 7 of the workflow: need the exact function names to mock (`updateLeadStage`, `createPayment`, `getStages`) and the component names involved (`DealValueDialog`).
7. Known issues consulted: `features/leads.md`'s notes — don't write a test that exercises `LeadsHeader` (confirmed dead code, not rendered) or assumes `updateLeadDetails` is the save path (it's a duplicate of `updateLead`, not what the UI calls).
8. No rescan — write tests against the documented call sites; open only the specific dialog/page source files to confirm exact prop/function signatures for mocks.

**Skipped**: every other pack, `components/leads.md` (documents the confirmed-unused placeholder kit, not the real components), `dependency-map.md`.
