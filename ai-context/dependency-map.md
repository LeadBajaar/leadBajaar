---
type: dependency-map
generatedAt: 2026-07-04
sourceDocs: [pages/*.md, components/*.md, features/*.md, api/*.md, state/*.md, flows/*.md]
---

# Dependency Map — LeadBajaar Frontend

Cross-cutting dependency graphs derived from the docs in this folder (not a fresh code read): [pages/](pages/) "Data/API calls" sections, [components/](components/) service usage notes, [features/](features/) summaries, and [state/](state/) consumer notes. Where a source doc was ambiguous or made a guess, this file states the more confident cross-cluster finding and corrects the source doc (see the whatsapp-context correction below as an example of that process).

Companion docs: [feature-map.md](feature-map.md) (feature access/status), [manifest.json](manifest.json) (machine-readable index), [ai-rules.md](ai-rules.md) (maintenance rules — the same incremental-update rules apply here: touch only the sections affected by a code change, don't regenerate the whole file).

Edge style key used throughout: **solid** = normal call through the documented client (`src/lib/api.ts`, a dedicated service file). **dashed** = bypass/raw call (raw `fetch`/`axios`/`api.get` instead of the conventional wrapper) or a confirmed-broken/dead reference. Labels on dashed edges say why.

---

## 1. Page → API Dependencies

Grouped into the same six clusters used to generate this folder, since each cluster's pages call a coherent subset of API groups. Node labels use `:param` instead of `[param]` for dynamic segments (Mermaid reserves square brackets).

### 1a. Auth, Shell, Account, Team, Dashboard

```mermaid
flowchart LR
    signin["/signin"] -->|login| auth_api[api/auth]
    register["/register"] -->|"register (stores placeholder token, bug)"| auth_api
    forgot["/forgot-password"] -->|forgotPassword| auth_api
    resetpw["/reset-password"] -->|resetPassword| auth_api
    setup["/setup-account"] --> team_api[api/team]
    shell["app shell layout"] -->|"getUser via UserProvider"| auth_api
    dash["/dashboard"] -->|getDashboardStats| dash_api[api/dashboard-analytics]
    dash -->|submitTesterRequest| auth_api
    settings["/settings"] -->|subscriptionApi.getSettings| sub_api[api/subscription]
    settings -.->|"raw api.put/post, bypasses subscriptionApi"| sub_api
    team["/team"] --> team_api
    unauthorized["/unauthorized"] -.->|none| none1[no API calls]
```

### 1b. Leads & Live Chat

```mermaid
flowchart LR
    leads["/leads"] --> leads_api[api/leads]
    leads --> team_api[api/team]
    leads -->|"broadcast, WA accounts, FB lead-form sync - called directly, cross-feature"| integ_api[api/integrations]
    leadsdetail["/leads/:id"] --> leads_api
    leadsdetail --> team_api
    livechat["/live-chat"] --> chat_api[api/chat-messaging]
    livechat -.->|"me() used only inside disabled realtime listener"| auth_api[api/auth]
    evoinbox["/evolution/inbox"] --> evo_api[api/evolution]
```

### 1c. Chatbot Builders & WhatsApp Bot

```mermaid
flowchart LR
    chatbot["/chatbot"] -->|"getFlows/deleteFlow (toggle/duplicate missing, bug)"| cbot_api[api/chatbot]
    chatbotbuilder["/chatbot/builder/:flowId"] --> cbot_api
    evochatbot["/evolution/chatbot"] --> cbot_api
    evochatbotbuilder["/evolution/chatbot/builder/:flowId"] --> cbot_api
    wbot["/whatsapp-bot"] -.->|"raw axios to WHATSAPP_BASE_URL, not a shared client"| wbot_ext[WhatsApp Bridge Node.js]
    wbotbuilder["/whatsapp-bot/builder"] -.->|"raw fetch to WHATSAPP_BASE_URL"| wbot_ext
    wbotbuilder -.->|"R2 image upload via Laravel api"| auth_api2[api/auth base client]
```

### 1d. Integrations, LB Forms, Ads

```mermaid
flowchart LR
    hub["/integrations"] --> integ_api[api/integrations]
    fbauth["/integrations/facebook-auth"] --> integ_api
    fbauth -.->|"child component calls api.get('/meta/status') directly"| integ_api
    fblf["/integrations/facebook-lead-forms"] --> integ_api
    metacapi["/integrations/meta-capi"] --> integ_api
    webhooks["/integrations/webhooks"] --> integ_api
    emailmkt["/integrations/email-marketing"] --> integ_api
    wac["/integrations/whatsapp"] --> integ_api
    wac -.->|"companyApi welcome-settings, dead code"| company_api[api/company]
    evoint["/integrations/evolution"] --> integ_api
    evoint --> evo_api[api/evolution]
    lbforms["/lb-forms"] --> integ_api
    lbformsnew["/lb-forms/new"] --> integ_api
    lbformsdetail["/lb-forms/:id"] -.->|"raw fetch, bypasses integrationApi"| laravel_ext[Laravel API direct fetch]
    lbformssubs["/lb-forms/:id/submissions"] -.->|"raw fetch, bypasses integrationApi"| laravel_ext
    adscamp["/ads/campaigns"] -.->|"local apiGet/apiPost helpers, bypasses integrationApi"| laravel_ext
    adsperf["/ads/performance"] -.->|"local apiGet helper, bypasses integrationApi"| laravel_ext
```

### 1e. Meetings, Scheduling, Automations

```mermaid
flowchart LR
    meetings["/meetings"] --> booking_api[api/calendar-scheduling]
    meetings --> team_api[api/team]
    metypes["/meetings/event-types"] --> booking_api
    metypes -.->|"Connect Google Calendar leads to a dead /api/auth/google link"| deadlink[dead route]
    metypedetail["/meetings/event-types/:id"] --> booking_api
    bookpublic["/book/:eventTypeId"] -.->|"raw fetch, no auth header, public page"| laravel_ext[Laravel API direct fetch]
    bookuser["/:username/:eventSlug"] -.->|"raw fetch, no auth header, public page"| laravel_ext
    automations["/automations"] -.->|"raw api.* calls, no dedicated service"| auto_ext[no dedicated api group]
```

### 1f. Agency, Analytics, Admin, Finance, Developer

```mermaid
flowchart LR
    agency["/agency"] --> agency_api[api/agency]
    analytics["/analytics"] --> dash_api[api/dashboard-analytics]
    admindash["/admin"] --> admin_api[api/admin]
    admindash --> integ_api[api/integrations]
    adminpay["/admin/payments"] --> admin_api
    adminemails["/admin/emails"] --> admin_api
    adminerrors["/admin/errors"] -.->|"raw api.get('/errors'), no dedicated function"| admin_api
    adminfinance["/admin/finance/* 8 routes"] --> finance_api[api/finance]
    adminfinance -.->|"employees page calls getSalaryHistory, missing on financeApi, bug"| finance_api
    devhub["/developer/* 10 routes"] -.->|"zero API calls, static docs only"| none2[no API calls]
```

---

## 2. Component → Service Dependencies

Only components confirmed to make their own API/service calls are shown with solid/dashed edges to a target; purely presentational component groups (props-driven, no own data fetching) are grouped under "presentational only."

```mermaid
flowchart LR
    subgraph Presentational only
        leadsC[components/leads - unused placeholder kit]
        reactflowC[components/reactflow]
        sharedC[components/shared]
        uiC[components/ui-primitives]
        integrationsC[components/integrations dialogs]
    end

    chatbotC[components/chatbot] -->|"chatbotService.getFlow/saveFlow"| cbot_api[api/chatbot]
    chatbotC -->|"getWhatsAppAccounts, template picker"| integ_api[api/integrations]

    chatC[components/chat] -.->|"imports wsService, export does not exist, would throw if mounted"| ws_dead[websocket-service.ts, commented out]

    whatsappbotC[components/whatsapp-bot] -.->|"raw axios, own client"| wbot_ext[WhatsApp Bridge Node.js]

    metacapiC[components/meta-capi] -->|"getConversionApiConfiguration, sendTestConversionEvent, sendBatchConversionEvents, createMetaPixel, getMetaPixelRoiSummary"| integ_api

    fboauthC[components/facebook-oauth] -->|"dozens of getMeta*/createMeta*/updateMeta*"| integ_api
    fboauthC -.->|"api.get('/meta/status') directly, bypasses integrationApi"| integ_api

    automationsC[components/automations - GlobalAutomationsSettings] -->|"integrationApi.getWhatsAppAccounts"| integ_api
    automationsC -->|"companyApi.getSettings/updateSettings"| company_api[api/company]

    autosyncC[components/automated-sync] -.->|"real api.get/api.post calls are commented out, mock data only"| mock[mock data, not wired]

    integrationsC -->|"GoogleAccountCard: getStatus/getConnectUrl/disconnect"| google_api[googleIntegrationApi]

    sidebarC[components/sidebar] -->|"getConnectedIntegrations, nav visibility toggles"| integ_api
```

---

## 3. Feature → Feature Dependencies

Edges represent a real, evidenced coupling (shared data, a direct cross-feature API call, or a UI action that jumps into another feature) — not just "both under Platform Control" groupings. See [feature-map.md](feature-map.md) for the plain access-control table.

```mermaid
flowchart TD
    auth[authentication] --> dash[dashboard]
    auth --> team[team_management]

    dash --> leads[leads]
    dash -.->|"overlapping stats surface, separate endpoints"| analytics[analytics]

    leads --> chat[live_chat]
    leads -->|"Facebook Lead Ads sync + WhatsApp broadcast, called directly from Leads page"| integ[integrations]
    leads -->|"lead_created / stage_changed triggers"| auto[automations]

    chat -->|"requires a connected WhatsApp Cloud or Evolution integration"| integ

    cbot[chatbot] -->|"loads WhatsApp Business templates"| integ

    auto -->|"cloud_api / evolution WhatsApp send steps"| integ
    auto -->|"personal-provider WhatsApp send steps"| wbot[whatsapp_bot]

    wbot -.->|"bundles its own live chat and session mgmt, parallel to Live Chat, no shared code"| chat

    meet[meetings] --> team
    meet -.->|"Google Calendar connect, partially dead path"| integ

    agency[agency_management] -->|"one-click impersonation opens client's dashboard"| dash
    agency --> sysadmin[system_admin]
    agency -->|"subscription renewal shares the billing/plan model"| acct[account_settings]

    analytics --> leads

    acct -->|"Razorpay subscription plan, same plan model Admin manages in Finance"| sysadmin

    sysadmin --> emaillogs[email_logs]
    sysadmin --> errlogs[error_logs]
    sysadmin --> finance[finance_module]

    ads[ads] -.->|"shares the same Meta OAuth session, orphan route otherwise"| integ

    lbforms[lb_forms] -->|"same plan feature key integrations, nav-grouped together"| integ

    devtools[developer_tools] -.->|"documents Meta/Pixel/CAPI setup, no live call"| integ
```

---

## 4. Context → Feature Dependencies

```mermaid
flowchart LR
    UserContext -->|"role/type/plan gating via hasRole/hasType/hasPlan/hasFeature, every sidebar-visible route"| ALL[all 20 sidebar-gated features]
    UserContext -->|"user.company object, crash risk if rendered directly, see gotcha"| acct[account_settings]
    UserContext -->|"impersonation state admin_token drives Return-to-Admin banner"| agency[agency_management]

    ErrorContext -->|"mounted app-wide in root layout, wraps public and protected routes alike"| GLOBAL[entire app, global error dialog]
    ErrorContext -.->|"listens for window app-global-error events, the actual trigger, not direct page calls"| globalHandler[src/lib/globalErrorHandler.ts]

    WhatsAppContext -->|"session list, chatbot flow rules, live chat, broadcast, confirmed consumer"| wbot[whatsapp_bot]
    WhatsAppContext -.->|"NOT consumed by /live-chat or /evolution/inbox, despite the name"| chat[live_chat]
```

Note: the `live_chat` edge from `WhatsAppContext` is drawn dashed specifically to record a **non**-dependency — the original per-cluster doc guessed this context backed Live Chat; cross-checking against the Chatbot/WhatsApp Bot cluster's findings corrected it to `whatsapp_bot`. Kept here so the correction isn't lost on a future regeneration pass. See [state/whatsapp-context.md](state/whatsapp-context.md).

---

## 5. External Integrations

Every external system this frontend talks to, and which internal layer owns the call.

```mermaid
flowchart LR
    subgraph External services
        laravel[("Laravel backend, api.leadbajaar.com/api")]
        wabridge[("WhatsApp Bridge Node.js, wp.leadbajaar.com/api")]
        meta[("Meta / Facebook Graph API, proxied through Laravel")]
        googlecal[("Google Calendar / OAuth, googleapis")]
        razorpay[("Razorpay, subscription payments")]
        r2[("Cloudflare R2, avatar/media storage, via Laravel")]
        pusher[("Pusher / Laravel Echo, real-time transport")]
    end

    api_lib["src/lib/api.ts, api and httpClient"] --> laravel
    integ_api2["api/integrations, integrationApi"] -->|"proxied Meta OAuth + CAPI + Lead Ads"| meta
    integ_api2 --> laravel
    evo_api2["api/evolution, evolutionApi"] -->|"proxied Evolution WhatsApp instance mgmt"| laravel
    google_api2[googleIntegrationApi] -->|"OAuth connect/status/disconnect"| laravel
    laravel -.->|"backend-side only, not called directly from frontend"| googlecal
    calendar_dead["src/lib/services/calendar.ts, dead code"] -.->|"direct googleapis calls, unreachable, depends on non-existent next-auth session"| googlecal
    sub_api2["api/subscription + raw settings-page calls"] --> laravel
    laravel -.->|"backend-side only"| razorpay
    wbot_pages["/whatsapp-bot, /whatsapp-bot/builder, WhatsAppContext"] -->|"raw axios, separate auth scheme"| wabridge
    settings_page["/settings avatar upload"] -->|"api.post storage/r2/upload-image"| laravel
    laravel -.->|"backend-side only"| r2
    livechat_page["/live-chat Echo listener, disabled"] -.->|"never invoked, no real-time push currently active"| pusher
    evoinbox_page["/evolution/inbox"] -.->|"polling only, no push"| laravel
```

**Reading this diagram**: the frontend only ever talks to two hosts directly — the Laravel backend (`API_BASE_URL`) for almost everything, and the standalone WhatsApp Bridge (`WHATSAPP_BASE_URL`) for the `/whatsapp-bot` feature and `WhatsAppContext`. Meta, Google, Razorpay, and Cloudflare R2 are all reached **through** the Laravel backend (server-to-server) — the frontend never calls them directly, except for the confirmed-dead `src/lib/services/calendar.ts` path, which would call `googleapis` directly if it were ever reachable (it isn't — see [flows/google-calendar-sync.md](flows/google-calendar-sync.md)). Pusher/Laravel Echo is wired into the frontend (`src/services/websocket-service.ts`, `src/hooks/echo.js`) but its invocation on `/live-chat` is commented out, so no real-time channel is actually open anywhere in the app today.

---

## Maintaining this file incrementally

Follow [ai-rules.md](ai-rules.md)'s general rules, plus these specific to dependency graphs:

- **New page added**: add one edge in the relevant §1 cluster diagram (or a new cluster subsection if it doesn't fit an existing one).
- **New component added**: add one edge (or a "presentational only" membership) in §2.
- **New cross-feature call added** (a page/component in feature A calling an API group primarily owned by feature B): add/update the edge in §3 — that's the signal this graph exists to capture.
- **A context gains/loses a consumer**: update §4. If you find another mismatch between a state doc's `usedByFeatures` frontmatter and what a different cluster's docs actually show, fix the frontmatter at the source (`state/*.md`) the same way the `WhatsAppContext` correction was made here, don't just patch this file.
- **A new external host is introduced**: add it to §5's subgraph and note whether the frontend calls it directly or only the backend does — that distinction is the main thing an agent needs before writing code that assumes a direct integration.
- Re-render (mentally or via a Mermaid live editor) after editing — a diagram with a dangling or duplicate node ID fails silently in some renderers.
