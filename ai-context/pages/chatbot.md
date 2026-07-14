---
type: page
route: /chatbot
file: src/app/(dashboard)/chatbot/page.tsx
feature: chatbot
auth: protected
---
# Page: /chatbot

## Purpose
List view of a company's Meta/WhatsApp-Cloud-API chatbot flows: create, edit, duplicate, delete, and toggle active/inactive.

## Components used
- `RoleGuard` (`allowedFeatures={['chatbot']}`) wrapping the whole page.
- Shadcn primitives: `Button`, `Card`/`CardContent`/`CardDescription`/`CardFooter`/`CardHeader`/`CardTitle`, `Switch`, `Badge`.
- `useToast` from `@/components/ui/use-toast` (legacy toast hook — inconsistent with the repo-wide `sonner` convention noted in `context/ai-context.md`; this page and its Evolution sibling are exceptions).

## Data/API calls
- `chatbotService.getFlows()` (from `@/services/chatbot`) on mount — no `channel_type` param passed here (implicit Meta/default).
- `chatbotService.deleteFlow(id)`, `chatbotService.duplicateFlow(id)`, `chatbotService.toggleFlow(id)` on user actions.
- **Caveat**: `duplicateFlow` and `toggleFlow` are called but not defined on the `chatbotService` object actually exported by `@/services/chatbot`; see `features/chatbot.md` Notes and `api/chatbot.md` for the mismatch with the unused `chatbot-service.ts`.

## Notable behavior
- Empty state prompts "Create First Flow" → `router.push('/chatbot/builder/new')`.
- Each flow card shows trigger badge, last-updated date, node count, and an active/inactive `Switch` that optimistically updates local state on toggle.
- Edit routes to `/chatbot/builder/{flow.id}`.
