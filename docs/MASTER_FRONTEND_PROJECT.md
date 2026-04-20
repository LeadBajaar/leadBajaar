# LeadBajaar Frontend — Master Project Document

> **Last Updated:** April 2026  
> **Status:** Production  
> **Stack:** Next.js 15 + React 19 + TypeScript + TailwindCSS + Radix UI  
> **Dev Mode:** `next dev --turbopack`

---

## 1. Project Overview

The **leadbajaar1.0** repository is the primary web dashboard for the LeadBajaar CRM platform. It is a Next.js 15 App Router application with Turbopack, styled with TailwindCSS and a Radix UI / shadcn/ui component system. It consumes the Laravel backend API at `https://api.leadbajaar.com/api`.

---

## 2. Tech Stack & Dependencies

### Core Framework
| Package | Version | Purpose |
|---|---|---|
| `next` | 15.1.11 | App Router, SSR, file-based routing |
| `react` / `react-dom` | 19.2.4 | UI rendering |
| `typescript` | 5.7.3 | Type safety |
| `tailwindcss` | 3.4.1 | Utility-first CSS |
| `tailwindcss-animate` | 1.0.7 | Animation utilities |

### UI Component System (Radix / shadcn)
| Package | Purpose |
|---|---|
| `@radix-ui/react-dialog` | Modals / dialogs |
| `@radix-ui/react-dropdown-menu` | Context menus, dropdowns |
| `@radix-ui/react-select` | Custom selects |
| `@radix-ui/react-tabs` | Tabbed interfaces |
| `@radix-ui/react-popover` | Popovers, date pickers |
| `@radix-ui/react-tooltip` | Tooltips |
| `@radix-ui/react-toast` | Toast notifications |
| `@radix-ui/react-accordion` | Expandable sections |
| `@radix-ui/react-checkbox` | Checkboxes |
| `@radix-ui/react-switch` | Toggle switches |
| `@radix-ui/react-radio-group` | Radio buttons |
| `@radix-ui/react-scroll-area` | Custom scrollbars |
| `@radix-ui/react-avatar` | User avatars |
| `@radix-ui/react-label` | Form labels |
| `@radix-ui/react-separator` | Dividers |
| `@radix-ui/react-slot` | Composable slot pattern |

### Data & Integrations
| Package | Purpose |
|---|---|
| `axios` | HTTP client for API calls |
| `recharts` | Charts and data visualization |
| `@xyflow/react` | Visual flow builder (chatbot) |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag-and-drop (pipeline stages) |
| `react-day-picker` | Calendar / date picker |
| `date-fns` + `date-fns-tz` | Date formatting & timezone handling |
| `react-hook-form` | Form state management |
| `googleapis` | Google Calendar integration |
| `laravel-echo` + `pusher-js` | Real-time WebSocket events |
| `next-auth` | Authentication (OAuth support) |
| `next-themes` | Dark/light mode toggle |
| `lucide-react` | Icon library |
| `sonner` | Toast notifications (alternative) |
| `class-variance-authority` + `clsx` + `tailwind-merge` | Conditional class composition |

---

