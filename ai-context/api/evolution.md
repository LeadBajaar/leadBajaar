---
type: api
group: evolution
sourceFile: src/lib/api.ts
usedByFeatures: [live_chat]
---
# API: evolution

The `evolutionApi` object (`src/lib/api.ts:2207`, runs to end of file) — backs both the Evolution WhatsApp *integration setup* (account/instance management) and the `/evolution/inbox` chat UI. All methods use the shared `api` axios instance.

| Method | Method + Endpoint | Params | Purpose | file:line |
|---|---|---|---|---|
| `getAccounts` | `GET /evolution/accounts` | — | List configured Evolution WhatsApp accounts/instances | api.ts:2208 |
| `createAccount` | `POST /evolution/accounts` | `{ phone_number }` | Register a new Evolution instance | api.ts:2212 |
| `connectInstance` | `POST /evolution/accounts/{instanceName}/connect` | `instanceName` | Trigger connection (QR pairing) for an instance | api.ts:2216 |
| `getQrCode` | `GET /evolution/accounts/{instanceName}/qrcode` | `instanceName` | Fetch QR code for pairing | api.ts:2220 |
| `getStatus` | `GET /evolution/accounts/{instanceName}/status` | `instanceName` | Poll connection status | api.ts:2224 |
| `disconnectInstance` | `POST /evolution/accounts/{instanceName}/disconnect` | `instanceName` | Disconnect an instance | api.ts:2228 |
| `deleteAccount` | `DELETE /evolution/accounts/{instanceName}` | `instanceName` | Remove an account/instance | api.ts:2232 |
| `getConversations` | `GET /evolution/inbox/conversations` | — | Conversation list for `/evolution/inbox` | api.ts:2236 |
| `getMessages` | `GET /evolution/inbox/conversations/{conversationId}/messages` | `conversationId: number` | Thread messages for `/evolution/inbox` | api.ts:2240 |
| `sendMessage` | `POST /evolution/inbox/messages/send` | `{ conversation_id, message }` | Send outbound message via Evolution bridge | api.ts:2244 |
| `clearSession` | `POST /evolution/inbox/session/clear` | `{ conversation_id }` | Reset a contact's chatbot session state | api.ts:2251 |

## Notes
- `getAccounts`/`createAccount`/`connectInstance`/`getQrCode`/`getStatus`/`disconnectInstance`/`deleteAccount` belong to the integration-setup screen (`/integrations/evolution`, sidebar-gated separately as `feature: 'integrations'`) — out of this cluster's page scope, documented here only because they live in the same `evolutionApi` object; only `getConversations`/`getMessages`/`sendMessage`/`clearSession` are used by `/evolution/inbox` (see [pages/evolution-inbox.md](../pages/evolution-inbox.md)).
- `/evolution/inbox` itself only appears in the sidebar when an active `type === 'evolution'` integration exists (checked via `integrationApi.getIntegrations()` in `sidebar.tsx`), so this whole API surface is conditional on that integration being set up first.
- No websocket/broadcast auth counterpart exists for Evolution (contrast with `authorize` in [api/chat-messaging.md](../api/chat-messaging.md)) — the inbox relies entirely on polling, per [flows/realtime-messaging.md](../flows/realtime-messaging.md).
