---
type: api
group: chat-messaging
sourceFile: src/lib/api.ts
usedByFeatures: [live_chat]
---
# API: chat-messaging (WhatsApp Cloud API — `/live-chat`)

Functions backing the official WhatsApp Business Cloud API inbox at `/live-chat`. All are top-level exports in `src/lib/api.ts`, using the shared `api` axios instance.

| Function | Method + Endpoint | Params | Purpose | file:line |
|---|---|---|---|---|
| `sendMessage` | `POST /send-message` | `{ receiver_id, sender_id?, message }` | Send an outbound WhatsApp message to a lead/contact | api.ts:1526 |
| `authorize` | `POST /broadcasting/auth` | `{ socket_id, channel_name }` | Laravel Echo/Pusher private-channel auth handshake | api.ts:1535 |
| `getMessages` | `POST /messages` | `{ user_id }` | Fetch messages for a given user/thread (older/alternate endpoint; not called by `/live-chat` page directly — that page uses `getConversationMessages` instead) | api.ts:1543 |
| `initializeChat` | `POST /initialize-chat` | `{ user_id }` | Initialize/create a chat session for a user (not called by `/live-chat` page directly) | api.ts:1550 |
| `getLeadsWithLatestMessages` | `GET /conversations` | — (bearer header set explicitly in addition to interceptor) | Conversation list with each lead's latest message + unread count | api.ts:1557 |
| `getConversationMessages` | `GET /conversations/{conversationId}/messages` | `conversationId`, optional `after: lastTimestamp` query param | Fetch a thread's message history; the `lastTimestamp` param exists but `/live-chat` page never passes it (always full refetch) | api.ts:1571 |

## Notes
- `authorize` exists to support Laravel Echo's private-channel authorization flow, but is unused in practice because `/live-chat`'s real-time subscription code (`setupRealtime`) is never invoked — see [flows/realtime-messaging.md](../flows/realtime-messaging.md) and [pages/live-chat.md](../pages/live-chat.md).
- `getMessages` and `initializeChat` are defined and exported but not called anywhere in the files read for this cluster (`live-chat/page.tsx` uses `getConversationMessages`/`getLeadsWithLatestMessages` instead) — likely legacy/alternate-flow leftovers.
- `me()` (api.ts:1517, `GET /user`) is imported into `/live-chat` solely to resolve `user.id` for the (disabled) Echo channel name; per shared conventions this route should otherwise be consumed via `useUser()`, not re-fetched — see `context/ai-context.md` rule 3.
- Contrast with the parallel Evolution inbox API surface in [api/evolution.md](../api/evolution.md).
