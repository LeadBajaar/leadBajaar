---
type: page
route: /evolution/chatbot
file: src/app/(dashboard)/evolution/chatbot/page.tsx
feature: chatbot
auth: protected
---
# Page: /evolution/chatbot

## Purpose
List view of a company's Evolution-channel chatbot flows — structurally near-identical to `/chatbot` (see `pages/chatbot.md`) but restyled (bigger cards, gradient accents) and scoped to `channel_type: 'evolution'`.

## Components used
- `RoleGuard` (`allowedFeatures={['chatbot']}`).
- Shadcn primitives: `Card` family (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`), `Button`, `Switch`, `Badge`.
- `useToast` (legacy hook, same as `/chatbot`).

## Data/API calls
- `chatbotService.getFlows('evolution')` on mount — passes the channel type explicitly, unlike `/chatbot`.
- `chatbotService.deleteFlow(id)`, `chatbotService.duplicateFlow(id)`, `chatbotService.toggleFlow(id)` — same caveat as `/chatbot` applies: these methods don't exist on the actually-imported `chatbotService` from `chatbot.ts` (see `features/chatbot.md`).

## Notable behavior
- Empty state and per-card "Edit" route to `/evolution/chatbot/builder/new` / `/evolution/chatbot/builder/{flow.id}`.
- Only reachable if the sidebar shows the nav item, which additionally requires an active `evolution`-type integration (see `src/components/sidebar.tsx` `canSee()`); the page itself does not re-check that integration is connected, so direct navigation would still render (just likely with an empty/erroring flow list).
