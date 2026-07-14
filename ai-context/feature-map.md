---
type: feature-map
generatedAt: 2026-07-04
---

# Feature Map — LeadBajaar Frontend

Human-readable index of every discovered feature, its routes, access rules, and linked docs. For the machine-readable version, see [manifest.json](manifest.json). For navigation help, start at [index.md](index.md).

Legend — **Status**: `active` (fully wired, works as built) · `partial` (wired but has a confirmed bug or a broken sub-path) · `placeholder` (routes/UI exist, no real backing logic) · **Roles/Types**: `all` means no restriction found in `src/components/sidebar.tsx`.

## Core (all users)

| Feature | Routes | Roles | Types | Plan key | Status | Doc |
|---|---|---|---|---|---|---|
| Authentication & Onboarding | /signin, /register, /forgot-password, /reset-password, /setup-account | all | all | — | active | [features/authentication.md](features/authentication.md) |
| Dashboard | /dashboard | all | all | `dashboard` | active | [features/dashboard.md](features/dashboard.md) |
| Leads (CRM) | /leads, /leads/[id] | all | all | `leads` | active | [features/leads.md](features/leads.md) |
| Live Chat | /live-chat, /evolution/inbox | all | all | `live_chat` | **partial** — real-time push disabled on /live-chat | [features/live_chat.md](features/live_chat.md) |
| Meetings & Scheduling | /meetings, /meetings/event-types(+[id]), /book/[eventTypeId] (public), /[username]/[eventSlug] (public) | all | all | `meetings` | active | [features/meetings.md](features/meetings.md) |
| Account Settings | /settings | all | all | `account_settings` | active | [features/account_settings.md](features/account_settings.md) |

## Growth & Automation (Admin/Manager+, agency/individual/super_admin)

| Feature | Routes | Roles | Types | Plan key | Status | Doc |
|---|---|---|---|---|---|---|
| Chatbot Flow Builder | /chatbot(+builder), /evolution/chatbot(+builder) | Super Admin, Admin, Manager | agency, super_admin, individual | `chatbot` | **partial** — save/toggle/duplicate likely broken (service mismatch) | [features/chatbot.md](features/chatbot.md) |
| WhatsApp Bot | /whatsapp-bot(+builder) | Super Admin, Admin | agency, super_admin, individual | `whatsapp_bot` | active | [features/whatsapp_bot.md](features/whatsapp_bot.md) |
| Automations | /automations | Super Admin, Admin | agency, super_admin, individual | `automations` | active | [features/automations.md](features/automations.md) |
| Analytics | /analytics | Super Admin, Admin, Manager | agency, super_admin, individual | `analytics` | active | [features/analytics.md](features/analytics.md) |
| Agency Client Management | /agency | Super Admin, Admin | agency, super_admin | `agency_management` | active | [features/agency_management.md](features/agency_management.md) |

## Integrations & Marketing

| Feature | Routes | Roles | Types | Plan key | Status | Doc |
|---|---|---|---|---|---|---|
| Integrations Hub | /integrations + 7 sub-routes (whatsapp, evolution, facebook-auth, facebook-lead-forms, meta-capi, webhooks, email-marketing) | Super Admin, Admin, Manager | agency, super_admin, individual | `integrations` | active | [features/integrations.md](features/integrations.md) |
| LB Forms | /lb-forms(+new, [id], [id]/submissions) | Super Admin, Admin, Manager | agency, super_admin, individual | `integrations` | active | [features/lb_forms.md](features/lb_forms.md) |
| Meta Ads Management | /ads/campaigns, /ads/performance | none found | none found | — | **partial** — orphan routes, not linked in-app | [features/ads.md](features/ads.md) |

## Organization

| Feature | Routes | Roles | Types | Plan key | Status | Doc |
|---|---|---|---|---|---|---|
| Team Management | /team | Super Admin, Admin | all | `team_management` | **partial** | [features/team_management.md](features/team_management.md) |

## Platform Control (Super Admin only)

| Feature | Routes | Roles | Types | Plan key | Status | Doc |
|---|---|---|---|---|---|---|
| Super Admin Platform Control | /admin, /admin/payments | Super Admin | super_admin | `system_admin` | active | [features/system_admin.md](features/system_admin.md) |
| Email Infrastructure Monitoring | /admin/emails | Super Admin | super_admin | `email_logs` | active | [features/email_logs.md](features/email_logs.md) |
| Application Error Monitoring | /admin/errors | Super Admin | super_admin | `error_logs` | active | [features/error_logs.md](features/error_logs.md) |
| Finance Module | /admin/finance + 8 sub-routes | Super Admin | super_admin | `finance_module` | active | [features/finance_module.md](features/finance_module.md) |
| Developer Hub | /developer + 9 sub-routes | Super Admin, Admin | all | `developer_tools` | **placeholder** — static docs, no API calls | [features/developer_tools.md](features/developer_tools.md) |

