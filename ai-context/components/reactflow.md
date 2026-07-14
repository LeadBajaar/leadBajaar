---
type: component-group
group: reactflow
directory: src/components/reactflow
usedByFeatures: [chatbot]
---
# Components: reactflow

All are `memo`-wrapped presentational node renderers for `@xyflow/react`, each returning a small Shadcn `Card` with top/bottom (and sometimes side) `Handle`s. Registered into the `nodeTypes` maps of `FlowBuilder` and `EvolutionFlowBuilder` (see `components/chatbot.md`).

## MessageNode
- Path: `src/components/reactflow/MessageNode.tsx`
- Purpose: Renders a chat message node. Content varies by `data.messageType`:
  - `cta_url`: header/body/footer text + a single button with its own source `Handle` (`id="button-cta"`) that opens `ctaUrl.button.url` on click (in the canvas, not just a design surface).
  - `template`: body text (`data.content`) + per-button `Handle`s (`id="button-{button.id}"`).
  - default (`text`): same body + per-button `Handle`s.
- Props: `{ data: MessageNodeData }`. Has a `target` Handle on top and a `source` Handle (`id="main"`) on bottom, plus one extra `source` Handle per button on the right for branching.

## InputNode
- Path: `src/components/reactflow/InputNode.tsx`
- Purpose: Minimal placeholder node representing a "wait for user input" step. Renders only `label` + `content` (defaults to "User Input" text if empty).
- Props: `{ data: { label: string; content: string } }`. Only used by `FlowBuilder` (not in the Evolution builder's `nodeTypes`).
- No type-specific configuration UI exists beyond the generic Label field in `FlowBuilder`'s property panel (no `InputNodeData.inputType`/`validation` editor is wired up despite those fields existing in `types/nodes.ts`).

## ConditionNode
- Path: `src/components/reactflow/ConditionNode.tsx`
- Purpose: Branching node with two source handles: bottom (`id="true"`) and right (`id="false"`), implying a true/false conditional split.
- Props: `{ data: { label: string; content: string } }`. Registered in both `FlowBuilder` and `EvolutionFlowBuilder`, but only `FlowBuilder`'s palette has an "Add Condition" button; no property-panel editor renders `ConditionNodeData.condition` in either builder (a gap — condition logic can't actually be authored through the UI as shipped).

## ApiNode
- Path: `src/components/reactflow/ApiNode.tsx`
- Purpose: Placeholder for an outbound API-call step. Renders only `label`/`content`.
- Props: `{ data: { label: string; content: string } }`. Only in `FlowBuilder`'s palette/`nodeTypes`. Like `ConditionNode`, `ApiNodeData` fields (`endpoint`, `method`, `headers`) exist in `types/nodes.ts` but have no property-panel editor — the node can be added but not meaningfully configured from this UI.

## FunctionNode
- Path: `src/components/reactflow/FunctionNode.tsx`
- Purpose: Placeholder card for a "run custom/predefined function" step. Renders only `label`/`content`.
- Props: `{ data: { label: string; content: string } }`. Only in `FlowBuilder`. The actual function configuration (type + code body) is edited through `FlowBuilder`'s property panel (`PREDEFINED_FUNCTIONS` selector + `functionBody` textarea), not through this card component itself — this card only ever shows generic `content`, which is never populated with the function body in the current code (a display gap: the function's code isn't reflected in the canvas card).

## FlowNode
- Path: `src/components/reactflow/FlowNode.tsx`
- Purpose: The root/trigger node representing "this is where the flow starts." Distinguished visually with a blue border and a `Tag` icon; shows `data.trigger` under the title if set.
- Props: `{ data: { label: string; content: string; trigger?: string } }`. Present in both builders' `nodeTypes` and both builders' seed data (`initialNodes[0]`).