## 3. Architecture & Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root HTML layout
│   ├── page.tsx                  # Landing redirect
│   ├── globals.css               # Global CSS + Tailwind imports
│   ├── echo.js                   # Laravel Echo WebSocket config
│   ├── signin/                   # Login page
│   ├── register/                 # Registration page
│   ├── setup-account/            # Team invitation account setup
│   ├── book/                     # Public booking pages
│   │   └── [eventTypeId]/        # Dynamic public booking page
│   ├── api/                      # Next.js API routes (proxy)
│   │   ├── bookings/             # Booking API proxy
│   │   ├── calendar/             # Calendar API proxy
│   │   ├── chat/                 # Chat API proxy
│   │   ├── chatbot/              # Chatbot API proxy
│   │   ├── event-types/          # Event type API proxy
│   │   ├── integrations/         # Integration API proxy
│   │   └── templates/            # Templates API proxy
│   └── (dashboard)/              # Authenticated dashboard layout group
│       ├── layout.tsx            # Sidebar + header wrapper
│       ├── dashboard/            # Main dashboard page
│       ├── leads/                # Lead management (CRM core)
│       ├── live-chat/            # WhatsApp live chat
│       ├── chatbot/              # Chatbot flow builder
│       │   ├── page.tsx          # Flow list
│       │   └── builder/          # Visual flow editor
│       ├── meetings/             # Meeting management
│       │   ├── page.tsx          # Bookings list + calendar
│       │   └── event-types/      # Event type configuration
│       ├── integrations/         # Integration hub
│       │   ├── page.tsx          # Main integrations page
│       │   └── whatsapp/         # WhatsApp template management
│       ├── analytics/            # Advanced analytics dashboard
│       ├── settings/             # User/company settings
│       ├── team/                 # Team member management
│       ├── agency/               # Agency client management
│       ├── admin/                # Super Admin portal
│       │   ├── page.tsx          # Company/user/billing management
│       │   └── errors/           # Error monitoring dashboard
│       └── developer/            # Developer Hub (Meta Platform)
│           ├── page.tsx          # Dev hub home
│           ├── getting-started/  # Setup guides
│           ├── leads/            # Lead form management
│           ├── ads/              # Meta Ads Manager
│           ├── audiences/        # Custom/Lookalike audiences
│           ├── pixel-capi/       # Pixel & CAPI management
│           ├── assets/           # Media asset upload
│           ├── report/           # Performance reports
│           └── security/         # Security settings
│
├── components/                   # Reusable React components
│   ├── ui/                       # 34 shadcn/ui base components
│   ├── shared/                   # Confirmation modals
│   ├── sidebar.tsx               # Main navigation sidebar
│   ├── header.tsx                # Top header bar
│   ├── notification-bell.tsx     # Notification dropdown
│   ├── RoleGuard.tsx             # Role/type/plan access control
│   ├── leads-content.tsx         # Lead grid content
│   ├── recent-leads.tsx          # Recent leads widget
│   ├── overview.tsx              # Dashboard overview chart
│   ├── mode-toggle.tsx           # Dark/light theme toggle
│   ├── theme-provider.tsx        # next-themes provider
│   ├── icons.tsx                 # Custom SVG icons
│   ├── chat/                     # Chat UI components
│   │   ├── chat-message.tsx      # Individual message bubble
│   │   └── chat-window.tsx       # Chat conversation window
│   ├── chatbot/                  # Chatbot builder
│   │   └── flow-builder.tsx      # Visual drag-drop flow editor (36KB)
│   ├── reactflow/                # ReactFlow custom nodes
│   │   ├── MessageNode.tsx       # Message node
│   │   ├── ButtonNode.tsx        # Button node
│   │   ├── ConditionNode.tsx     # Condition/branch node
│   │   ├── InputNode.tsx         # User input node
│   │   ├── ApiNode.tsx           # API call node
│   │   ├── FunctionNode.tsx      # Function node
│   │   └── FlowNode.tsx          # Base flow node
│   ├── automated-sync/           # Lead sync dashboard
│   │   └── AutomatedSyncDashboard.tsx
│   ├── facebook-oauth/           # Meta/Facebook integration UIs
│   │   ├── FacebookDashboard.tsx         # Full-featured ads dashboard (189KB!)
│   │   ├── FacebookOAuthButton.tsx       # OAuth connect button
│   │   ├── FacebookServicesManager.tsx   # Service connections
│   │   ├── FacebookConversionApiManager.tsx # CAPI config
│   │   ├── ConversionApiTester.tsx       # CAPI event tester
│   │   ├── PixelTestConsole.tsx          # Pixel debug console (37KB)
│   │   ├── CreatePixelModal.tsx          # Create pixel modal
│   │   ├── LeadConversionTracker.tsx     # Lead → conversion flow
│   │   ├── RoiDashboard.tsx             # ROI analytics
│   │   └── WebhookVerificationDialog.tsx # Webhook setup wizard
│   └── integrations/
│       └── WebhookConfigDialog.tsx       # External webhook setup
│
├── contexts/                     # React Context providers
│   ├── UserContext.tsx            # User auth, role, type, plan
│   └── ErrorContext.tsx           # Global error modal system
│
├── hooks/                        # Custom React hooks
│   ├── echo.js                   # Laravel Echo hook
│   ├── use-debounce.ts           # Debounce hook
│   ├── use-media-query.ts        # Responsive breakpoint hook
│   └── use-toast.ts              # Toast notification hook
│
├── lib/                          # Core library utilities
│   ├── api.ts                    # API client (56KB — ALL API calls)
│   ├── auth.ts                   # Session management (localStorage)
│   ├── axios.js                  # Axios instance factory
│   ├── globalErrorHandler.ts     # Window-level crash handler
│   ├── theme.ts                  # Theme configuration
│   ├── utils.ts                  # cn() class merge utility
│   ├── data/                     # Static data/constants
│   ├── services/                 # Service layer
│   ├── types/                    # Shared type exports
│   ├── utils/                    # Additional utilities
│   └── validations/              # Form validation schemas
│
├── services/                     # Domain-specific services
│   ├── chatbot-service.ts        # Chatbot API service
│   ├── chatbot.ts                # Chatbot business logic
│   ├── event-types.ts            # Event type service
│   └── websocket-service.ts      # WebSocket connection manager
│
├── types/                        # TypeScript type definitions
│   ├── calendar.ts               # Calendar types
│   ├── events.ts                 # Event types
│   ├── nodes.ts                  # Chatbot node types
│   └── next-auth.d.ts            # NextAuth type augmentation
│
├── utils/                        # Utility functions
│   ├── errorParser.ts            # Parse API errors
│   ├── handleError.ts            # Error handler wrapper
│   ├── logger.ts                 # Client-side logger (posts to backend)
│   └── useErrorHandler.ts        # Error handler hook
│
└── styles/
    └── globals.css               # Additional global styles
