---
type: component-group
group: whatsapp-bot
directory: src/components/whatsapp-bot
usedByFeatures: [whatsapp_bot]
---
# Components: whatsapp-bot

All components in this group talk directly to the Node.js WhatsApp bridge via `axios` + `WHATSAPP_BASE_URL` (from `@/lib/api`), not through a shared service layer file, and not through the Laravel API used by `/chatbot` and `/evolution/chatbot`.

## WhatsAppBotGroups
- Path: `src/components/whatsapp-bot/WhatsAppBotGroups.tsx`
- Purpose: Contact-group management tab: create/delete groups, view paginated contacts (search by phone/name), import contacts manually (`phone,name` lines) or via CSV with column-mapping UI and a hand-rolled CSV line parser (handles quoted fields).
- Props: `{ userId: string }` (the connected WhatsApp session id).
- Key endpoints: `GET/POST/DELETE ${WHATSAPP_BASE_URL}/campaigns/groups[/:id]`, `GET ${WHATSAPP_BASE_URL}/campaigns/contacts/{userId}/{groupId}`, `DELETE .../campaigns/contacts/{id}`, `POST .../campaigns/contacts/import`.

## WhatsAppConnectModal
- Path: `src/components/whatsapp-bot/WhatsAppConnectModal.tsx`
- Purpose: QR-code connect flow for linking a new (or reconnecting a "ghost") WhatsApp session. Polls for QR image and connection success every 5s (capped at 60 polls / 5 min).
- Props: none (reads/writes shared state via `useWhatsApp()` — `isConnectModalOpen`, `prefilledUserId`, `fetchSessions`).
- Key endpoints: `POST ${WHATSAPP_BASE_URL}/messages/connect`, `GET ${WHATSAPP_BASE_URL}/dashboard/qr/{userId}`, `GET ${WHATSAPP_BASE_URL}/dashboard/status`.
- Session id is scoped as `${user.id}_${idToUse}` before being sent to the bridge.

## WhatsAppBotProfile
- Path: `src/components/whatsapp-bot/WhatsAppBotProfile.tsx`
- Purpose: Profile/status card for one session — shows Active/Ghost/Shredded badge, phone number (if available), and contextual actions (Log Out / Reconnect+Shred / Scan QR).
- Props: `{ userId: string }`.
- Key endpoints: `POST ${WHATSAPP_BASE_URL}/messages/connect` (reconnect), `POST ${WHATSAPP_BASE_URL}/messages/logout` (disconnect, bearer-auth'd with `NEXT_PUBLIC_WHATSAPP_SECRET`).

## WhatsAppBotCampaigns
- Path: `src/components/whatsapp-bot/WhatsAppBotCampaigns.tsx`
- Purpose: Broadcast campaign manager — launch, pause, resume (with optional resend limit + message/media re-edit before resume), delete, and view per-recipient delivery report (paginated, searchable). Includes a built-in "Anti-Ban Safety Advisor" that inline-warns about risky link+media combos and recommends Spintax (`{a|b|c}`) variation.
- Props: `{ userId: string }`.
- Key endpoints: `GET/POST/PUT/DELETE ${WHATSAPP_BASE_URL}/campaigns/campaigns[/:id]`, `GET .../campaigns/campaigns/{id}/recipients`, `POST .../campaigns/campaigns/{id}/stop|resume`, `POST .../campaigns/upload` (media, capped 10MB).
- Media URLs returned by upload are rewritten by stripping a trailing `/api` from `WHATSAPP_BASE_URL` to get a static-file root.

## WhatsAppBotChat
- Path: `src/components/whatsapp-bot/WhatsAppBotChat.tsx`
- Purpose: Live 1:1 chat UI for a session — conversation list (polled every 10s) + message thread (polled every 3s while a contact is selected, only while the tab has focus), with rich rendering for image/video/audio/document media and styled placeholders for `[Image]`/`[Video]`/`[Document]`/`[Audio]`/`[Sticker]` marker strings. Supports sending text + one attached media file, deleting a conversation, and force-resetting a stuck bot session back to `START` state.
- Props: `{ userId: string }`.
- Key endpoints: `GET ${WHATSAPP_BASE_URL}/chat/conversations/{userId}`, `GET .../chat/history/{userId}/{phone}`, `DELETE .../chat/history/{userId}/{phone}`, `POST .../messages/send-message` (bearer-auth'd), `POST .../campaigns/upload` (reused for chat attachments), `POST .../chatbot/sessions/reset`.
