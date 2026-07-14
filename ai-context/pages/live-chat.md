---
type: page
route: /live-chat
file: src/app/(dashboard)/live-chat/page.tsx
feature: live_chat
auth: protected
---
# Page: /live-chat

## Purpose
Two-pane WhatsApp Business Cloud API inbox: conversation list (leads with latest message) on the left, active thread + contact-info side panel on the right. Agents send/receive WhatsApp messages tied to lead phone numbers.

## Components used
- shadcn primitives: `Card*` (imported, unused in render), `Input`, `Button`, `ScrollArea`, `Avatar`/`AvatarFallback`/`AvatarImage`, `Badge`, `Label`, `Separator`
- `RoleGuard allowedFeatures={['live_chat']}`
- Inline message-bubble rendering logic (no separate component — all JSX/logic lives directly in `page.tsx`), including a defensive multi-format WhatsApp content extractor (`extractSafeString`) that handles plain text, JSON-stringified text/interactive payloads, and template metadata.

## Data/API calls
- `getLeadsWithLatestMessages()` — populates the conversation list (`GET /conversations`)
- `getConversationMessages(chatId)` — fetches a thread's messages (`GET /conversations/{id}/messages`)
- `sendMessage({ receiver_id, message })` — sends outbound message (`POST /send-message`)
- `me()` (from api.ts) — used only inside the disabled `setupRealtime` function to get `user.id` for the Echo channel name

## Notable behavior
- **Real-time is disabled**: `setupRealtime()` (which would subscribe to `window.Echo.channel('whatsapp.user.{id}')` and listen for `.whatsapp.message`) is defined but its invocation is commented out (`// setupRealtime();`). No polling fallback exists either — the conversation/message lists only refresh on mount, on manual chat click, or after a locally-sent message. See [flows/realtime-messaging.md](../flows/realtime-messaging.md).
- Optimistic send: a local `local-{timestamp}` message is appended with `status: 'pending'` immediately, then updated to `sent`/`failed` based on the `sendMessage` API result.
- Message grouping by date (`groupMessagesByDate`) inserts date-separator pills.
- Quick-reply suggestion chips (`Pricing Plan`, `API Help`, etc.) are hardcoded and just call `handleSend()` with whatever is currently typed (mock/non-functional suggestion feature — clicking them does not insert their own label as text).
- Renders WhatsApp interactive-button and CTA-URL metadata (`msg.metadata.interactive`) as clickable-looking but non-functional button/link previews (buttons have no `onClick`).
- Contact-details side panel ("Block Customer" / "Mark as Resolved" buttons) has no handlers — display-only placeholders.
