---
type: component-group
group: chatbot
directory: src/components/chatbot
usedByFeatures: [chatbot]
---
# Components: chatbot

## FlowBuilder
- Path: `src/components/chatbot/flow-builder.tsx`
- Purpose: Full React Flow canvas editor for Meta/WhatsApp-Cloud-API chatbot flows. Renders node palette, canvas, and a right-hand property panel that changes shape per selected node type.
- Key props: `{ flowId: string | null; isNew?: boolean; onSave?: (flow: ChatbotFlow) => void }`.
- Node types registered: `message` (`MessageNode`), `input` (`InputNode`), `condition` (`ConditionNode`), `api` (`ApiNode`), `function` (`FunctionNode`), `flow` (`FlowNode`) — see `components/reactflow.md`.
- Notable internals:
  - `initialNodes`/`initialEdges` seed a default "Welcome Flow" (a `flow` trigger node → one `message` node) when `isNew`.
  - `TRIGGER_TYPES`: `message | exact_match | button | api | schedule | event | regex | intent`, encoded into the saved `trigger` string as `"{type}:{value}"` (or bare `value` when type is `message`).
  - `PREDEFINED_FUNCTIONS`: canned JS snippets (`save_name`, `save_email`, `save_phone`) selectable for `function` nodes, or `custom` for free-form code — this code is stored as text in `functionBody`; nothing in the frontend executes it (see `flows/chatbot-automation-execution.md`).
  - Message nodes support `text`, `template` (loads real WhatsApp Business templates via `integrationApi.getWhatsAppAccounts()` in the memoized `NodeProperties` sub-component), and `cta_url` (call-to-action button with header/body/footer/button fields).
  - `onConnect` blocks a second incoming edge into any non-`message` node (keeps state-machine-like single-parent structure), but allows unlimited edges into `message` nodes.
  - Persists via `chatbotService.getFlow` / `chatbotService.saveFlow` from `@/services/chatbot` — see the dead-code caveat in `api/chatbot.md`.

## EvolutionFlowBuilder
- Path: `src/components/chatbot/evolution-flow-builder.tsx`
- Purpose: Simplified sibling of `FlowBuilder` for Evolution-channel flows.
- Key props: `{ flowId: string | null; isNew?: boolean; onSave?: (flow: ChatbotFlow) => void }`.
- Node types registered: `message`, `condition`, `flow` only — but the "Add Nodes" sidebar only exposes a button to add `message` nodes; `condition` nodes can exist (e.g. from loaded data) but aren't creatable from this UI.
- Property panel (`NodeProperties`, a local `memo` component distinct from `FlowBuilder`'s) only implements editing for `message` nodes (text + delete); everything else shows a placeholder "Select a message node to edit its properties."
- Trigger is a single free-text "Trigger Keyword" input (no `TRIGGER_TYPES` selector).
- Saves via `chatbotService.saveFlow({ ...payload, channel_type: 'evolution', is_active: true })`.

## Cross-reference
- Node presentational components (`MessageNode`, `InputNode`, `ConditionNode`, `ApiNode`, `FunctionNode`, `FlowNode`) live in `src/components/reactflow/` — see `components/reactflow.md`.
- Type definitions (`ChatbotNode`, `ChatbotEdge`, per-node `*Data` interfaces) live in `src/types/nodes.ts`.
