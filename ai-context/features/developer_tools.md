---
type: feature
slug: developer_tools
name: Developer Hub (Meta API Documentation Suite)
status: placeholder
roles: [Super Admin, Admin]
userTypes: []
planFeatureKey: developer_tools
routes: ["/developer", "/developer/getting-started", "/developer/assets", "/developer/leads", "/developer/pixel-capi", "/developer/ads", "/developer/audiences", "/developer/security", "/developer/automations-guide", "/developer/report"]
relatedDocs:
  pages: [developer-hub]
  components: []
  api: []
  flows: []
---
# Feature: Developer Hub (Meta API Documentation Suite)

## Summary
A static, in-app documentation/reference console aimed at technical users integrating with Meta (Facebook/Instagram Ads) APIs from inside LeadBajaar: asset & account management, lead capture/webhooks, Pixel + Conversions API (CAPI) tracking, ad operations (duplication/rules/creatives), audience sync, security/compliance (PII hashing, token storage, GDPR), and an implementation-status report. It reads as marketing/reference content with code snippets and copy-to-clipboard buttons rather than an interactive tool that calls backend endpoints.

## Access control
- Only the index page `/developer` is wrapped in `RoleGuard allowedFeatures={['developer_tools']}` (`src/app/(dashboard)/developer/page.tsx`). **None of the 9 sub-pages** (`getting-started`, `assets`, `leads`, `pixel-capi`, `ads`, `audiences`, `security`, `automations-guide`, `report`) import `RoleGuard` — they render for any authenticated user who navigates directly to the URL, protected only by the outer `(dashboard)` layout's general auth check and the sidebar hiding the "Dev Hub" link.
- Sidebar entry "Dev Hub" (`src/components/sidebar.tsx` line ~67): `roles: ['Super Admin','Admin']`, `feature: 'developer_tools'` — notably **no `types` restriction**, so it can appear for Admin-role users across `individual`/`agency`/`super_admin` account types provided their plan grants the `developer_tools` feature key.
- Two sub-pages (`/developer/pixel-capi`, `/developer/ads`) are additionally filtered out of the index page's feature grid at build/runtime via `process.env.NEXT_PUBLIC_FEATURE_PIXELS` / `NEXT_PUBLIC_FEATURE_ADS` flags, but the routes themselves remain reachable directly even when the env flag is off (the flag only hides the card link on `/developer`).

## Key files
- Index: `src/app/(dashboard)/developer/page.tsx`
- Sub-pages: `getting-started/page.tsx`, `assets/page.tsx`, `leads/page.tsx`, `pixel-capi/page.tsx`, `ads/page.tsx`, `audiences/page.tsx`, `security/page.tsx`, `automations-guide/page.tsx`, `report/page.tsx`
- No API calls anywhere in this feature — confirmed no `Api.`/`api.`/`fetch(` usage across the entire `developer/` directory. Every page is purely static JSX (headings, tabs, code blocks, badges) with local `copyToClipboard()` helpers.
- No dedicated `components/developer` folder — all pages build directly from `src/components/ui/*` (Card, Badge, Tabs, Button).

## Notes
- Marked `status: placeholder` because, unlike every other feature in this cluster, it renders zero live data and makes zero network calls — it is reference/marketing documentation embedded in the app shell, not a functional admin tool.
- `report/page.tsx` ("Meta API Verification") and `getting-started/page.tsx` link out to static `.md` files under `/docs/*` (e.g. `META_PIXEL_CAPI_IMPLEMENTATION.md`) via plain `<Link target="_blank">` — those markdown files were not read as part of this pass.
- Actual Meta/Facebook integration wiring (OAuth, webhook config, live ad account data) is a separate, functional feature under `/integrations/*`, owned by another documentation cluster — this Dev Hub is documentation *about* that system, not the system itself.
