---
type: page
route: /whatsapp-bot
file: src/app/(dashboard)/whatsapp-bot/page.tsx
feature: whatsapp_bot
auth: protected
---
# Page: /whatsapp-bot

## Purpose
Tabbed control center for the WhatsApp Bot feature: Flows, Live Chat, Contacts (groups), Broadcast (campaigns), Profile — all scoped to one connected WhatsApp session at a time (`selectedUser`). Also owns multi-session connect/disconnect/reconnect UI in the header.

## Components used
- `WhatsAppBotChat`, `WhatsAppBotGroups`, `WhatsAppBotCampaigns`, `WhatsAppBotProfile`, `WhatsAppConnectModal` (all from `src/components/whatsapp-bot/`, see `components/whatsapp-bot.md`).
- Shadcn `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `Card`, `Badge`, `ScrollArea`, `Dialog`.
- Consumes `useWhatsApp()` (`WhatsAppContext` — belongs to another cluster; cross-referenced only) for `sessions`, `ghostSessions`, `historicalSessions`, `flows`, `selectedUser`, `toggleFlow`, `deleteFlow`, `fetchSessions`, connect-modal state.
- `useUser()` for the in-component plan gate (`hasFeature('whatsapp_bot')`).

## Data/API calls
- No direct API calls in the page itself for the plan-gated content — flows/sessions are fetched by `WhatsAppContext`. Session logout/reconnect actions call `axios.post(${WHATSAPP_BASE_URL}/messages/logout|connect, ...)` directly from inline handlers (bearer token from `NEXT_PUBLIC_WHATSAPP_SECRET` for logout).

## Notable behavior
- Plan gate is manual (`if (!hasFeature('whatsapp_bot')) return <upsell card linking to /billing>`) rather than via `RoleGuard`.
- "Sequence Tracer": groups the flat `flows` array (from context) into visual journeys client-side by chaining `required_state -> next_state` (see `flowGroups` useMemo, capped at depth 20 to avoid infinite loops on malformed data).
- Session chips distinguish three states: active (green, live), "ghost" (disconnected but resumable, amber/muted), and "historical" (fully logged out/shredded, dashed border) — each with different action buttons (disconnect / reconnect+shred / scan-QR-to-reconnect).
- Builder is reached via `Link href="/whatsapp-bot/builder?userId={selectedUser}"`.
