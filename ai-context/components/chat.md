---
type: component-group
group: chat
directory: src/components/chat
usedByFeatures: []
---
# Components: chat

**Status: unused/broken placeholder.** Neither file is imported by any page in `/live-chat` or `/evolution/inbox` (both of those pages implement their own inline chat UI directly in `page.tsx`). Grep confirms `ChatWindow`/`wsService` are only referenced within this group itself.

## chat-message.tsx
- Path: `src/components/chat/chat-message.tsx`
- Purpose: single chat bubble presentational component (bot vs. user styling, timestamp, sending/sent/error status glyph)
- Props (`ChatMessageProps`): `{ message: string; isBot: boolean; timestamp: string; status?: 'sending' | 'sent' | 'error' }`
- Uses shadcn `Avatar`/`AvatarFallback`/`AvatarImage` with hardcoded `/bot-avatar.png` / `/user-avatar.png` src paths (likely non-existent assets).

## chat-window.tsx
- Path: `src/components/chat/chat-window.tsx`
- Purpose: intended full chat widget (message list + input form), designed to connect to `wsService` from `@/services/websocket-service` for real-time push and `POST` sends.
- **Broken at runtime**: `src/services/websocket-service.ts` is entirely commented out and exports no `wsService` — the `import { wsService } from '@/services/websocket-service'` here would resolve to `undefined`, so any call like `wsService.initialize()` would throw if this component were ever mounted.
- Also imports the legacy `useToast` from `@/components/ui/use-toast`, which the shared architecture doc (`context/ai-context.md`) flags as deprecated in favor of `sonner` — another signal this file predates current conventions and is not maintained.
- Reads `localStorage.getItem('userId')` directly for channel subscription — inconsistent with the rest of the app's auth pattern (`localStorage.getItem('token')` via `src/lib/api.ts`/`src/lib/auth.ts`).
