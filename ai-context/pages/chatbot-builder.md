---
type: page
route: /chatbot/builder/[flowId]
file: src/app/(dashboard)/chatbot/builder/[flowId]/page.tsx
feature: chatbot
auth: protected
---
# Page: /chatbot/builder/[flowId]

## Purpose
Full-screen visual editor for a single Meta/WhatsApp-Cloud-API chatbot flow. `flowId === 'new'` creates a fresh flow instead of loading an existing one.

## Components used
- `RoleGuard` (`allowedFeatures={['chatbot']}`).
- `FlowBuilder` (`src/components/chatbot/flow-builder.tsx`) — does essentially all the work; the page itself is a thin wrapper that unwraps the async `params` (React `use()`), decides `isNew`, and on successful save of a new flow calls `router.replace('/chatbot/builder/{savedFlow.id}')` so the URL reflects the real ID.
- `src/app/(dashboard)/chatbot/builder/[flowId]/layout.tsx` wraps children in a `<Suspense fallback={<div>Loading...</div>}>` boundary (needed because of the `use(params)` async unwrapping).

## Data/API calls
- Delegated entirely to `FlowBuilder`: `chatbotService.getFlow(flowId)` on load, `chatbotService.saveFlow(flowData)` on save. See `components/chatbot.md` and `api/chatbot.md`.

## Notable behavior
- No server-driven redirect/loading state at the page level; `FlowBuilder` owns its own `loading`/`isMounted` states and renders its own spinners.
- See `flows/chatbot-flow-builder.md` for the full authoring walkthrough (node palette, trigger config, save).
