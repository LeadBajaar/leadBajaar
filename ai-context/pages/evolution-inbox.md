---
type: page
route: /evolution/inbox
file: src/app/(dashboard)/evolution/inbox/page.tsx
feature: live_chat
auth: protected
---
# Page: /evolution/inbox

## Purpose
Two-pane WhatsApp inbox for the self-hosted "Evolution API" integration (an alternative WhatsApp bridge to the official Cloud API used by `/live-chat`). Structurally near-identical to `/live-chat` (same layout, message-bubble rendering, optimistic send) but backed by `evolutionApi` and polling instead of a one-shot fetch.

## Components used
- Same shadcn primitive set as `/live-chat` (`Input`, `Button`, `ScrollArea`, `Avatar*`, `Badge`, `Label`, `Separator`) minus `Card*`
- `RoleGuard allowedFeatures={['live_chat']}`
- Same inline defensive multi-format message-content extractor as `/live-chat` (duplicated logic, not shared into a common util/component)
- `toast` from `sonner` for session-clear feedback

## Data/API calls
All via `evolutionApi` (see [api/evolution.md](../api/evolution.md)):
- `evolutionApi.getConversations()` — conversation list (`GET /evolution/inbox/conversations`)
- `evolutionApi.getMessages(conversationId)` — thread messages (`GET /evolution/inbox/conversations/{id}/messages`)
- `evolutionApi.sendMessage(conversationId, message)` — send (`POST /evolution/inbox/messages/send`)
- `evolutionApi.clearSession(conversationId)` — "Clear Chatbot Session" button in the contact-info panel (`POST /evolution/inbox/session/clear`)

## Notable behavior
- **Polling-based real-time** (no Echo/websocket): conversation list polls every 5000ms, active-thread messages poll every 3000ms, both via `setInterval` (`fetchActiveConversations(false)` / `fetchChatMessages(activeChat.id, false)` — the `false` suppresses the loading spinner on background refreshes). See [flows/realtime-messaging.md](../flows/realtime-messaging.md).
- Message-fetch merges polled server messages with any still-pending local optimistic (`local-`-prefixed id) messages not yet reflected server-side, to avoid flicker/loss during the 3s poll window.
- Optimistic send mirrors `/live-chat`: local `pending` message shown immediately, replaced with server id/status on `sendMessage` resolution, marked `failed` on error.
- Has a working, unique action `/live-chat` lacks: **"Clear Chatbot Session"** button, which calls `evolutionApi.clearSession` and toasts success/failure — used to reset a contact's chatbot conversation state.
- "Block Customer" / "Mark as Resolved" buttons remain non-functional placeholders, same as `/live-chat`.
- Contact metadata is thinner than `/live-chat`: no email/location from the backend (`ChatUser.email` hardcoded `''`, `location` hardcoded `''`); company field is derived from `contact.is_business` (`'Business'` vs `'WhatsApp Contact'`), not an actual lead relationship.
