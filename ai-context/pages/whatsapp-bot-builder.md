---
type: page
route: /whatsapp-bot/builder
file: src/app/(dashboard)/whatsapp-bot/builder/page.tsx
feature: whatsapp_bot
auth: protected
---
# Page: /whatsapp-bot/builder

## Purpose
Visual editor for one WhatsApp session's (`?userId=`) keyword/state-machine automation rules, rendered as a React Flow graph even though the underlying data model is a flat table of rows, not a persisted node/edge graph. Entirely self-contained (no separate builder component file — all logic lives in this page).

## Components used
- Local `MessageNode` (defined inline in this file, distinct from `src/components/reactflow/MessageNode.tsx`) registered as `nodeTypes: { messageNode: MessageNode }`.
- `ReactFlow`, `MiniMap`, `Controls`, `Background`, `Panel` from `@xyflow/react`.
- Shadcn `Dialog` (node create/edit form), `Card`, `Badge`, `Select`, `Textarea`, `Input`.

## Data/API calls
- `GET ${WHATSAPP_BASE_URL}/chatbot/flows/{userId}` — loads all flow rows for the session; builds nodes positioned in a 4-column grid and synthesizes edges wherever one row's `next_state` matches another's `required_state`.
- `PUT ${WHATSAPP_BASE_URL}/chatbot/flows/{sourceNode.id}}` and `.../{targetNode.id}` — on manually dragging a connection between two nodes (`onConnect`), updates `next_state`/`required_state` on both rows to link them (generates a random `state_{id}_{rand}` if the target has no real state yet), then refetches.
- `POST /chatbot/flows` (create) / `PUT /chatbot/flows/{id}` (update) / `DELETE /chatbot/flows/{id}` — via the node-edit `Dialog` (`handleSaveFlow`, `handleDeleteFlow`).
- `POST api.post('/storage/r2/upload-image')` (note: uses `@/lib/api`'s `api` axios instance → Laravel `API_BASE_URL`, i.e. Cloudflare R2 upload endpoint, **not** the WhatsApp bridge) — for node media attachments.

## Notable behavior
- "Save Changes" button (`saveLayout`) does **not** persist anything — it only shows a toast ("Flow layout cached... coming in next sync"). Node **content** changes are saved individually and immediately through the Dialog; only the canvas **positions** are ephemeral/client-only.
- Root/entry nodes are distinguished by `required_state === 'START'`; step nodes require a specific `required_state`. `match_type` supports `contains | exact | starts_with | wildcard`.
- Media types supported per-node: `none | image | video | audio | document`, uploaded via Cloudflare R2 and referenced by URL.
- "PRO" badge shown in the header — this builder is presented as a premium capability though gating happens one level up at `/whatsapp-bot` (see `pages/whatsapp-bot.md`), not on this page itself.
