---
type: page
route: /integrations/evolution
file: src/app/(dashboard)/integrations/evolution/page.tsx
feature: integrations
auth: protected
---
# Page: /integrations/evolution

## Purpose
Connect/manage a personal WhatsApp number via the self-hosted Evolution API bridge (QR-code pairing, as opposed to Meta's official WhatsApp Cloud API). Single-account-per-workspace UI with connect → QR → connected/disconnected state machine.

## Components used
- No custom sub-components — plain shadcn `Card`/`Button`/`Input`.
- Uses `useToast` (`@/hooks/use-toast`, the shadcn/legacy toast hook), **not** `sonner` — an exception to the repo-wide `sonner`-only convention noted in `context/ai-context.md`.

## Data/API calls
All via `evolutionApi` (`src/lib/api.ts`, not `integrationApi`):
- `evolutionApi.getAccounts()` — on mount; picks the first `connected`/`open` account or falls back to the first account; resumes polling if mid-connection.
- `evolutionApi.createAccount('')` — creates a DB shell record (no phone number required upfront).
- `evolutionApi.connectInstance(instanceName)` — triggers Evolution API instance creation/connect.
- `evolutionApi.getQrCode(instanceName)` — polled every 3s until a QR payload (`data.qrcode`, a data-URI image string) is returned.
- `evolutionApi.getStatus(instanceName)` — polled every 4s; transitions to `connected` state on `state === 'connected'`.
- `evolutionApi.disconnectInstance(instanceName)` — manual disconnect.
- `evolutionApi.deleteAccount(instanceName)` — permanently removes the account (native `confirm()` dialog, not a styled modal).

## Notable behavior
- State machine: `loading → input → creating → qr → connected` (happy path) or `→ disconnected` (after a disconnect, offering "Reconnect Device" or "Delete Account").
- Two separate polling intervals (`qrPollRef`, `statusPollRef`) are cleared on unmount and on success; the QR poll self-clears once a code is received.
- After successful connection, re-fetches accounts to populate `profilePic`/`profileName`/`phoneNumber` from `account.whatsapp.{profilePictureUrl, profileName, owner/ownerJid}`.
- No `RoleGuard` wrapper on this page.
- Back/Cancel buttons call `stopPolling()` before `router.push('/integrations')` to avoid orphaned intervals.
