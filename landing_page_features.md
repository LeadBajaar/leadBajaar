# LeadBajar — Complete Feature Analysis
> Source-verified across `leadbajar-backend` (Laravel API), `leadbajaar1.0` (Next.js web dashboard), and `LeadBajaarApp` (React Native mobile app).

---

# PART A — USER-FACING FEATURES (Landing Page)

> These are the features available to all users (Admin, Manager, Agent roles). These are suitable for the landing page to showcase the product.

---

## 🎯 Platform Summary

LeadBajar is an **all-in-one lead management and sales automation platform** built for agencies and sales teams. It captures leads from Facebook and websites, automates follow-ups via WhatsApp and email, manages bookings with calendar integration, and provides a full team collaboration suite — all accessible from a web dashboard and a native mobile app.

---

## 1. 👥 Lead Management

The core of LeadBajar. A powerful CRM to capture, organise, and act on every lead.

### Lead Pipeline & Stages
- Custom, fully configurable pipeline stages (create, rename, reorder, delete)
- Sync default stages or build from scratch
- Kanban-style stage progression per lead
- Stage change dialog with confirmation flow
- Bulk stage updates across multiple selected leads
- Color-coded stage badges with icon mapping
- Default stages: Lead, Appointment Booked, Qualified, Disqualified, Not Connected, Deal Closed, DNP, Follow Up, Call Back, Consultation, Not Interested, Broadcast Done, Wrong Number, Payment Received

### Lead Profiles
- Fields: Name, Phone, Email, Company, City, Profession, Source, Status, Stage, Notes, Deal Value, Paid Amount
- Lead temperature scoring: **Hot 🔥, Warm 🌡️, Cold ❄️**
- Source tagging: Website, Facebook, WhatsApp, LinkedIn, Manual, and more
- Full activity timeline per lead
- Contact history tracking
- Notes with edit support
- Deal value recording + initial payment capture (UPI, Cash, Bank)
- Payment history per lead with status tracking