```

---

## 4. Page-by-Page Feature Inventory

### 4.1 Authentication Pages
| Page | Route | Size | Features |
|---|---|---|---|
| Sign In | `/signin` | - | Email/password login, token storage, redirect to dashboard |
| Register | `/register` | - | Name/email/password registration, auto-login |
| Setup Account | `/setup-account` | - | Invitation token flow, set password for invited team members |

### 4.2 Dashboard
| Route | Size | Features |
|---|---|---|
| `/dashboard` | 20KB | KPI cards (leads, meetings, conversion rate, response time), monthly trend chart (Recharts), pipeline funnel, recent activity feed from notifications |

### 4.3 Lead Management (CRM Core)
| Route | Size | Features |
|---|---|---|
| `/leads` | **56KB** | Full-featured lead table with search, multi-filter (status, stage, source, date ranges), pagination, column toggle, inline editing, lead detail drawer, deal value + payment recording, CSV import/export, bulk select (delete, update status, update stage), WhatsApp broadcast sender, custom pipeline stages (drag-drop reorder via dnd-kit), lead notes, contact history |

### 4.4 Live Chat
| Route | Size | Features |
|---|---|---|
| `/live-chat` | 30KB | Conversation list with priority badges (high/medium/low), unread counts, real-time message polling, WhatsApp message sending, chat bubbles with timestamps, read/unread status, integration metadata display |

### 4.5 Chatbot Builder
| Route | Size | Features |
|---|---|---|
| `/chatbot` | 6KB | Chatbot flow list, create/edit/delete flows |
| `/chatbot/builder` | - | Visual flow editor powered by @xyflow/react |
| `flow-builder.tsx` | **37KB** | Full drag-drop canvas with custom nodes: Message, Button, Condition, Input, API, Function. Save/load JSON flows |

### 4.6 Meetings & Bookings
| Route | Size | Features |
|---|---|---|
| `/meetings` | **55KB** | Booking list (upcoming/history), search, reschedule modal, cancel/delete, answer viewer (maps booking responses to questions), event type management with availability windows, custom questions, location options (video/in-person/phone) |
| `/meetings/event-types` | - | Event type CRUD, duration, buffer time, availability schedule |
| `/book/[eventTypeId]` | - | **Public** embeddable booking page — no auth required, calendar date picker, time slot selection, custom question form |

### 4.7 Integrations Hub
| Route | Size | Features |
|---|---|---|
| `/integrations` | **73KB** | Integration marketplace — connect WhatsApp, Facebook Lead Forms, Generic Webhooks. Per-integration: config form, status toggle, log viewer, webhook URL generation. `WebhookConfigDialog` (21KB) for external webhook field mapping |
| `/integrations/whatsapp` | **89KB** | Full WhatsApp template manager — list, create, edit, delete, sync templates from Meta. Template preview with variable substitution. Access token management. Integration status checker with reconnect flow |

### 4.8 Analytics
| Route | Size | Features |
|---|---|---|
| `/analytics` | 28KB | 12-month lead trends (bar chart), conversion rate vs target (line chart), lead source distribution (pie chart), pipeline funnel, weekly activity (emails/meetings/calls), deal value distribution, top performers leaderboard |

### 4.9 Settings
| Route | Size | Features |
|---|---|---|
| `/settings` | 21KB | Profile editor (name, email, password, avatar), company settings |

### 4.10 Team Management
| Route | Size | Features |
|---|---|---|
| `/team` | - | Member list, invite by email, role assignment (Admin/Manager/Agent), remove member |

### 4.11 Agency Portal
| Route | Size | Features |
|---|---|---|
| `/agency` | 28KB | Client company list with lead counts, onboard new client (create company + user), impersonate client ("Login As"), renew subscription, subscription history, agency stats (total clients, leads managed) |

### 4.12 Super Admin Portal
| Route | Size | Features |
|---|---|---|
| `/admin` | **130KB** | Complete platform admin: Company table (search, filter by plan/status/expiration/date ranges), user table (search, filter by role/status/type/tags), billing audit trail, plan management (edit pricing/features), subscription renewal (custom days), tag management, login as any user, company/user CRUD, MRR calculation, platform metrics |
| `/admin/errors` | - | Client error log viewer with filtering |

### 4.13 Developer Hub (Meta Platform)
| Route | Size | Features |
|---|---|---|
| `/developer` | 14KB | Hub homepage — card-based navigation to sub-sections |
| `/developer/getting-started` | 14KB | Meta integration setup wizard |
| `/developer/leads` | - | Facebook lead form management, sync forms, view leads |
| `/developer/ads` | 16KB | Meta Ads Manager — campaigns, ad sets, ads CRUD, status toggle, insights |
| `/developer/audiences` | - | Custom and Lookalike audience creation |
| `/developer/pixel-capi` | 21KB | Pixel management, CAPI configuration, event testing |
| `/developer/assets` | - | Ad image/video upload |
| `/developer/report` | - | Campaign performance reports |
| `/developer/security` | - | Meta connection security |

### Key Facebook-Related Components
| Component | Size | Purpose |
|---|---|---|
| `FacebookDashboard.tsx` | **189KB** | Complete Meta Ads dashboard — campaign tree view, CRUD for campaigns/adsets/ads, insights charts, template launcher, bulk operations |
| `PixelTestConsole.tsx` | 37KB | Interactive pixel event testing console |
| `CreatePixelModal.tsx` | 20KB | Pixel creation wizard |
| `FacebookOAuthButton.tsx` | 10KB | OAuth connection flow with permission details |
| `ConversionApiTester.tsx` | 18KB | Send test CAPI events with live response |
| `RoiDashboard.tsx` | 18KB | ROI and conversion attribution dashboard |

---

## 5. Access Control System

### 5.1 Roles
| Role | Access Level |
|---|---|
| `Super Admin` | Everything — all pages, all companies, impersonation |
| `Admin` | Company-level admin — integrations, team, analytics, dev hub |
| `Manager` | Lead management, analytics, chatbot, meetings |
| `Agent` | Leads, live chat, meetings, settings only |

### 5.2 User Types
| Type | Access |
|---|---|
| `super_admin` | Admin Portal, all features |
| `agency` | Agency/Clients page, can impersonate client companies |
| `individual` | Standard company user |

### 5.3 Plan-Gated Features
| Feature | Required Plan |
|---|---|
| Chatbot Builder | Pro, Enterprise |
| Integrations Hub | Pro, Enterprise |
| Analytics | Pro, Enterprise |

### Implementation
- **`UserContext`**: Provides `hasRole()`, `hasType()`, `hasPlan()` globally
- **`RoleGuard`**: Wraps pages to protect by role/type/plan with fallback redirect
- **`Sidebar`**: Dynamically filters nav items based on role + type + plan

---

## 6. API Client Architecture

### Central API Module: `src/lib/api.ts` (56KB, ~1700 lines)

This single file contains **all** API communication:

- **Axios instance** with request/response interceptors
- **Auto-auth**: Token injected from `localStorage` on every request
- **Global 401 handling**: Auto-redirect to `/signin` on expired sessions
- **Error parsing**: Centralized via `parseError()` → structured error objects
- **Client-side logging**: Errors posted to backend's `/errors/log` endpoint

### API Namespaces

| Namespace | Functions | Coverage |
|---|---|---|
| Root exports | `login`, `register`, `logout`, `getUser` | Auth |
| Root exports | `getLeads`, `createLead`, `updateLead`, `deleteLead`, `importLeads`, `bulkDeleteLeads`, `bulkUpdateLeadStatus`, `bulkUpdateLeadStage`, `updateLeadStage` | Leads |
| Root exports | `getStages`, `createStage`, `updateStage`, `deleteStage`, `reorderStages`, `syncDefaultStages` | Pipeline |
| Root exports | `createPayment` | Payments |
| `integrationApi.*` | 40+ methods | WhatsApp, Meta, Webhooks, Facebook |
| `notificationApi.*` | `getNotifications`, `markRead`, `markAllRead`, `getUnreadCount`, `getSettings`, `updateSettings`, `testPush`, `saveFcmToken` | Notifications |
| `teamApi.*` | `getMembers`, `invite`, `updateRole`, `removeMember` | Team |
| `adminApi.*` | `getCompanies`, `updateCompany`, `renewCompany`, `deleteCompany`, `getUsers`, `updateUser`, `deleteUser`, `loginAsUser`, `getStats`, `getBilling`, `getPlans`, `updatePlan`, `getTags` | Super Admin |
| `agencyApi.*` | `getClients`, `onboardClient`, `getStats`, `loginAsClient`, `deleteClient`, `renewClient`, `getHistory` | Agency |
| `emailApi.*` | `getTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate`, `getCampaigns`, `createCampaign`, `sendCampaign`, `getCampaignStats`, `getConfigurations`, `createConfiguration`, `updateConfiguration`, `deleteConfiguration`, `sendTestEmail` | Email |
| `dashboardApi.*` | `getStats` | Dashboard |
| `analyticsApi.*` | `getAnalytics` | Analytics |
| `automatedSyncApi.*` | `getStatus`, `triggerSync`, `getHistory`, `getConfiguration`, `updateConfiguration` | Lead Sync |

---

## 7. Real-Time Features

### WebSocket (Laravel Echo + Pusher)
- **Config**: `src/app/echo.js` and `src/hooks/echo.js`
- **Events**: `MessageSent` event for live chat updates
- **Service**: `src/services/websocket-service.ts` manages connection lifecycle

### Polling
- Live chat messages polled periodically for new messages
- Notification unread count checked at intervals

---

## 8. Error Handling System

### Three Layers

1. **`ErrorContext` + `useError()`** — Global error modal that can be triggered from any component. Displays a professional dialog with error details.

2. **`api.ts` interceptor** — Catches all API errors, parses them into structured objects, handles 401 auto-logout, logs errors to backend.

3. **`globalErrorHandler.ts`** — Window-level `unhandledrejection` and `error` listeners, dispatches `app-global-error` custom events.

### Error Logging Pipeline
```
Browser crash → globalErrorHandler → ErrorContext modal
API error → axios interceptor → parseError() → logger.error() → POST /errors/log (backend)
```

---

## 9. Styling System

### Design Tokens (Tailwind Config)
- **Colors**: Indigo/violet primary palette, slate neutrals
- **Dark Mode**: Full dark mode via `next-themes` + Tailwind `dark:` prefix
- **Animations**: `tailwindcss-animate` for enter/exit transitions
- **Components**: shadcn/ui pattern — Radix primitives + Tailwind styling

### Key Design Patterns
- **Sidebar**: Dark slate-900 bg, gradient glow, collapsible, responsive
- **Cards**: Rounded-xl with subtle borders, backdrop blur
- **Tables**: Custom column toggle, responsive, sticky headers
- **Modals**: Radix Dialog with overlay blur, stacked z-index management

---

## 10. Existing Documentation

| File | Location | Content |
|---|---|---|
| [META_OAUTH_IMPLEMENTATION_SYSTEM.md](file:///f:/LeadBajar/leadbajaar1.0/docs/META_OAUTH_IMPLEMENTATION_SYSTEM.md) | `/docs/` | Meta OAuth flow implementation |
| [META_PIXEL_CAPI_IMPLEMENTATION.md](file:///f:/LeadBajar/leadbajaar1.0/docs/META_PIXEL_CAPI_IMPLEMENTATION.md) | `/docs/` | Pixel + CAPI frontend setup |
| [META_API_VERIFICATION_REPORT.md](file:///f:/LeadBajar/leadbajaar1.0/docs/META_API_VERIFICATION_REPORT.md) | `/docs/` | API verification test results |
| [META_PIXEL_VERIFICATION_REPORT.md](file:///f:/LeadBajar/leadbajaar1.0/docs/META_PIXEL_VERIFICATION_REPORT.md) | `/docs/` | Pixel verification results |
| [facebook_conversion_api_guide.md](file:///f:/LeadBajar/leadbajaar1.0/docs/facebook_conversion_api_guide.md) | `/docs/` | CAPI integration guide |
| [facebook_oauth_setup_guide.md](file:///f:/LeadBajar/leadbajaar1.0/docs/facebook_oauth_setup_guide.md) | `/docs/` | OAuth setup walkthrough |
| [facebook_whatsapp_oauth_webhook_guide.md](file:///f:/LeadBajar/leadbajaar1.0/docs/facebook_whatsapp_oauth_webhook_guide.md) | `/docs/` | WhatsApp + webhook guide |
| [multi_tenant_architecture.md](file:///f:/LeadBajar/leadbajaar1.0/docs/multi_tenant_architecture.md) | `/docs/` | Multi-tenant architecture |
| [implementation_plan.md](file:///f:/LeadBajar/leadbajaar1.0/docs/implementation_plan.md) | `/docs/` | Implementation plan |
| [implementation_guide.md](file:///f:/LeadBajar/leadbajaar1.0/doc/implementation_guide.md) | `/doc/` | Implementation guide |
| [user_guide.md](file:///f:/LeadBajar/leadbajaar1.0/doc/user_guide.md) | `/doc/` | End-user guide |
| [FACEBOOK_LEAD_RETRIEVAL.md](file:///f:/LeadBajar/leadbajaar1.0/FACEBOOK_LEAD_RETRIEVAL.md) | Root | Lead retrieval docs |
| [LEADBAJAR_MOBILE_APP_FEATURES.md](file:///f:/LeadBajar/leadbajaar1.0/LEADBAJAR_MOBILE_APP_FEATURES.md) | Root | Mobile app feature spec |

---

## 11. Key Technical Notes

### Performance Considerations
- **`FacebookDashboard.tsx` is 189KB** — the largest component. Consider code-splitting or lazy loading sub-sections.
- **`api.ts` is 56KB / 1742 lines** — monolithic API file. Consider splitting into domain modules (`lead-api.ts`, `meta-api.ts`, etc.) as the codebase grows.
- **`/admin` page is 130KB** — heavy Super Admin portal. Consider splitting company/user/billing into tabs loaded on demand.

### Security
- All API calls authenticated via Bearer token (localStorage)
- Admin impersonation stores original token as `admin_token` for safe return
- 401 interceptor auto-clears session and redirects
- Error logging never exposes raw stack traces to users

### Patterns
- **All data fetching**: Client-side via `useEffect` + `api.ts` (no RSC/SSR data fetching)
- **State management**: Local `useState` per page (no global store like Redux/Zustand)
- **Forms**: Mix of controlled inputs and `react-hook-form`
- **Charts**: Recharts for all data visualization

---

## 12. Environment Configuration

### `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### `.env.production`
```env
NEXT_PUBLIC_API_URL=https://api.leadbajaar.com/api
```

> [!NOTE]
> The API base URL is currently hardcoded in `api.ts` as `https://api.leadbajaar.com/api`. The `.env` variable is commented out. For proper environment switching, uncomment and use `process.env.NEXT_PUBLIC_API_URL`.

---

## 13. Commands

```powershell
# Development (Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

*This document serves as the single source of truth for the LeadBajaar frontend application. Update it when features are added, modified, or deprecated.*
