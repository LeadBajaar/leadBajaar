---
type: flow
slug: chatbot-automation-execution
featuresInvolved: [chatbot, whatsapp_bot]
---
# Flow: Chatbot Automation Execution (frontend-visible portions only)

**This repo is a Next.js frontend. There is no code here that actually parses/executes a saved flow against an inbound WhatsApp message** — that logic lives entirely in the backend(s) this app talks to (the Laravel API for `/chatbot` + `/evolution/chatbot`, and the separate Node.js WhatsApp bridge for `/whatsapp-bot`). This doc records only what the frontend implies about execution, explicitly flagging every inference as backend-external.

## `/chatbot` and `/evolution/chatbot` (Laravel-backed flows)
What the frontend sends/reads that must drive backend execution:
- `trigger` string (Meta: `"{type}:{value}"` where `type` ∈ `message | exact_match | button | api | schedule | event | regex | intent`, or bare keyword when `type === 'message'`; Evolution: a bare keyword string only) — presumably matched against incoming message text or events server-side to pick which flow starts.
- `is_active` boolean, toggled from the list page — presumably an execution on/off switch, but the actual toggle call is one of the dead/mismatched service methods (see [`api/chatbot.md`](../api/chatbot.md)), so it's not even confirmed this toggle reaches the backend correctly today.
- `nodes`/`edges` JSON (React Flow's native shape, with app-specific `data` per node type — see `src/types/nodes.ts`) — presumably walked node-by-node by the backend, following edges (and `condition`/`api`/`function` node semantics) to decide what to send/do next. **Nothing in this repo interprets `FunctionNodeData.functionBody` (arbitrary JS text) or `ConditionNodeData.condition` (a string) at runtime** — they're stored as opaque strings; if/how the backend evaluates them is not visible here.
- Message templates (`MessageNodeData.templateId`/`templateComponents`) reference real WhatsApp Business `MessageTemplate`s fetched from `integrationApi.getWhatsAppAccounts()` — actual template sending happens via whatever integration the backend has with Meta's Graph API, not in this repo.
- No websocket/polling code was found in the chatbot builder or list pages that would reflect live execution state (e.g. "flow fired for lead X just now"); `live-chat`/`Evolution Inbox` (other clusters) are the likely places incoming-message effects would surface, not these pages.

## `/whatsapp-bot` (Node bridge-backed automation)
More can be inferred here because the frontend interacts with live session/message state:
- Automation model is a flat table of rows keyed by `trigger_keyword` + `match_type` (`contains | exact | starts_with | wildcard`) + `required_state` (a simple state machine: a row only fires if the contact's current state matches `required_state`, and firing transitions the contact to `next_state`). This is inferred from the CRUD fields exposed in the builder Dialog and from `WhatsAppBotPage`'s client-side "Sequence Tracer" which reconstructs journeys by chaining `next_state → required_state`.
- `WhatsAppBotChat` exposes a **"Reset"** button that calls `POST ${WHATSAPP_BASE_URL}/chatbot/sessions/reset` with `{ user_id, phone }` — strong evidence the backend tracks a **per-contact, per-session conversation state** ("stuck in a state" is presumably a real failure mode operators hit, hence the reset affordance).
- `WhatsAppBotChat` also polls conversation history (`/chat/history/{userId}/{phone}`) every 3s while a contact is open, and the conversation list every 10s — implying inbound/outbound messages (including bot auto-replies) are persisted server-side and surfaced through these read endpoints, but the actual matching/reply logic runs entirely in the Node bridge service (`f:/whatsapp-service`, listed as one of this session's additional working directories, but out of scope for this frontend-focused cluster).
- Campaign sends (`WhatsAppBotCampaigns`) are separate from flow automation — broadcasts are one-shot batch sends with pacing/anti-ban delay, not triggered by inbound keywords.

## Bottom line for future readers
If you need to understand **how** a flow actually matches an incoming message and decides what to send, you must go to the backend repos (Laravel API for `/chatbot`+`/evolution/chatbot`; the Node WhatsApp bridge for `/whatsapp-bot`) — nothing in `leadbajaar1.0/src` implements that logic.
