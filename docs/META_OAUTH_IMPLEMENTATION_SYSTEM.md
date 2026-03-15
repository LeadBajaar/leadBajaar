# Meta Ads & OAuth Implementation System Guide (v25.0)

This document provides a comprehensive overview of the Meta (Facebook) integration within LeadBajar. It covers the complete lifecycle from initial OAuth connection to ad publishing, advanced automation, and real-time lead reception.

---

## 🏗️ System Architecture

The integration follows a standard **Client-Server-Provider** architecture:
- **Frontend**: Next.js (React) - Handles user interaction, asset visualization, and OAuth initiation.
- **Backend**: Laravel (PHP 8.2+) - Securely manages tokens, asset synchronization, media processing, and automation rules.
- **Provider**: Meta Graph API v25.0 - The source of truth for ads, audiences, and conversion tracking.

---

## 🛠️ Step 1: Connecting Facebook (OAuth 2.0 Flow)

### 1.1 Initiation
The user clicks "Connect Facebook" in the `FacebookDashboard`. The frontend calls the backend to get a secure authorization URL.

- **Scopes Requested**: 
  - `ads_management`, `ads_read` (Full Ads Manager access)
  - `leads_retrieval` (Fetching lead data)
  - `pages_read_engagement`, `pages_show_list` (Page access)
  - `business_management` (Business Manager asset access)
- **State Handling**: The backend generates a base64 encoded JSON string containing `user_id` and a `nonce` to prevent CSRF and maintain state after redirect.

### 1.2 Callback Handling
Meta redirects the user back to the system with an authorization `code`.
1. **Code Exchange**: Backend exchanges `code` for a **Short-Lived Access Token** (valid for ~2 hours).
2. **Token Upgrade**: Backend exchanges the short-lived token for a **Long-Lived Access Token** (valid for 60 days).
3. **Identity Verification**: Fetches user details (`/me`) to confirm account ownership.
4. **Initial Asset Discovery**: Fetches managed pages (`/me/accounts`) to verify permissions.

---

## 🔄 Step 2: Advanced Asset Synchronization

The system performs a **Multi-Stage Sync** to maintain performance:
1. **Minimal Sync**: On connection, retrieves managed Pages and Ad Accounts.
2. **Deep Sync**: On-demand retrieval of Campaigns, Ad Sets, and Ads.
3. **Business Asset API**: Allows querying specific **Business Manager IDs** (`/{business_id}/owned_ad_accounts`) to fetch accounts not directly linked to the user's personal profile (Power features for agencies).

---

## 📢 Step 3: High-Performance Ad Management

### 3.1 Creative & Media Library
The system allows managing ad creatives without leaving the CRM:
- **Media Upload**: Direct upload of Images (`POST /adimages`) and Videos (`POST /advideos`) via multipart file or remote URL.
- **Ad Previews**: Provides HTML/JSON renders of ads (`GET /{ad_id}/previews`) to visualize how they appear on Facebook/Instagram feeds.

### 3.2 Audience Scaling
- **Custom Audiences**: Upload CRM leads back to Meta to create retargeting groups.
- **Lookalike Audiences (LAL)**: Generate audiences similar to your high-value customers (`subtype=LOOKALIKE`) for rapid scaling.

### 3.3 Campaigns & Management
- **Duplication**: Quickly clone successful campaigns (`POST /{campaign_id}/copies`) to test new audiences or creatives.
- **Form Management**: Monitor and manage Lead Gen forms. While Meta forms are immutable, the system supports archiving old forms and retrieving full field schemas.
- **Delivery Estimates**: Predict ad reach and leads using the **Audience Insights API** (`GET /delivery_estimate`) before spending budget.

---

## 🤖 Step 4: Automation & Diagnostics

### 4.1 Automated Rules (Ad Rules)
Define bid triggers and status rules directly from the CRM:
- **Logic**: Example: "If CPL > $10, Pause Ad Set."
- **API**: Managed via `POST /act_{id}/adrules_library`.

### 4.2 Pixel Diagnostics
Ensures tracking accuracy by monitoring pixel health:
- **Diagnostics API**: `GET /{pixel_id}/diagnostics`.
- **Checks**: Identifies missing parameters, server-side delays, and event-to-catalog match issues.

---

## 🔗 Step 5: Real-time Lead Reception & Tracking

### 5.1 Hybrid Tracking Model
Meta recommends a hybrid approach for maximum accuracy:
1. **Browser Pixel**: Fires standard events (Lead, ViewContent) from the user's browser.
2. **Conversions API (CAPI)**: Backend-to-backend event sending (`POST /{pixel_id}/events`).
3. **Offline Conversions**: Sync business deals (e.g., "Closed/Won") back to Meta via **Offline Event Sets** for full-funnel attribution.

### 5.2 Event Processing Workflow
1. **Webhook Receive**: Meta notifies the system of a new lead via `leadgen` field.
2. **Payload Extraction**: extracts `leadgen_id` and `form_id`.
3. **Fetch & Normalize**: Retrieves full lead data and applies region-specific formatting (e.g., India +91 prefixing).

---

## 📥 Step 6: CRM Integration

### 6.1 Lead Storage & Actions
Leads are saved in the `leads` table with reference to their `fb_lead_id` for deduplication.
- **Automated Actions**: Instantly trigger WhatsApp welcomes, NLP lead scoring, or push notifications.
- **Historical Retrieval**: Pull missed leads (last 90 days) via manual sync.

---

## 🔍 Maintenance & Monitoring

### Token Lifecycle
Access tokens expire every 60 days. The system uses the **Long-Lived Token** flow and provides logic to handle **Error 190** (Token Expired) gracefully in the background.

---

> [!IMPORTANT]
> Always ensure that the `redirect_uri` configured in the Meta App Dashboard exactly matches the backend callback URL defined in the `.env` file (`META_REDIRECT_URI`).

> [!TIP]
> Use the **Event Diagnostics** API periodically to ensure your CAPI and Pixel events are deduplicating correctly at a ratio of >90%.
