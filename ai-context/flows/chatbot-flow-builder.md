---
type: flow
slug: chatbot-flow-builder
featuresInvolved: [chatbot, whatsapp_bot]
---
# Flow: Chatbot Flow Builder

End-to-end walkthrough of authoring a conversation flow, covering the two React-Flow-based builders (`FlowBuilder` for `/chatbot`, `EvolutionFlowBuilder` for `/evolution/chatbot`) plus a note on how the structurally-different `/whatsapp-bot/builder` fits in.

## Meta / Evolution builders (`FlowBuilder`, `EvolutionFlowBuilder`)

1. User navigates from the list page (`/chatbot` or `/evolution/chatbot` — [chatbot list](../pages/chatbot.md), [evolution list](../pages/evolution-chatbot.md)) via "Create Flow" (→ `.../builder/new`) or "Edit" on an existing card (→ `.../builder/{id}`).
2. The builder page ([chatbot-builder](../pages/chatbot-builder.md), [evolution-chatbot-builder](../pages/evolution-chatbot-builder.md)) unwraps `flowId` from route params and decides `isNew = flowId === 'new'`.
3. **New flow**: canvas seeds with a default `flow`-type root node ("Welcome Flow") wired to one `message` node ("Welcome Message"), per `initialNodes`/`initialEdges` in [`flow-builder.tsx`](../components/chatbot.md) / [`evolution-flow-builder.tsx`](../components/chatbot.md).
   **Existing flow**: `chatbotService.getFlow(flowId)` loads persisted `nodes`, `edges`, `name`, `description`, and `trigger` (Meta builder additionally parses a `"type:value"`-encoded trigger string into `{ type, value }`).
4. User edits the canvas:
   - Adds nodes via the sidebar palette (Meta: Flow/Message/Input/Condition/API/Function; Evolution: Message only) — new nodes are placed at the current viewport center (Meta) or a fixed position (Evolution).
   - Drags connections between node handles (`onConnect`); Meta builder enforces single-parent-in for non-message nodes.
   - Clicks a node (`onNodeClick`) to select it, which opens the right-hand Properties panel — panel contents are type-specific (see [reactflow components](../components/reactflow.md) and [chatbot components](../components/chatbot.md) for exactly which node types have real editors vs. placeholders).
   - Edits flow-level metadata in the header: name, description, and trigger (Meta: typed trigger selector + value input; Evolution: single free-text keyword input).
5. User clicks "Save Flow":
   - Meta: builds a `flowData` payload (`{ id?, name, description, trigger: encoded string, nodes, edges }`) and calls `chatbotService.saveFlow(...)`. On success for a new flow, replaces the URL to `/chatbot/builder/{savedFlow.id}` and calls the `onSave` callback (which the page also uses to do the same replace — redundant but harmless).
   - Evolution: builds a payload with `channel_type: 'evolution'` and `is_active: true` hardcoded, calls `chatbotService.saveFlow(...)`, and invokes `onSave` (page-level replace happens there).
   - **Both paths are subject to the dead-code caveat**: `chatbotService.saveFlow` doesn't exist on the actually-imported service object — see [`api/chatbot.md`](../api/chatbot.md). Treat "Save" as unverified/likely-broken until reconciled.
6. Toggling active/inactive and duplicating/deleting happen from the **list page**, not the builder — see [chatbot.md](../pages/chatbot.md) / [evolution-chatbot.md](../pages/evolution-chatbot.md). Same dead-code caveat applies to toggle/duplicate.

## `/whatsapp-bot/builder` (structurally different — see [page doc](../pages/whatsapp-bot-builder.md))

This builder visualizes a **flat table of keyword-triggered rows** as a graph, rather than editing a persisted node/edge graph:
1. Loads all rows for a session via `GET {WHATSAPP_BASE_URL}/chatbot/flows/{userId}`, auto-lays them out in a grid, and synthesizes edges from matching `next_state`/`required_state` pairs.
2. Clicking a node opens a Dialog to edit that row's `trigger_keyword`, `match_type`, `reply_message`, media, `required_state`/`next_state`.
3. Dragging a connection between two nodes (`onConnect`) immediately `PUT`s both rows to sync their state-machine links — this is a live write, not a staged canvas edit.
4. There is no true "Save Flow" for node content (each edit dialog saves immediately via POST/PUT/DELETE); the header's "Save Changes" button only caches layout client-side (toast only, not persisted).

## What determines whether a flow actually fires
Node/edge JSON, trigger config, and `is_active` are all that this repo persists or displays. See [`flows/chatbot-automation-execution.md`](chatbot-automation-execution.md) for what can (and can't) be inferred about runtime execution from the frontend.
