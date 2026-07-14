---
type: feature
slug: chatbot
name: Chatbot Flow Builder (WhatsApp Cloud API + Evolution)
status: partial
roles: [Super Admin, Admin, Manager]
userTypes: [agency, super_admin, individual]
planFeatureKey: chatbot
routes: ["/chatbot", "/chatbot/builder/[flowId]", "/evolution/chatbot", "/evolution/chatbot/builder/[flowId]"]
relatedDocs:
  pages: [../pages/chatbot.md, ../pages/chatbot-builder.md, ../pages/evolution-chatbot.md, ../pages/evolution-chatbot-builder.md]
  components: [../components/chatbot.md, ../components/reactflow.md]
  api: [../api/chatbot.md]
  flows: [../flows/chatbot-flow-builder.md, ../flows/chatbot-automation-execution.md]
---
# Feature: Chatbot Flow Builder (WhatsApp Cloud API + Evolution)

## Summary
A visual, node-based conversation-flow builder built on `@xyflow/react` (React Flow). There are **two UI variants that are the same underlying feature**, distinguished only by a `channel_type` on the saved flow record:

- **`/chatbot`** — flows for the **WhatsApp Cloud API** (Meta) integration. `channel_type` defaults to `'meta'`.
- **`/evolution/chatbot`** — flows for the **Evolution** (self-hosted WhatsApp bridge) integration. `channel_type` is `'evolution'`.

Both variants share the same sidebar gate (`feature: 'chatbot'`), the same backend flow model (nodes/edges JSON persisted through the Laravel API), the same `ChatbotFlow` type, and the same `chatbotService` client (`src/services/chatbot.ts`). The Evolution builder (`EvolutionFlowBuilder`) is a deliberately simplified subset of the main builder (`FlowBuilder`): only `message`, `condition`, and `flow` node types are wired into its `nodeTypes` map (though its "Add Nodes" panel only exposes "Text Message"), whereas the main builder exposes `message`, `input`, `condition`, `api`, `function`, `flow`.

This is a **distinct system** from the `/whatsapp-bot` feature (see `whatsapp_bot.md`), which is a separate keyword/state-machine automation tied to a different backend service (the Node.js WhatsApp bridge at `WHATSAPP_BASE_URL`), not the Laravel API.

## Access control
- Sidebar entries "Chatbot" (`/chatbot`) and "Evolution Chatbot" (`/evolution/chatbot`) both require `feature: 'chatbot'`, roles `Super Admin | Admin | Manager`, and types `agency | super_admin | individual` (`src/components/sidebar.tsx` lines 34-35).
- The Evolution Chatbot nav item is additionally hidden unless the workspace has an active `evolution` integration (`sidebar.tsx` `canSee()`, checks `integrationApi.getConnectedIntegrations()` for `type === 'evolution' && is_active`).
- Both page components wrap their content in `<RoleGuard allowedFeatures={['chatbot']}>` (client-side redirect guard; see `src/components/RoleGuard.tsx`).
- Gating ultimately resolves through `useUser().hasFeature('chatbot')`, itself driven by plan/company feature flags in `UserContext`.

## Key files
- Pages: `src/app/(dashboard)/chatbot/page.tsx`, `src/app/(dashboard)/chatbot/builder/[flowId]/page.tsx` (+ `layout.tsx` Suspense wrapper), `src/app/(dashboard)/evolution/chatbot/page.tsx`, `src/app/(dashboard)/evolution/chatbot/builder/[flowId]/page.tsx`
- Canvas components: `src/components/chatbot/flow-builder.tsx` (`FlowBuilder`), `src/components/chatbot/evolution-flow-builder.tsx` (`EvolutionFlowBuilder`)
- Node renderers: `src/components/reactflow/*` (see `components/reactflow.md`)
- Types: `src/types/nodes.ts` (`ChatbotNode`, `ChatbotEdge`, per-node data shapes)
- Client/service: `src/services/chatbot.ts` (the one actually imported everywhere)
- Next.js BFF routes: `src/app/api/chatbot/flows/route.ts`, `src/app/api/chatbot/flows/[flowId]/route.ts` (proxy to Laravel; **not used by the pages above** — see `api/chatbot.md`)

## Notes
- **Known bug / dead code**: every page/component imports `chatbotService` from `@/services/chatbot` (i.e. `chatbot.ts`), but calls methods on it — `getFlows(channelType)`, `toggleFlow(id)`, `duplicateFlow(id)`, `saveFlow(payload)` — that **do not exist** on the object exported by `chatbot.ts` (which only has `getFlows()`, `getFlow()`, `createFlow()`, `updateFlow()`, `deleteFlow()`, and doesn't export a `ChatbotFlow` type, only `Flow`). A second, more complete service class exists at `src/services/chatbot-service.ts` (exports `ChatbotFlow`, `getFlows(channelType)`, `saveFlow`, `toggleFlow`, `duplicateFlow`, `exportFlow`, `importFlow`) but **is never imported anywhere in `src/`** — it appears to be the intended replacement that was never wired in. `next.config.ts` sets `typescript.ignoreBuildErrors: true`, which is presumably how this ships without failing the build. Net effect: calling Save/Toggle/Duplicate from these pages likely throws `... is not a function` at runtime unless something else patches this in. Flag this to a human before relying on these flows working end-to-end.
- Trigger types (`TRIGGER_TYPES` in `flow-builder.tsx`): `message`, `exact_match`, `button`, `api`, `schedule`, `event`, `regex`, `intent`. The Evolution builder only uses a plain free-text "Trigger Keyword" input, no typed trigger selector.
- Message nodes support three `messageType`s: `text`, `template` (pulls real WhatsApp Business templates via `integrationApi.getWhatsAppAccounts()`), and `cta_url` (call-to-action URL button). The Evolution message node only supports plain text content.
- See `flows/chatbot-flow-builder.md` for the end-to-end authoring flow and `flows/chatbot-automation-execution.md` for what is/isn't knowable about runtime execution from this repo.
