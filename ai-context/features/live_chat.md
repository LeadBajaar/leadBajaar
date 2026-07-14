---
type: feature
slug: live_chat
name: Live Chat (WhatsApp Cloud API + Evolution Inbox)
status: partial
roles: ["Super Admin", "Admin", "Manager", "Agent"]
userTypes: []
planFeatureKey: live_chat
routes: ["/live-chat", "/evolution/inbox"]
relatedDocs:
  pages: [../pages/live-chat.md, ../pages/evolution-inbox.md]
  components: [../components/chat.md]
  api: [../api/chat-messaging.md, ../api/evolution.md]
  flows: [../flows/realtime-messaging.md]
---
# Feature: Live Chat (WhatsApp Cloud API + Evolution Inbox)

## Summary
Two parallel messaging inboxes share the `live_chat` plan-feature key and both talk WhatsApp:
1. `/live-chat` — messaging over the official WhatsApp Business Cloud API (conversations keyed by phone/lead), intended to be realtime via Laravel Echo/Pusher but the realtime wiring is currently disabled (see Notes).
2. `/evolution/inbox` — messaging over the self-hosted "Evolution API" WhatsApp bridge, using plain polling (no websockets). Only shown in the sidebar when an active `evolution`-type integration exists.

Both are simple two-pane chat UIs (conversation list + message thread + contact-info side panel) with optimistic send.

## Access control
- Sidebar: `Live Chat` (`/live-chat`) and `Evolution Inbox` (`/evolution/inbox`) both declare `roles: ['Super Admin','Admin','Manager','Agent']` and `feature: 'live_chat'` (`src/components/sidebar.tsx` lines ~32-33).
- `Evolution Inbox` additionally requires `evolutionEnabled` (an active integration with `type === 'evolution'`) to render in the sidebar at all (`sidebar.tsx` ~line 174).
- Both pages wrap content in `<RoleGuard allowedFeatures={['live_chat']}>`.

## Key files
- Pages: `src/app/(dashboard)/live-chat/page.tsx`, `src/app/(dashboard)/evolution/inbox/page.tsx`
- Placeholder/unused component-group: `src/components/chat/*` — see [components/chat.md](../components/chat.md)
- State: `src/contexts/WhatsAppContext.tsx` — see [state/whatsapp-context.md](../state/whatsapp-context.md) (used by the WhatsApp *chatbot/session-management* screens, not directly by `/live-chat` or `/evolution/inbox`)
- Dead/inert real-time service: `src/services/websocket-service.ts`
- API: `src/lib/api.ts` (`sendMessage`, `getMessages`, `getLeadsWithLatestMessages`, `getConversationMessages`, `authorize`, `initializeChat`, `evolutionApi.*`) — see [api/chat-messaging.md](../api/chat-messaging.md) and [api/evolution.md](../api/evolution.md)

## Notes
- **`/live-chat` real-time is effectively disabled**: the page defines a full Laravel Echo listener (`window.Echo.channel('whatsapp.user.{id}').listen('.whatsapp.message', ...)`) inside `useEffect`, but the call that would activate it — `setupRealtime()` — is commented out (`// setupRealtime();`). As shipped, `/live-chat` only fetches conversations/messages once on mount and on manual chat switch; there is no polling and no live push. New incoming messages will not appear without a manual reload/re-navigation.
- `/evolution/inbox` uses `setInterval` polling instead: conversations list refreshes every 5s, and the active conversation's messages refresh every 3s. No Echo/websocket usage at all.
- `src/services/websocket-service.ts` is **fully commented out** — it exports nothing at runtime (no `wsService`). `src/components/chat/chat-window.tsx` imports `{ wsService }` from it, which is dead/broken code; that whole `components/chat` group is unused by any real route (see [components/chat.md](../components/chat.md)).
- See [flows/realtime-messaging.md](../flows/realtime-messaging.md) for the full mechanics comparison between the two inboxes.
- Chatbot flow/session management for WhatsApp (Evolution instances, flow builder) is a related but distinct feature area (`WhatsAppContext`, `/evolution/chatbot`) — out of scope for this doc beyond the one-line cross-reference above.
