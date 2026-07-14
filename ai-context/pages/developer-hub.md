---
type: page
route: /developer
file: src/app/(dashboard)/developer/page.tsx
feature: developer_tools
auth: protected
subRoutes: ["/developer/getting-started", "/developer/assets", "/developer/leads", "/developer/pixel-capi", "/developer/ads", "/developer/audiences", "/developer/security", "/developer/automations-guide", "/developer/report"]
---
# Page group: /developer (Developer Hub)

## Purpose
A static documentation/reference console for Meta (Facebook/Instagram) API integration topics, styled as a product marketing page with a hero banner and a card grid linking to 7 topic modules, plus 2 additional standalone doc pages linked from the "Get Started"/"Implementation Report" hero CTAs. No page in this group calls a backend API — confirmed via full-directory grep (no `Api.`/`api.`/`fetch(` matches anywhere under `developer/`).

## Guard
Only the index page wraps in `RoleGuard allowedFeatures={['developer_tools']}`. **All 9 sub-pages have no `RoleGuard`** — they render for any authenticated user who navigates directly to the URL. See `../features/developer_tools.md`.

## Route: /developer (index)
Hero header ("Scale your Meta Architecture") with CTAs to Getting Started and the Implementation Report. Feature grid of 7 cards (Asset & Account Management, Lead Capture & Retrieval, Pixel & CAPI Tracking, Advanced Ad Ops, Audience Intelligence, Security & Compliance, Email & Marketing Automation), each linking to its sub-route. Pixel/Ads cards are conditionally filtered by `NEXT_PUBLIC_FEATURE_PIXELS`/`NEXT_PUBLIC_FEATURE_ADS` env flags (routes remain reachable directly regardless). Footer section: "Technical Implementation Notes" (auth/token lifecycle tips, permissions/access tips) as static content.

## Route: /developer/getting-started
"Getting Started" — 3-section static doc: (1) 4-step core workflow (Connect via OAuth → Sync Assets → Enable Tracking → Automate Scaling), (2) Authentication section with a copy-to-clipboard bearer-token curl-style snippet, (3) links out to 4 deep-dive docs (API Verification Report at `/developer/report`, and 3 external `.md` files under `/docs/*`: `META_PIXEL_CAPI_IMPLEMENTATION.md`, `META_OAUTH_IMPLEMENTATION_SYSTEM.md`, `META_PIXEL_VERIFICATION_REPORT.md`). Sidebar cards show static "Quick Start Tools" steps and hardcoded platform benchmark bars (API Uptime 99.98%, P99 latency 84ms).

## Route: /developer/assets
"Asset & Account Management" — tabbed (Overview / Business Assets / OAuth & Tokens) static reference on managing Business Managers, Ad Accounts, and Pages via the Business Asset API.

## Route: /developer/leads
"Lead Capture & Retrieval" — tabbed (Overview / Webhooks / Retrieval / Forms API) static reference on lead webhooks, Graph API retrieval, and LeadGen form management.

## Route: /developer/pixel-capi
"CAPI Intelligence Hub" — tabbed (Architecture / CRM Workflows / Advertiser Setup / Developer Guide / Payload Spec) static reference on the hybrid Pixel + server-side Conversions API tracking bridge, including offline-conversion (Won/Closed) tracking.

## Route: /developer/ads
"Advanced Ad Operations" — tabbed (Duplication / Auto-Rules / Creatives / Intelligence) static reference on campaign duplication, automation rules, creative library management, and delivery-estimate monitoring.

## Route: /developer/audiences
"Audience Intelligence" — tabbed (Custom Audiences / Lookalikes / CRM Sync / Insights) static reference on building and syncing retargeting audiences with Meta.

## Route: /developer/security
"Security & Compliance" — tabbed (PII Hashing / Token Security / GDPR/CCPA) static reference: SHA-256 PII hashing code sample, at-rest token encryption notes (AES-256-GCM), and GDPR/CCPA compliance badges. Sidebar "Security Alerts" list (token-leakage warning, IP whitelisting note, SSL-pinning reminder) and hardcoded audit stats (Hashing Accuracy 100%, Threat Blocking Active).

## Route: /developer/automations-guide
Email & marketing-automation guide — tabs for "admin" vs "user" perspective (`TabsTrigger value="admin"|"user"`), covering global email infrastructure and drip-sequence/CAPI-attribution automation setup.

## Route: /developer/report
"Meta API Verification" — an implementation-status report page (title only inspected in this pass; likely a static audit table of implemented vs. target Graph API endpoints per the "API Verification Report" link description on Getting Started).

## Notes
- No dedicated `components/developer` folder — every page is self-contained, built from `src/components/ui/*` (Card, Badge, Tabs, Button) with local `copyToClipboard()` helpers using `navigator.clipboard` + `sonner` toast.
- Because none of these pages fetch data, "status" fields, percentages, and benchmark numbers shown throughout (uptime, latency, hashing accuracy) are hardcoded UI content, not live metrics.

See also: `../features/developer_tools.md`.