## Cross-cutting layers (not routable features, but everything above depends on them)

| Layer | Doc |
|---|---|
| App shell (root + dashboard layout, sidebar nav) | [pages/app-shell-layout.md](pages/app-shell-layout.md), [components/sidebar.md](components/sidebar.md) |
| Identity/access state (`UserContext`) | [state/user-context.md](state/user-context.md) |
| Global error boundary state (`ErrorContext`) | [state/error-context.md](state/error-context.md) |
| WhatsApp session state (`WhatsAppContext`) | [state/whatsapp-context.md](state/whatsapp-context.md) |
| Shared hooks (`use-toast`, `use-debounce`, `use-media-query`, Echo) | [hooks/custom-hooks.md](hooks/custom-hooks.md) |
| shadcn/Radix UI primitives catalog | [components/ui-primitives.md](components/ui-primitives.md) |

## Flows (end-to-end, cross-feature)

| Flow | Features involved | Doc |
|---|---|---|
| Authentication & onboarding | authentication, team_management, dashboard | [flows/authentication-and-onboarding.md](flows/authentication-and-onboarding.md) |
| Super Admin impersonation | authentication, dashboard | [flows/impersonation.md](flows/impersonation.md) |
| Lead lifecycle | leads | [flows/lead-lifecycle.md](flows/lead-lifecycle.md) |
| Real-time messaging | live_chat | [flows/realtime-messaging.md](flows/realtime-messaging.md) |
| Chatbot flow builder | chatbot, whatsapp_bot | [flows/chatbot-flow-builder.md](flows/chatbot-flow-builder.md) |
| Chatbot automation execution | chatbot, whatsapp_bot | [flows/chatbot-automation-execution.md](flows/chatbot-automation-execution.md) |
| Facebook Lead Ads sync | integrations | [flows/facebook-lead-ads-sync.md](flows/facebook-lead-ads-sync.md) |
| Meta Conversions API tracking | integrations | [flows/meta-conversions-api-tracking.md](flows/meta-conversions-api-tracking.md) |
| WhatsApp integration setup | integrations | [flows/whatsapp-integration-setup.md](flows/whatsapp-integration-setup.md) |
| Public meeting scheduling | meetings | [flows/meeting-scheduling-public-flow.md](flows/meeting-scheduling-public-flow.md) |
| Google Calendar sync | meetings | [flows/google-calendar-sync.md](flows/google-calendar-sync.md) |
| Agency client management | agency_management | [flows/agency-client-management.md](flows/agency-client-management.md) |
| Finance operations | finance_module | [flows/finance-operations.md](flows/finance-operations.md) |
| Super Admin governance | system_admin, email_logs, error_logs | [flows/super-admin-governance.md](flows/super-admin-governance.md) |

## Known issues surfaced during generation

These were found by reading the actual code while documenting it (not from a bug tracker) — verify before relying on them, but treat as high-signal:

1. **`register()`** in `src/lib/api.ts` stores a literal placeholder string as the auth token instead of the real one returned by the server.
2. **Chatbot save/toggle/duplicate are likely broken** — the UI calls methods that exist only on an unused sibling service file (`chatbot-service.ts`); the actually-imported `chatbot.ts` doesn't export them, and `next.config.ts` has `typescript.ignoreBuildErrors: true` so this ships unnoticed.
3. **`/live-chat` has no working real-time transport** — the Echo/Pusher listener is written but its invocation is commented out, and there's no polling fallback. `/evolution/inbox` only works via polling.
4. **Two disconnected Google Calendar integrations** — the working one is `googleIntegrationApi` (via the Integrations feature); a second, dead implementation under `src/app/api/calendar/*` depends on `next-auth` sessions that don't exist anywhere in this repo.
5. **`financeApi.getSalaryHistory`** is called by `admin/finance/employees/page.tsx` but doesn't exist on the exported object (only `getEmployeeSalaryHistory` does).
6. **`/ads/campaigns` and `/ads/performance`** are orphan routes — no sidebar entry or in-app link reaches them.
7. Several component directories are dead/unused: `src/components/leads/*`, `src/components/chat/*`, `src/components/automated-sync/*` — see their component docs for specifics.

See `manifest.json`'s `knownIssues` array for the machine-readable version.
