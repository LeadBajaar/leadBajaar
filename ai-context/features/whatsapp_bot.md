---
type: feature
slug: whatsapp_bot
name: WhatsApp Bot (multi-session automation + broadcast)
status: active
roles: [Super Admin, Admin]
userTypes: [agency, super_admin, individual]
planFeatureKey: whatsapp_bot
routes: ["/whatsapp-bot", "/whatsapp-bot/builder"]
relatedDocs:
  pages: [../pages/whatsapp-bot.md, ../pages/whatsapp-bot-builder.md]
  components: [../components/whatsapp-bot.md]
  flows: [../flows/chatbot-flow-builder.md, ../flows/chatbot-automation-execution.md]
---
# Feature: WhatsApp Bot

## Summary
`/whatsapp-bot` is a **third, independent automation system**, separate from both the `/chatbot` (Meta) and `/evolution/chatbot` builders. Where those two talk to the Laravel API (`API_BASE_URL`) and persist a React-Flow node/edge graph, WhatsApp Bot talks entirely to a **separate Node.js WhatsApp bridge service** at `WHATSAPP_BASE_URL` (`https://wp.leadbajaar.com/api`) and models automation as a flat table of keyword-triggered **state-machine rows** (`trigger_keyword`, `match_type`, `required_state`, `next_state`, `reply_message`, `priority`) rather than a persisted node graph — the builder page renders this table as a React Flow canvas purely for visualization/editing convenience, but does not save x/y positions server-side ("Save Changes" only shows a toast; see `pages/whatsapp-bot-builder.md`).

The feature also bundles session management (multi-device QR-code connect/reconnect/disconnect, "ghost"/"historical" session tracking), live chat, contact groups/CSV import, and broadcast campaigns with anti-ban pacing — all via the same Node bridge API and the shared `WhatsAppContext`.

## Access control
- Sidebar entry "WhatsApp Bot" (`/whatsapp-bot`) requires roles `Super Admin | Admin`, types `agency | super_admin | individual`, `feature: 'whatsapp_bot'` (`src/components/sidebar.tsx` line 82).
- `WhatsAppBotPage` additionally does its own **plan-gate check** in-component: `if (!hasFeature('whatsapp_bot'))` renders an "Unlock Automation" upsell card linking to `/billing`, instead of using `RoleGuard`.
- The builder page (`/whatsapp-bot/builder`) has **no visible auth/plan guard of its own** — it relies on being unreachable without a `userId` query param and on the parent page's gate; this is a one-line cross-reference for whoever documents `/settings`/`/billing` plan enforcement broadly.

## Key files
- Pages: `src/app/(dashboard)/whatsapp-bot/page.tsx`, `src/app/(dashboard)/whatsapp-bot/builder/page.tsx`
- Components: `src/components/whatsapp-bot/WhatsAppBotGroups.tsx`, `WhatsAppConnectModal.tsx`, `WhatsAppBotProfile.tsx`, `WhatsAppBotCampaigns.tsx`, `WhatsAppBotChat.tsx` (see `components/whatsapp-bot.md`)
- State: `src/contexts/WhatsAppContext.tsx` (sessions, ghost/historical sessions, `flows`, `toggleFlow`, `deleteFlow`, `fetchSessions`) — owned by another cluster ("state/"), only referenced here.
- Backend base URL constant: `WHATSAPP_BASE_URL` in `src/lib/api.ts` (`https://wp.leadbajaar.com/api`), distinct from `API_BASE_URL` (`https://api.leadbajaar.com/api`) used by `/chatbot` and `/evolution/chatbot`.

## Notes
- Flow rows fetched via `GET ${WHATSAPP_BASE_URL}/chatbot/flows/{userId}` (note: this is a **different endpoint** from the Laravel `chatbot/flows` used by `/chatbot` and `/evolution/chatbot`, despite the similar path — it lives on the separate Node bridge and returns `{ flows: [...] }` keyed by WhatsApp session `userId`, not by company).
- `WhatsAppBotPage` does client-side "Sequence Tracing": it groups flat flow rows into visual journeys by walking `required_state -> next_state` chains starting from rows where `required_state` is `START`/`ALL`/empty (see `flowGroups` `useMemo` in `page.tsx`).
- Session identifiers are scoped as `${user.id}_${idToUse}` when connecting (`WhatsAppConnectModal.initiateConnection`), and displayed/derived by splitting on `_`.
- Campaigns and Groups tabs support CSV/manual contact import, media upload (via the bridge's `/campaigns/upload`, and separately via `api.post('/storage/r2/upload-image')` — Cloudflare R2 — in the builder page), and "Spintax" message variation with anti-ban heuristics (regex-based warnings for link+media combos, and for lack of `{a|b}` variation).
- `NEXT_PUBLIC_WHATSAPP_SECRET` env var is sent as a Bearer token on privileged bridge calls (logout, send-message) — a different auth mechanism from the Laravel `token`/`Authorization` header pattern used elsewhere in the app.
- See `flows/chatbot-automation-execution.md` for what little the frontend implies about how this bot actually replies to incoming WhatsApp messages (mostly backend-only, not visible here).
