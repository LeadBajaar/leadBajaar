---
type: page
route: /evolution/chatbot/builder/[flowId]
file: src/app/(dashboard)/evolution/chatbot/builder/[flowId]/page.tsx
feature: chatbot
auth: protected
---
# Page: /evolution/chatbot/builder/[flowId]

## Purpose
Full-screen visual editor for a single Evolution-channel chatbot flow. Same `flowId === 'new'` convention as the Meta builder.

## Components used
- `RoleGuard` (`allowedFeatures={['chatbot']}`).
- `EvolutionFlowBuilder` (`src/components/chatbot/evolution-flow-builder.tsx`) — a simplified builder (message/condition/flow nodes only, no template/CTA-URL/API/function nodes, no template picker).

## Data/API calls
- Delegated to `EvolutionFlowBuilder`: `chatbotService.getFlow(id)` on load; `chatbotService.saveFlow(payload)` on save, with `payload.channel_type` hardcoded to `'evolution'` and `is_active: true`.

## Notable behavior
- On load failure, redirects back to `/evolution/chatbot` with a toast (unlike the Meta builder, which just shows an inline error).
- Node property panel only supports editing message text and deleting the node; condition/flow nodes show a generic "select a message node" placeholder instead of real property editors (feature parity gap vs. the Meta builder's `FlowBuilder`).
