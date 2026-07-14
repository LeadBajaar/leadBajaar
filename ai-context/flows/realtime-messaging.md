---
type: flow
slug: realtime-messaging
featuresInvolved: [live_chat]
---
# Flow: Real-time Messaging (`/live-chat` vs `/evolution/inbox`)

Both inboxes are meant to feel "live," but they achieve it through different (and, for one, currently non-functional) mechanisms. Neither actually uses `src/services/websocket-service.ts` — that file is fully commented out and exports nothing (see [components/chat.md](../components/chat.md)).

## `/live-chat` (WhatsApp Cloud API) — designed for Echo/Pusher push, but disabled
1. On mount, `fetchActiveConversations()` runs once (`getLeadsWithLatestMessages` → `GET /conversations`), and if no chat is active yet, the first conversation's messages are loaded (`fetchChatMessages` → `getConversationMessages` → `GET /conversations/{id}/messages`).
2. A second `useEffect` defines `setupRealtime()`: it calls `me()` to get the current user id, then would subscribe via `window.Echo.channel('whatsapp.user.{user.id}').listen('.whatsapp.message', handler)`. The handler appends the incoming message to `messages` if it belongs to the currently active chat, and always calls `fetchActiveConversations()` again to refresh previews/unread counts.
3. **The invocation is commented out**: `// setupRealtime();`. As a result, `window.Echo`/`Pusher` (declared as globals, presumably loaded elsewhere in the app shell — not confirmed in this cluster's read set) are never actually subscribed to from this page, and `authorize` (`POST /broadcasting/auth`, the Echo private-channel auth callback) is consequently also never invoked from here.
4. Net effect: **no live updates**. New inbound WhatsApp messages will not appear in `/live-chat` until the user manually re-selects the chat or reloads the page. Only the sender's own optimistically-added outbound message appears immediately after `handleSend()`.

## `/evolution/inbox` — plain polling, functional
1. On mount, `fetchActiveConversations()` runs once (loader shown).
2. `setInterval(() => fetchActiveConversations(false), 5000)` — conversation list (previews, unread counts) refreshed every 5s, no loading spinner.
3. Separately, whenever `activeChat` is set, `setInterval(() => fetchChatMessages(activeChat.id, false), 3000)` — active thread messages refreshed every 3s.
4. `fetchChatMessages` merges freshly-polled server messages with any still-`local-`-prefixed optimistic messages not yet reflected in the server response, avoiding message flicker/loss between send and the next poll tick.
5. No Echo/Pusher/websocket involvement anywhere in this page — purely HTTP polling via `evolutionApi.getConversations`/`getMessages`.

## Role of `websocket-service.ts` and Laravel Echo
- `src/services/websocket-service.ts` contains a fully commented-out `WebSocketService` class (raw `WebSocket`, not Echo/Pusher) and exports nothing live. It is imported by `src/components/chat/chat-window.tsx` (also unused by any real route) — this whole path is dead code, unrelated to how `/live-chat` or `/evolution/inbox` actually work.
- The `window.Echo`/`window.Pusher` globals referenced in `/live-chat/page.tsx` imply Laravel Echo + Pusher JS are set up somewhere in the broader app (per `context/ai-context.md`'s tech-stack list), but the only consumer of them found in this cluster's files is the disabled `setupRealtime()` — so, as of this snapshot, **no page in this cluster actually receives push-based real-time updates**.

## Practical implication for future work
- If asked to "fix" or "enable" real-time chat, the fix point is uncommenting/wiring `setupRealtime()` in `src/app/(dashboard)/live-chat/page.tsx` (and verifying `window.Echo` is actually initialized app-wide — not confirmed in this read set) — not touching `websocket-service.ts` or `components/chat/*`, which are unrelated dead code.
- `/evolution/inbox`'s polling interval (3s/5s) is a reasonable reference if a simpler, non-Echo real-time approach is preferred for `/live-chat` too.

## Cross-references
- [pages/live-chat.md](../pages/live-chat.md), [pages/evolution-inbox.md](../pages/evolution-inbox.md), [api/chat-messaging.md](../api/chat-messaging.md), [api/evolution.md](../api/evolution.md), [components/chat.md](../components/chat.md)
