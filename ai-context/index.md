---
type: index
generatedAt: 2026-07-04
---

# ai-context/ — LeadBajaar Frontend AI Context

This folder is generated documentation for AI coding agents working in `f:/LeadBajar/leadbajaar1.0`, a Next.js 15 (App Router, TypeScript) multi-tenant CRM/lead-management frontend. It was produced by reading the actual routes, components, contexts, and API layer — not hand-maintained, and not a copy of marketing feature lists.

**Actual start here**: [bootstrap.md](bootstrap.md) — the step-by-step workflow for what to read, in what order, before touching any code. This file (`index.md`) is the folder map; `bootstrap.md` is the entry-point procedure. Read `bootstrap.md` first.

## How this folder is organized

| Folder | Contents |
|---|---|
| [`features/`](features/) | One file per product feature (e.g. `leads.md`, `chatbot.md`) — what it does, who can access it, which pages/components/API/flows implement it |
| [`pages/`](pages/) | One file per route (or per closely related route group) — purpose, components used, API calls, notable behavior |
| [`components/`](components/) | One file per `src/components/<group>` directory — purpose of each component file (includes [`components/state.md`](components/state.md), the reusable loading/empty/error state system) |
| [`api/`](api/) | One file per logical group of API functions (mostly `src/lib/api.ts` export groups, plus dedicated service files) — endpoint tables |
| [`flows/`](flows/) | End-to-end, cross-feature user/system flows |
| [`state/`](state/) | React Context providers (`UserContext`, `ErrorContext`, `WhatsAppContext`) |
| [`hooks/`](hooks/) | Custom hooks in `src/hooks/` |
| [`context-packs/`](context-packs/) | One file per system (7 total) — a "load this before you touch that system" bundle grouping related features with a system-level architecture diagram |
| [`design/`](design/) | Design-system reference — CSS custom properties (`globals.css`) and Tailwind theme extensions (`tailwind.config.ts`), what each token means and whether it's actually consumed by any component yet |

Every file in `features/`, `pages/`, `components/`, `api/`, `flows/`, and `state/` starts with YAML frontmatter (`type`, `slug`/`route`/`group`, `status`, etc.). That's deliberate — an agent (or a script) can rebuild [`manifest.json`](manifest.json) by scanning frontmatter instead of re-reading the whole app.

## Where to go first, by task

- **"I'm starting a task in this repo and don't know what to read"** → [bootstrap.md](bootstrap.md) — do this one first, always.
- **"What does feature X do / can user Y see it?"** → [feature-map.md](feature-map.md) for the human overview, or the specific `features/<slug>.md`.
- **"What renders at route /foo?"** → `pages/<route-slug>.md`.
- **"What does this component do?"** → `components/<group>.md` (grouped by `src/components/<dir>`).
- **"What API calls exist for X, and what backend endpoint do they hit?"** → `api/<group>.md`.
- **"How does X actually work end-to-end?"** → `flows/<flow>.md`.
- **Machine-readable lookup / scripting** → [manifest.json](manifest.json).
- **"What calls what?" (page→API, component→service, feature→feature, context→feature, external services)** → [dependency-map.md](dependency-map.md).
- **"I need to modify a whole subsystem, not just one feature — what do I need to know first?"** → [context-packs/index.md](context-packs/index.md), then the specific `context-packs/<system>.md`.
- **"What color/spacing/shadow token should I use, and does it already exist?"** → [design/tokens.md](design/tokens.md).
- **Known bugs/gotchas found while writing these docs** → bottom of [feature-map.md](feature-map.md) and `manifest.json`'s `knownIssues`.
- **Keeping this folder in sync as the app changes** → [ai-rules.md](ai-rules.md).

## Repo-wide facts worth knowing before you dive in

- **Multi-tenancy / access control**: every UI surface is gated on up to three independent axes — `role` (Super Admin/Admin/Manager/Agent), `user_type` (individual/agency/super_admin), and subscription `plan` feature keys — all exposed via `useUser()` in `src/contexts/UserContext.tsx`. Super Admin bypasses plan gating entirely. The canonical route→access mapping lives in `src/components/sidebar.tsx`.
- **API calls** should only ever be made through `src/lib/api.ts` (or the dedicated files in `src/services/` / `src/lib/services/`) — never raw `axios`/`fetch` in a page component. Several pages violate this; it's flagged where found.
- **Notifications**: use `sonner` (`toast.success()` / `toast.error()`). The legacy shadcn `useToast` hook still exists and several pages still use it inconsistently — flagged where found.
- **`user.company` is a full object**, not a string — rendering it directly as a React child crashes in production. Always access `user.company?.name` / `user.company?.plan`.
- There are two independent WhatsApp automation systems in this app (the Cloud API/Evolution chatbot flow builder under `/chatbot` and `/evolution/chatbot`, and a separate `/whatsapp-bot` multi-session broadcast tool) — don't assume they share code, they mostly don't.
- A deeper pre-existing architecture writeup lives at `f:/LeadBajar/leadbajaar1.0/context/ai-context.md` — this `ai-context/` folder is the feature-level companion to it, not a replacement.

## Coverage

20 features · 47 pages · 13 component groups · 14 API groups · 14 flows · 3 state contexts · 1 hooks doc. See `manifest.json.stats` for the current count as this folder evolves.
