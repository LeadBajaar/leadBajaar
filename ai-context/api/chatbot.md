---
type: api
group: chatbot
sourceFile: src/services/chatbot-service.ts, src/services/chatbot.ts, src/app/api/chatbot/flows
usedByFeatures: [chatbot]
---
# API: chatbot

## Important: two competing service files, only one actually used

| File | Exported `chatbotService` | Imported anywhere in `src/`? |
| :--- | :--- | :--- |
| `src/services/chatbot.ts` | Plain object literal with `getFlows()`, `getFlow(id)`, `createFlow(input)`, `updateFlow(id, input)`, `deleteFlow(id)` | **Yes** — every chatbot page/component imports from `@/services/chatbot` |
| `src/services/chatbot-service.ts` | `ChatbotService` class instance with `getFlows(channelType)`, `getFlow(id)`, `saveFlow(payload)`, `toggleFlow(id)`, `deleteFlow(id)`, `duplicateFlow(id)`, `exportFlow(id)`, `importFlow(file)` | **No** — grep for `chatbot-service` across `src/` returns zero import hits |

All consumers (`src/app/(dashboard)/chatbot/page.tsx`, `.../evolution/chatbot/page.tsx`, `src/components/chatbot/flow-builder.tsx`, `.../evolution-flow-builder.tsx`) import from `@/services/chatbot` (i.e. `chatbot.ts`) but call `getFlows('evolution')`, `saveFlow(...)`, `toggleFlow(id)`, `duplicateFlow(id)` — methods that only exist on the *unused* `chatbot-service.ts` class. `chatbot.ts` does not export a `ChatbotFlow` type either (only `Flow`), yet pages import `ChatbotFlow` from it. `next.config.ts` has `typescript: { ignoreBuildErrors: true }`, which is consistent with this inconsistency shipping without a failed build. Treat any call to save/toggle/duplicate a flow as **likely broken at runtime** until this is reconciled — flag to a human rather than assuming it works.

## `src/services/chatbot.ts` (actually used)
Base URL: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'` (independent of the `API_BASE_URL`/`WHATSAPP_BASE_URL` constants in `src/lib/api.ts`).

| Function | Method + endpoint | Params | Purpose | File:line |
| :--- | :--- | :--- | :--- | :--- |
| `getFlows` | `GET {API_URL}/chatbot/flows` | none | List flows (no channel filter param exists here) | chatbot.ts:28 |
| `getFlow` | `GET {API_URL}/chatbot/flows/{flowId}` | `flowId` | Fetch one flow | chatbot.ts:40 |
| `createFlow` | `POST {API_URL}/chatbot/flows` | `{ name, description, trigger }` | Create flow | chatbot.ts:52 |
| `updateFlow` | `PUT {API_URL}/chatbot/flows/{flowId}` | `{ name?, description?, trigger?, nodes?, edges? }` | Update flow | chatbot.ts:67 |
| `deleteFlow` | `DELETE {API_URL}/chatbot/flows/{flowId}` | `flowId` | Delete flow | chatbot.ts:82 |

All requests use `credentials: 'include'` (cookie-based), not the `Authorization: Bearer` header pattern used elsewhere in the app.

## `src/services/chatbot-service.ts` (dead code — documented for completeness / in case it's re-wired later)
Base URL: `API_BASE_URL` from `src/lib/api.ts` (`https://api.leadbajaar.com/api`). Uses `Authorization: Bearer {localStorage.token}` + `credentials: 'include'`.

| Function | Method + endpoint | Params | Purpose | File:line |
| :--- | :--- | :--- | :--- | :--- |
| `getFlows` | `GET {baseUrl}/chatbot/flows?channel_type={channelType}` | `channelType = 'meta'` | List flows filtered by channel (`meta` / `evolution`) | chatbot-service.ts:57 |
| `getFlow` | `GET {baseUrl}/chatbot/flows/{id}` | `id` | Fetch one flow | chatbot-service.ts:81 |
| `saveFlow` | `POST {baseUrl}/chatbot/flows` or `PUT .../{id}` | `SaveFlowPayload` (name, description, trigger, channel_type, channel_id, nodes, edges) | Create or update depending on whether `id` is set | chatbot-service.ts:105 |
| `toggleFlow` | `PATCH {baseUrl}/chatbot/flows/{id}/toggle` | `id` | Flip `is_active` | chatbot-service.ts:147 |
| `deleteFlow` | `DELETE {baseUrl}/chatbot/flows/{id}` | `id` | Delete flow | chatbot-service.ts:157 |
| `duplicateFlow` | `POST {baseUrl}/chatbot/flows/{id}/duplicate` | `id` | Clone a flow | chatbot-service.ts:163 |
| `exportFlow` | `GET {baseUrl}/chatbot/flows/{id}/export` | `id` | Download flow as file (returns `Blob`) | chatbot-service.ts:170 |
| `importFlow` | `POST {baseUrl}/chatbot/flows/import` | `FormData` with `file` | Import a flow from file | chatbot-service.ts:175 |

## Next.js API routes (`src/app/api/chatbot/flows/*`)
These are Next.js route handlers (Backend-for-Frontend) that proxy to the Laravel API (`API_URL = process.env.API_URL || 'http://localhost:8000/api'`, a **server-side** env var, distinct from the client-side `NEXT_PUBLIC_API_URL` used by `chatbot.ts`). **Neither `chatbot.ts` nor `chatbot-service.ts` calls through these routes** — both service files hit the external API directly from the browser. These routes appear unused by the current chatbot UI (no `fetch('/api/chatbot/flows...')` call found anywhere in `src/`); they may be leftover scaffolding or intended for a server-rendered path not currently wired up.

| Method + endpoint | Forwards to | Notes | File:line |
| :--- | :--- | :--- | :--- |
| `GET /api/chatbot/flows` | `GET {API_URL}/chatbot/flows` | Forwards incoming `Cookie` header | route.ts:5 |
| `POST /api/chatbot/flows` | `POST {API_URL}/chatbot/flows` | Forwards `Cookie` header + JSON body | route.ts:29 |
| `GET /api/chatbot/flows/{flowId}` | `GET {API_URL}/chatbot/flows/{flowId}` | `runtime = 'edge'`, `revalidate = 0` (no cache) | [flowId]/route.ts:16 |
| `PUT /api/chatbot/flows/{flowId}` | `PUT {API_URL}/chatbot/flows/{flowId}` | `cache: 'no-store'` | [flowId]/route.ts:46 |
| `DELETE /api/chatbot/flows/{flowId}` | `DELETE {API_URL}/chatbot/flows/{flowId}` | `cache: 'no-store'` | [flowId]/route.ts:80 |

## Cross-reference (out of scope here)
The `/whatsapp-bot` feature's flow-related endpoints (`GET ${WHATSAPP_BASE_URL}/chatbot/flows/{userId}`, session reset, etc.) live on an entirely separate Node.js bridge service and are documented in `features/whatsapp_bot.md` and `components/whatsapp-bot.md` instead of here, since they share no code with this API group.