### Lead Operations
- **Create** new leads manually via dialog
- **Edit** leads inline (all fields)
- **Delete** individual leads with confirmation dialog
- **Bulk delete** multiple selected leads
- **Bulk status update** (Hot / Warm / Cold)
- **Bulk stage change** across selection
- **Bulk assign leads** to agent with team member picker (shows each member's current lead count)
- **One-click WhatsApp** → opens wa.me chat instantly
- **One-click call** → triggers native tel: link
- **Quick Action Modal** — accordion-style rapid update for status, stage, and notes in one flow

### Payment & Revenue Tracking
- **Collect payments** per lead (amount, method: UPI/Cash/Bank, notes)
- **Payment history** per lead with status badges
- **Deal value / contract details** dialog with total deal amount + optional initial payment
- **Revenue analytics** endpoint for payment data aggregation

### Advanced Filtering & Search
- Debounced real-time search (500ms)
- Filter by: Status, Stage, Lead Source
- Date range filter on **Last Contact** date
- Date range filter on **Created At** date
- Clear all filters with single button
- Paginated results with configurable items-per-page (25, 50, 100)
- Column visibility toggle (show/hide any column)
- Sticky horizontal scrollbar synced to table body
- Mobile-optimised lead cards view with swipe gestures

### Lead Detail Page (Web)
- Full lead profile with all fields editable
- Activity timeline
- Deal value and payment history
- Notes and contact history

### Lead Reports (Mobile)
- Dedicated lead reports screen with visual analytics
- Lead volume, conversion, and source breakdown charts

### Import & Export
- **Import from CSV**: column mapping UI, data preview (first 5 rows), field validation (name required, email format)
- Smart CSV parser handles quoted fields and escaped characters
- Import stats summary (created / skipped / errored)
- **Export to CSV**: filtered export dialog
- **Import from Excel**: Excel spreadsheet support (mobile)
- **Export to Excel**: Excel spreadsheet export (mobile)
- **Facebook Lead Retrieval**: pull leads directly from Facebook Graph API by form + date range, shows new vs existing counts

### WhatsApp Broadcast from Lead List
- Select multiple leads → send WhatsApp broadcast
- Template picker with variable mapping
- Map template variables to lead CSV columns
- Broadcast result summary (sent / failed)

---

## 2. 📅 Meetings & Scheduling

A full Calendly-like scheduling system built right into the platform.

### Booking Views
- **Upcoming meetings** tab with grouped-by-date layout
- **Past meeting history** tab with full record
- **All meetings** tab
- Infinite scroll on each tab (Intersection Observer)
- Meeting card shows: type icon, status badge, lead name, duration, agent assigned, company
- Quick action buttons on each card: 📞 Call | WhatsApp

### Meeting Search (Mobile)
- Dedicated meeting search screen with real-time filtering
- Search by lead name, meeting type, date

### Meeting Detail Dialog
- Full lead profile panel (name, profession, email, phone, company, state)
- Meeting metadata: date, time, duration, type (Video / Phone / In-Person)
- Direct "Join Meeting" link button
- Questionnaire responses display (pre-booking questions answered by the lead)
- Notes field (editable inline)
- Outcome field (editable inline)
- Assigned host selector (change host from active team members)
- **Reschedule**: date picker + time picker with confirm flow
- **Cancel meeting** with confirmation step

### Event Types (Booking Page Config)
- Create and manage multiple event types
- Set name, description, duration
- Configure location type: Video Call, Phone, In-Person
- Set working hours and available time slots
- Timezone handling
- Assign event types to specific team members
- Add custom pre-booking questions (questionnaire)
- Google Calendar integration per event type
- Unique public booking URL per event type

### Automated Meeting Reminders
- 30-minute reminders sent automatically via push notifications
- Meeting follow-up messages post-meeting (automated)

### Public Booking Page (`/book`)
- Mobile-optimized booking page for leads to self-schedule
- Real-time availability checking
- Timezone-aware slot display
- Booking confirmation flow
- Conflict detection with Google Calendar

---

## 3. 💬 WhatsApp Integration & Automation

### WhatsApp Cloud API (Business API)
- Connect via Phone Number ID, WABA ID, Access Token
- Multiple WhatsApp account management
- Real-time connection status per account
- Re-authentication flow for expired sessions
- Access token update/rotation

### WhatsApp Template Management
- Sync templates from Meta Business Manager
- Create new WhatsApp templates from dashboard
- Edit and update existing templates
- Delete templates
- View template details and approval status
- Template picker for broadcasts and automations

### WhatsApp Bot (WA Web Path)
- Connect multiple WhatsApp numbers via QR scan
- Active session indicators (green pulse)
- Ghost session reconnect flow
- Historical/disconnected session management
- Per-session flow management

### Keyword Flow Builder
- Visual sequence tracer showing full conversation paths
- Trigger keyword configuration (exact / contains / regex match types)
- State machine: `required_state` → `next_state` chaining
- `START` and `ALL` wildcard states for universal triggers
- Reply message per flow node
- Priority ordering between flows
- Enable/Disable flows individually
- Delete flows
- Builder interface at `/whatsapp-bot/builder`

### Live Chat
- Real-time chat interface per connected number
- Handles incoming messages from flows or human takeover

### Contacts & Groups
- WhatsApp contact list management
- Group management

### Broadcast Campaigns
- Send bulk WhatsApp messages to contact lists
- Campaign management interface

### WhatsApp Profile
- Update WhatsApp business profile from dashboard

---

## 4. 🤖 Drip Sequence Automations

Multi-step automated workflows triggered by CRM events.

### Sequence Builder
- Named sequences with description
- Trigger types:
  - **Lead Created** — fires when a new lead enters the system
  - **Stage Changed** — fires when a lead moves to a specific stage
  - **Manual** — enroll specific leads by hand
- Multi-step sequence steps in visual timeline with connector line
- Step types per action:
  - 📧 **Send Email** (pick from email templates)
  - 💬 **Send WhatsApp** (template name)
  - 🔄 **Move Stage** (choose target stage)
  - ⌛ **Wait** (delay only, no action)
- Configurable delay between steps (hours)
- Add / remove steps dynamically
- Save and launch sequence

### Sequence Management
- Active vs Paused status per sequence
- Enrollment count tracking
- Pause / Resume individual sequences
- Edit existing sequences (steps + trigger)
- Dashboard stats: active sequences, total enrollments

### Global Automation Triggers
- Platform-wide automation settings (separate tab)
- Configurable global triggers for welcome flows, etc.

---

## 5. 📊 Analytics & Reporting

A rich analytics dashboard with multiple chart types.

### KPI Summary Cards
- **Total Leads** with month-over-month trend
- **Converted Leads** count
- **Conversion Rate %** (actual vs 45% target)
- **Total Revenue** (deal value sum)

### Charts & Visualisations
- **Lead Volume** — grouped bar chart (leads / converted / lost per month)
- **Revenue Trend** — area chart with gradient fill
- **Conversion Rate** — line chart vs target line
- **Lead Sources** — donut/pie chart (Facebook, Website, Referral, LinkedIn, Email, Other)
- **Pipeline Stage Funnel** — horizontal bar chart per stage
- **Weekly Activity** — bar chart (calls, emails, meetings per day)
- **Deal Value Distribution** — horizontal bar by deal size bracket (₹ ranges)
- **Top Performers** — agent leaderboard with conversion % progress bars

### Data Modes
- Toggle between **Demo Data** and **Real Live Data** from the API
- Period selector: This Month / Last 6M / This Year / All Time

### Mobile Analytics
- Dedicated analytics screen with analytics cards
- Trend indicators with percentage change
- Revenue card with visual breakdown

### Role Guard
- Analytics page restricted to: Super Admin, Admin, Manager
- Plan restriction: Pro / Enterprise plans only

---

## 6. 🔗 Integrations Hub

A centralised integration management page with categories and live connection status.

### WhatsApp Cloud API (Business API)
- Connect via Phone Number ID, WABA ID, Access Token
- Enable/disable message templates
- Real-time connection status
- Multi-account support with per-account management

### Facebook Lead Forms
- Connect multiple lead form integrations (multi-instance allowed)
- Fields: Page ID, Form ID, Page Access Token
- Automated lead capture on form submission
- Webhook-based real-time delivery + API backup sync

### Facebook Conversion API (CAPI / Meta Pixel)
- Connect Pixel ID + Access Token
- Server-side event tracking (privacy-compliant, iOS 14.5+ compatible)
- Better attribution for Meta ad campaigns
- Test event code support
- Lead Conversion Tracker component
- Conversion API Tester component
- **Create new pixels** in Meta from the dashboard
- **Pixel diagnostics** — health check and troubleshooting
- **ROI Summary Dashboard** — pixel-level ROI and conversion metrics
- **Pixel Test Console** — advanced event testing interface

### Facebook OAuth (Full Meta Integration)
- OAuth login with Facebook account
- Facebook Services Manager (pages, forms, ad accounts)
- Facebook Dashboard with page insights
- Ad account management
- **Webhook Verification Dialog** — verify webhook connectivity inline

### Meta Ads Manager _(NEW — Missing from original doc)_
- **Full Ad Account Management** — list, sync, and manage multiple ad accounts
- **Campaign Management** — create, edit, duplicate, update status, delete campaigns
- **Ad Set Management** — create and edit ad sets with targeting, budgets, and scheduling
- **Ad Management** — create ads with creatives, update, manage status at ad level
- **Ad Creative Library** — manage ad creatives, upload images and videos
- **Insights & Reporting** — per-account, per-campaign, per-ad set insights and performance metrics
- **Delivery Estimates** — get estimated reach and delivery for ad sets
- **Campaign Duplication** — one-click duplicate campaigns
- **Ad Preview** — preview ads before publishing
- **Template-based Campaign Launch** — launch campaigns from predefined templates
- **Business Asset Management** — manage business managers, ad accounts per business

### Meta Audiences _(NEW — Missing from original doc)_
- **Custom Audiences** — create custom audiences from CRM lead lists
- **Lookalike Audiences** — create lookalike audiences for prospecting
- Sync CRM leads back to Meta for retargeting

### Meta Automated Rules _(NEW — Missing from original doc)_
- **Ad Rules** — create, list, and delete automated rules for ad accounts
- Rules for automated bid, budget, and status management

### Offline Conversion Tracking _(NEW — Missing from original doc)_
- **Offline Event Sets** — create and manage offline conversion event sets
- Track offline conversions (Won/Closed deals) back to Meta ads

### General Webhook (Incoming & Outgoing)
- **Incoming**: receive external leads into the CRM
- **Outgoing**: dispatch lead events to external tools
- Configurable webhook URL + secret key
- Event selector (lead.created, lead.updated, etc.)
- **Live payload listener** — send a test request and the system captures the payload, extracts all dot-notation field paths
- Visual field mapping UI (source field → CRM field)
- Multiple webhooks with activate/deactivate toggle

### Email Marketing (SMTP / SES)
- Connect via Amazon SES or custom SMTP
- From name + From email configuration
- Used by Drip Sequences for automated emails
- Monthly email usage tracker (limit varies by plan)
- Test email dialog

### Email Templates & Campaigns _(NEW — Missing from original doc)_
- **Email Template Builder** — create, edit, delete reusable email templates
- **Email Campaigns** — create campaigns, select recipients, send bulk emails
- **Campaign Stats** — per-campaign delivery, open, click statistics
- **Email Open Tracking** — pixel-based open tracking
- **Email Click Tracking** — link click tracking with redirect
- **Email Unsubscribe** — one-click unsubscribe with preference management

---

## 7. 🤖 Chatbot Flow Builder (AI/Script-based)

A separate chatbot system (distinct from WhatsApp Bot) for website/live chat.

### Web Interface
- Visual flow designer at `/chatbot/builder`
- Flow list with create / duplicate / delete
- Flow testing interface
- Node types: Message, Input, Condition, API call, Function
- Webhook and event-based triggers
- Toggle flows active/inactive individually
- `ChatbotWelcomeService` on backend sends welcome messages to new leads automatically

### Mobile Interface _(NEW — Missing from original doc)_
- **AI Chatbots screen** — view and manage chatbot list
- Stats dashboard: total conversations, average conversion rate
- Per-bot stats: conversations count, conversion rate, last updated
- Bot status indicators (active, draft, paused)
- **ChatBot Builder** screen for editing flows on mobile
- Create new chatbot from mobile

---

## 8. 💬 Live Chat CRM

- Active conversations list
- Unread message indicators
- Priority levels (High / Medium / Low)
- Last activity timestamps
- Message search
- Team assignment per conversation
- Chat history stored and searchable
- Real-time messaging via WebSockets
- Chat detail screen with message history (mobile)
- `ChatHistoryController` on the backend with analytics summary

---

## 9. 👨‍👩‍👧‍👦 Team Management

Full multi-user workspace with role-based access control.

### Roles
| Role    | Description |
|---------|-------------|
| **Admin** | Full access: billing, integrations, team, settings, reports |
| **Manager** | Leads, bulk operations, reports, live chat |
| **Agent** | Assigned leads only, live chat |

### Team Operations
- Invite members by email (sends email invitation)
- Resend invitation to pending members
- Edit member role
- Remove member from workspace
- Search/filter member directory
- View active / invited / suspended status + last active timestamp

### Permissions Matrix (built into UI)
- Dashboard Access, Lead Management, Bulk Operations, Team Settings, Integration Setup, Billing & Invoices, Reports Generation, Live Chat Support — all role-mapped and visible in the UI

---

## 10. ⚙️ Settings

### Public Profile
- Full name, company, phone, bio/signature
- Avatar upload (stored on Cloudflare R2, old avatar auto-deleted)
- Image preview before save

### Notifications
- **Email notifications**: New Lead, Meeting Booked, Daily Performance Digest (9 AM summary)
- **Push notifications**: New Lead, Meeting Booked, Security Alerts
- Individual toggle per event and channel, persisted to backend instantly
- Unread notification count badge
- Mark individual / mark all as read
- Delete individual notifications / clear all
- Test push notification button

### Notification Settings (Mobile) _(NEW — Missing from original doc)_
- Dedicated notification settings screen on mobile
- Per-channel toggle (push, email, SMS)
- Per-event toggle (new lead, meeting booked, etc.)
- Notification list with rich cards and timestamps

### Security
- Password authentication management
- Two-Factor Authentication (2FA) enable flow

### Billing & Usage
- Current plan display (Free / Pro / Enterprise / Agency)
- Active status badge
- Monthly email usage tracker with progress bar
- Plan upgrade button
- Email limits: Free = 100/mo, Pro = 5,000/mo, Enterprise = 50,000/mo, Agency = Unlimited

### Dark Mode / Light Mode _(NEW — Missing from original doc)_
- Toggle between dark mode and light mode themes
- System-wide theme switching via `mode-toggle` component
- Full dark mode CSS variables and design tokens

### Subscription Guard _(NEW — Missing from original doc)_
- **Expired subscription** blocking screen with renewal flow
- **Suspended account** blocking screen with support contact
- Shows company name, expiration date, and account status
- WhatsApp + Email support buttons for quick renewal contact
- "Check Status after Renewal" button to re-verify subscription
- Super Admin bypass for subscription checks

### In-App Promotions & Announcements _(NEW — Missing from original doc)_
- **Promotion Modal** — animated full-screen promotions/announcements
- Support for image-based and icon-based promotions
- CTA buttons with deep links
- Frequency control (once / recurring)
- Auto-mark-as-read on dismissal

---

## 11. 🔐 Authentication & Security

### Authentication Flows (Web)
- Email + Password sign in
- Google OAuth sign in
- Registration with company setup (`/setup-account`)
- Forgot password → email link → reset password
- Session token management (Bearer token)
- `UserDevice` model for device tracking

### Authentication Flows (Mobile)
- Email + Password login
- Registration / Sign up
- Forgot Password screen with email reset

### Security Infrastructure
- Role-Based Access Control (RBAC) enforced via `RoleGuard` component on every page
- Plan-based feature flags (`hasFeature()`, `hasPlan()`, `hasType()`)
- Secure image storage on Cloudflare R2 (not public S3)
- Webhook HMAC secret signing
- Facebook token encrypted in database
- Audit logs for sensitive operations
- Firebase Cloud Messaging (FCM) for push notifications
- GDPR-compliant SHA-256 PII hashing for conversion tracking

---

## 12. 📱 Mobile App (React Native)

A native cross-platform app (Android + iOS) that mirrors the web dashboard.

### Core Modules
- **Auth screens**: Login, Register, Forgot Password
- **Dashboard**: analytics cards, meeting overview, quick stats, profile header, revenue card
- **Leads**: full list, filters, lead detail view, lead reports
- **Meetings**: upcoming, history, create/edit, meeting search, meeting details
- **Chat**: live chat inbox, chat details, AI chatbot builder, chatbot list
- **Settings**: profile, notifications, notification settings, integrations, account

### Mobile-Specific Features
- Bottom tab navigation (Dashboard, Leads, Meetings, Chat, Settings)
- Touch-optimised UI with swipe gestures
- Pull-to-refresh on all list screens
- Infinite scroll with pagination
- Offline lead viewing (cached data)
- Offline note-taking (syncs when back online)
- **Push notifications** via Firebase Cloud Messaging (FCM)
- **Biometric authentication** support
- Camera integration for profile picture upload
- Native contact integration
- Native calendar integration
- **Global search** screen with cross-module search
- **Quick Actions** from dashboard (QuickAction component)
- **Subscription Guard** — blocks access on expired/suspended accounts
- **Import/Export** — CSV and Excel import/export on mobile
- **Bulk Assign** — assign multiple leads to team members from mobile
- **Deal Value Modal** — set contract value + initial payment from mobile
- **Payments Modal** — collect and view payment history per lead
- **Notification Bell** — real-time notification badge + list
- **Coming Soon Screen** — placeholder for features in development
- **In-App Promotion Modal** — animated promotions from admin broadcasts

### Real-Time
- Pusher / Laravel Echo WebSocket integration
- Live chat messages without page reload
- Live notification updates
- Live dashboard updates

---

## 13. 🌐 Public-Facing Pages

- `/book` — Public meeting booking page (mobile-optimised, timezone-aware)
- `/signin` — Login
- `/register` — Register
- `/forgot-password` — Forgot password
- `/reset-password` — Reset password link
- `/setup-account` — New user onboarding

---

## 14. 🛠 Backend Infrastructure (Laravel 10.x)

### Automated Lead Sync Engine
- Cron scheduler: runs every 1 minute, delegates to:
  - **Recent Sync** (every 15 min) — last 2 hours of Facebook leads
  - **Gap Fill** (hourly) — checks last 24h for missed leads
  - **Comprehensive** (daily) — full 24h re-sync
  - **Deep Sync** (weekly) — 7-day recovery scan
- `AutomatedLeadSyncService` with webhook-compatible processing
- Multi-client processing (all active integrations in one run)
- 99.9% lead capture rate by design

### Scheduled Automation Jobs _(NEW — Expanded from original doc)_
| Schedule | Command | Purpose |
|----------|---------|---------|
| Every 15 min | `leads:auto-sync --strategies=recent` | Sync last 2 hours of FB leads |
| Hourly | `leads:auto-sync --strategies=gap_fill` | Fill gaps in last 24h |
| Hourly | `leads:monitor` | Health monitor with alert threshold |
| Daily 2 AM | `leads:auto-sync --comprehensive` | Full 24h re-sync |
| Weekly Sun 3 AM | `leads:auto-sync --full_history` | 7-day deep recovery scan |
| Daily 4 AM | `logs:clear --days=30` | Clean up old log files |
| Daily 8 AM | `subscriptions:check-expiring` | Notify expiring subscriptions |
| Every 5 min | `meetings:send-reminders` | 30-min meeting reminders |
| Monthly 1st | `companies:reset-email-counts` | Reset monthly email quotas |
| Mondays 8 AM | `users:send-weekly-digest` | Weekly performance digest |
| Daily 10 AM | `leads:check-inactivity` | Flag inactive leads |
| Every 5 min | `meetings:send-followups` | Post-meeting follow-ups |
| Every minute | `automation:process` | Execute drip sequence steps |

### CLI Tools _(NEW — Missing from original doc)_
- `leads:merge-duplicates` — Merge duplicate leads by phone/email
- `leads:normalize-phones` — Normalize phone numbers to standard format
- `leads:find-reactivations` — Find old leads that re-engaged
- `leads:update-reactivation-dates` — Update reactivation timestamps
- `meta:refresh-tokens` — Refresh expiring Meta/Facebook tokens
- `leads:show-config` — Display current lead sync configuration
- `leads:show-todays` — Show today's lead intake summary
- `leads:auto-sync --dry-run` — Safe test mode for sync

### Backend Services
| Service | Purpose |
|---------|---------|
| `AutomatedLeadSyncService` | Scheduled FB lead sync |
| `AutomationService` | Drip sequence step execution |
| `ChatbotWelcomeService` | Auto-welcome new leads via chatbot |
| `FacebookApiService` | Graph API calls for leads and pages |
| `FacebookConversionApiService` | Meta CAPI event tracking |
| `FcmService` | Firebase push notifications |
| `WhatsAppService` | WhatsApp Business API messaging |
| `WebhookDispatchService` | Outbound webhook delivery |
| `R2StorageService` | Cloudflare R2 file storage |
| `StageService` | Pipeline stage management |
| `EmailTemplateService` | Email template rendering |
| `MetaService` | Unified Meta API operations (ads, pages, pixels) |
| `MetaSyncService` | Meta asset synchronization |

### Error Handling & Observability
- Smart error classification (token expired, rate limit, permissions)
- Automated log rotation
- Separate log files per operation type
- Health metrics endpoint
- Client error logging endpoint (frontend errors logged server-side)

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Web Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Recharts |
| **Mobile App** | React Native (Android + iOS), TypeScript |
| **Backend API** | Laravel 10.x, PHP 8.2+, MySQL |
| **Real-Time** | Laravel Echo + Pusher WebSockets |
| **File Storage** | Cloudflare R2 |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Email** | Amazon SES / Custom SMTP |
| **Scheduling** | Laravel Scheduler (cron) |
| **Auth** | Bearer tokens, Google OAuth, Facebook OAuth |
| **Ads Platform** | Meta Marketing API (Campaigns, Ad Sets, Ads, Pixels, CAPI) |

---
---

# PART B — ADMIN / INTERNAL FEATURES (Not for Landing Page)

> These features are for Super Admin / Agency operators only. They manage the platform itself, not individual user accounts. These should NOT appear on the landing page.

---

## A1. 🏛️ Super Admin Panel

### Super Admin Dashboard (`/admin`)
- Platform-wide stats overview (total users, companies, revenue)
- Company management (list, edit, delete, renew subscription)
- Subscription history per company
- User management (list, edit role, delete, login as any user)
- Billing overview
- Error logs viewer with stats
- Clear error logs
- Email stats across all companies

### Plans Management
- View, create, and edit subscription plans
- Plan pricing with history tracking

### Global Tags
- Platform-wide tag management for categorisation

### Broadcast System
- **Send broadcast** — push promotional notifications to all users/companies
- **Broadcast history** — view past broadcasts sent
- Rich notifications with image, CTA link, alert type, and frequency control

### Tester Requests
- View user-submitted tester/beta access requests
- Approve or reject tester requests with status update
- Toggle user notification preferences

### Company Email Toggle
- Enable/disable email sending for specific companies

---

## A2. 💰 Finance Module (`/admin/finance`)

### Finance Dashboard
- Revenue overview with monthly summary
- Expense breakdown by category
- Net profit/loss calculations

### Revenue & MRR
- Company-level revenue listing
- **MRR Breakdown** — Monthly Recurring Revenue per company
- **MRR History** — MRR trend over time
- Subscription listing with plan details
- **Manual Renewals** — process renewals manually
- **Revenue Adjustments** — record discounts, credits, one-off charges
- **Revenue Targets** — set and track monthly revenue goals
- **Upgrade Log** — track plan upgrades/downgrades

### Expenses Management
- Create, edit, delete expenses with categories
- Expense category management (CRUD)
- **Recurring expenses** support
- **Daily expenses** view by date
- **Monthly expenses** view by month/year
- **Receipt upload** — attach receipt images to expenses

### Employee Management (HR)
- Full employee records (CRUD)
- Salary revision history per employee
- Toggle active/inactive status
- Revision tracking with salary history

### Payroll
- Generate payroll cycles by month/year
- Mark payouts as paid with proof upload
- Update payout status
- Annual salary summary
- **Payslip generation** per payout

### Churn Tracking
- Churn log — list of churned subscriptions
- Tag churn reasons
- Auto-detect churn based on subscription expiry

### Plans & Pricing
- View current plans
- Update plan pricing
- Pricing history audit trail

### Financial Reports
- **Monthly P&L** — profit and loss by month
- **Annual Summary** — yearly financial overview
- **Payroll Report** — yearly payroll summary
- **GST Report** — tax report by month

### Finance Audit Log
- All finance operations logged
- Full audit trail with timestamps and actors

### Finance Alerts
- Configurable alerts for financial thresholds

---

## A3. 🏢 Agency Mode (`/agency`)

- Agency-specific dashboard
- Client management (list, onboard, delete)
- Agency stats overview
- **Login as client** — impersonate client accounts for support
- Client subscription renewal
- Client activity history

---

## A4. 🔧 Developer Hub (`/developer`) _(NEW — Missing from original doc)_

Internal developer console for Meta API integration management.

### Developer Console
- Asset & Account Management — manage Business Managers, Ad Accounts, Pages
- Lead Capture & Retrieval — webhook config, Graph API leads, LeadGen form management
- Pixel & CAPI Tracking — hybrid browser + server tracking, offline conversions
- Advanced Ad Ops — campaign duplication, creative library, delivery estimates
- Audience Intelligence — custom/lookalike audiences, CRM sync
- Security & Compliance — OAuth 2.0 flow, token lifecycle, GDPR SHA-256 hashing
- Email & Marketing Automation — drip sequence guide, SES delivery infrastructure

### Sub-Pages
- `/developer/getting-started` — Onboarding guide
- `/developer/ads` — Meta Ads API documentation
- `/developer/audiences` — Audience management guide
- `/developer/pixel-capi` — Pixel and CAPI implementation guide
- `/developer/security` — Security and compliance documentation
- `/developer/automations-guide` — Email & automation workflow guide
- `/developer/report` — Implementation status report

### Access Control
- Restricted to Super Admin and Admin roles only

---

## A5. 📧 Admin Email Management (`/admin/emails`) _(NEW — Missing from original doc)_

- Platform-wide email delivery management
- Email template administration
- Email sending logs and analytics
- Bulk email operations

---

## A6. 🐛 Error Logs Viewer (`/admin/errors`) _(NEW — Missing from original doc)_

- View client-side and server-side error logs
- Error statistics and frequency analysis
- Clear old error logs
- Separate log channels per operation type

---

## A7. Meta Integration Internals _(Admin-Only API Features)_

These backend capabilities are used by the admin but not exposed to regular users:

- **Meta Deauthorization Callback** — handle app deauthorization from Meta
- **Meta Data Deletion** — GDPR data deletion request handling
- **Deletion Status** — track data deletion request progress
- **Meta Token Refresh** — automated token lifecycle management
- **Debug Lead Retrieval** — test lead retrieval by ID for troubleshooting
- **Page Subscription Management** — subscribe/unsubscribe pages for webhooks
- **Webhook Checklist** — verify webhook setup status per page
