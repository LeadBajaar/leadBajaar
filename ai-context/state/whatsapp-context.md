---
type: state
group: whatsapp-context
directory: src/contexts
usedByFeatures: [whatsapp_bot]
---
# State: WhatsAppContext

## What it provides
`src/contexts/WhatsAppContext.tsx` exposes `useWhatsApp()` (must be used within `<WhatsAppProvider>`), backed by a **separate microservice** (`WHATSAPP_BASE_URL`, `https://wp.leadbajaar.com/api`, from `src/lib/api.ts`) accessed via a raw `axios` instance — **not** the shared `api` client and **not** company-scoped by the Laravel backend's auth-token interceptor; it manually passes `user.id` as `userId` params instead.

State/values:
- `sessions: string[]`, `ghostSessions: string[]`, `historicalSessions: string[]` — WhatsApp session identifiers by status, from `GET {WHATSAPP_BASE_URL}/dashboard/status`
- `sessionDetails: Record<string, { whatsappId, name, phone }>`
- `selectedUser: string | null` / `setSelectedUser` — the currently selected WhatsApp session
- `flows: Flow[]` — chatbot flow rules (`id, name, trigger_keyword, match_type, required_state, next_state, reply_message, is_active, priority`) for the selected session, from `GET {WHATSAPP_BASE_URL}/chatbot/flows/{userId}`
- `loading: boolean`
- `isConnectModalOpen` / `setIsConnectModalOpen`, `prefilledUserId` / `setPrefilledUserId` — UI state for a "connect new WhatsApp number" modal (modal itself not in this cluster's read set)

Actions:
- `fetchSessions()` — refreshes all session lists; auto-selects the first active session if none selected
- `fetchFlows(userId)` — loads chatbot flows for a session
- `shredSession(userId)` — `DELETE {WHATSAPP_BASE_URL}/dashboard/session/{userId}`, destructive, gated by a native `confirm()` dialog, toasts success/failure
- `toggleFlow(flowId, isActive)` — `PATCH {WHATSAPP_BASE_URL}/chatbot/flows/{flowId}/toggle`
- `deleteFlow(flowId)` — `DELETE {WHATSAPP_BASE_URL}/chatbot/flows/{flowId}`, gated by `confirm()`

## Who consumes it
Not consumed by any file in the Leads/Live Chat cluster (`/live-chat`, `/evolution/inbox` use `evolutionApi`/direct `api.ts` calls instead, not `WhatsAppContext`). **Confirmed by the Chatbot/WhatsApp Bot cluster**: this context backs the `/whatsapp-bot` feature (session management, live chat, contact groups, and broadcast campaigns) — see [features/whatsapp_bot.md](../features/whatsapp_bot.md). It is unrelated to the `/chatbot` and `/evolution/chatbot` React-Flow builders, which talk to the Laravel API instead.

## Gotchas
- Uses a plain `axios` import directly, bypassing `src/lib/api.ts`'s `api` instance — no bearer-token interceptor, no global 401 handling, no shared base URL. Any change to auth conventions in `api.ts` will **not** propagate here.
- Talks to an entirely different backend host (`WHATSAPP_BASE_URL`) than the main Laravel API (`API_BASE_URL`) — likely the standalone WhatsApp/Evolution microservice, not the CRM backend. Confirm which service owns this before assuming request/response shapes match `src/lib/api.ts` conventions.
- Destructive actions (`shredSession`, `deleteFlow`) rely on the browser's native `confirm()` — no custom confirmation dialog component, inconsistent with the `Dialog`-based confirmations used elsewhere (e.g. `DeleteConfirmationDialog` in the leads feature).
- `fetchSessions` silently swallows errors with only a `console.error` (no toast) — a downed WhatsApp microservice fails silently from the user's perspective beyond an empty session list.
