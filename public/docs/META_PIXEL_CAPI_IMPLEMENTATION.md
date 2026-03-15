# Meta Pixel & Conversion API (CAPI) — Full Implementation Guide

> **Created:** 2026-03-10 | **Last Updated:** 2026-03-11  
> **Author:** LeadBajaar Engineering  
> **Status:** ✅ All Phases Complete — Production Hardened (v4 — Diagnostics & Offline Sets)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Pixel Creation Flow](#pixel-creation-flow)
3. [Offline Conversions (Event Sets)](#offline-conversions-event-sets) ✨
4. [Diagnostics & Health](#diagnostics--health) ✨
5. [Database Schema](#database-schema)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [How Tracking Works (Flow)](#how-tracking-works-flow)
9. [Tracking Script Reference](#tracking-script-reference)
10. [Testing Guide](#testing-guide)
11. [Phase Roadmap](#phase-roadmap)
12. [Troubleshooting](#troubleshooting)
13. [Security & Privacy](#security--privacy)

---

## Architecture Overview

LeadBajaar acts as an intelligent bridge between your client's website and Meta's advertising platform, enabling **Hybrid Tracking** — the most accurate method recommended by Meta.

```
Client Website                     CRM / Lead Management
    │                                     │
    ├── Browser Pixel Event (fbq)         ├── Lead Status Update (Won/Closed)
    │       │                             │         │
    │       └──→ Meta Events Manager      │         └──→ CAPI 'Purchase' Event
    │                                     │
    └── LeadBajaar CAPI Bridge            ├── Offline Conversion Data Set
            │                             │         │
            ↓                             │         └──→ Manual Offline Sync
    POST /api/tracking/event              │
            │                             └──→ Event Diagnostics API 🩺
            ↓                                       │
    LeadBajaar CRM Backend                          └──→ Meta Graph API
            │
            ├── Hashes PII (SHA-256)
            └──→ Meta CAPI v25.0
```

---

## Pixel Creation Flow

Pixels live inside an Ad Account. LeadBajaar follows the correct Meta hierarchy to create them.

1. **Connect Meta**: Authenticate via OAuth 2.0.
2. **Select Account**: Choose an Ad Account managed by the user.
3. **Create Pixel**: `POST /act_{id}/adspixels`.
4. **Copy Script**: The CRM provides a pre-configured script with the **CAPI Bridge** built-in.

---

## Offline Conversions (Event Sets) ✨

Track sales that happen outside the digital funnel (e.g., phone calls, in-store).

### 1. Unified Tracking via LeadObserver
The CRM automatically sends offline conversions to Meta when a lead is moved to a "Won" or "Closed" stage. No manual work is required.

### 2. Manual Offline Event Sets
For advanced users, the CRM supports managing **Offline Event Sets**:
- **Create Set**: Create dedicated containers for offline data.
- **Upload Events**: Bulk upload deal records directly to Meta for attribution modeling.

---

## Diagnostics & Health ✨

Ensure your tracking system is working at 100% efficiency.

### Event Diagnostics API
- **Endpoint**: `GET /meta/pixels/{pixel_id}/diagnostics`
- **Capabilities**: 
  - Detects **Missing Parameters** (e.g., `em`, `ph` missing from CAPI payload).
  - Flags **Server-Side Latency** issues.
  - Monitors **Event Match Quality (EMQ)**.
  - Identifies **Event-to-Catalog** mismatch (critical for e-commerce).

---

## Database Schema

### Updated `meta_pixels`
Stores connection details and health status.

```sql
CREATE TABLE meta_pixels (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    pixel_id        VARCHAR(255) UNIQUE NOT NULL,
    ad_account_id   VARCHAR(255) NULLABLE,
    name            VARCHAR(255) NULLABLE,
    last_fired_at   TIMESTAMP NULL,
    is_active       BOOLEAN DEFAULT TRUE
);
```

---

## Backend Implementation

### Key Services

| Service | Responsibility |
|---------|----------------|
| `FacebookConversionApiService` | Hashing (SHA-256) and CAPI POST requests. |
| `FacebookApiService` | Pixel Creation, Diagnostics, and Form Retrieval. |
| `MetaService` | Offline Event Sets and Automated Rules. |

---

## How Tracking Works (Flow)

### The "Loop"
1. **Visitor** submits form → **lbTrack** sends event to CRM and Meta simultaneously.
2. **CRM** creates lead record and stores hashed visitor ID.
3. **Sales Rep** closes deal → Lead status changes to **Won**.
4. **CRM** sends **Purchase** event via CAPI to Meta using the same visitor ID.
5. **Meta** matches the final Sale back to the initial Ad Click. **Attribution Complete.**

---

## Phase Roadmap

### ✅ Phase 1 — Core Infrastructure
- [x] Hybrid Tracking Bridge (fbq + lbTrack)
- [x] PII Hashing (GDPR Compliant)
- [x] LeadObserver (Stage-based CAPI)

### ✅ Phase 2 — Advanced Management
- [x] **Ad Creative Library** (Upload Images/Videos)
- [x] **Lookalike Audiences** (Scale your high-value leads)
- [x] **Custom Audiences** (Retargeting)
- [x] **Campaign Duplication** (1-click cloning)

### ✅ Phase 3 — Health & Attribution
- [x] **Event Diagnostics API** 🩺
- [x] **Offline Event Sets** (Manual & Auto-Won)
- [x] **Delivery Estimates** (Predict reach before spending)
- [x] **Automated Rules** (Pause ads based on performance)

---

## Troubleshooting

### Low Event Match Quality (EMQ)
- **Problem**: Meta shows EMQ < 6.0.
- **Fix**: Ensure `lbTrack` is sending `email` and `phone` whenever available. The CRM hashes them automatically.
- **Diagnostics**: Check the **Diagnostics Tab** in the CRM for specific missing parameters.

---

> [!TIP]
> Always use `lbTrack` instead of raw `fbq('track', ...)` to ensure your events are immune to iOS 14+ tracking restrictions and ad-blockers.

| Layer | File | Purpose |
|-------|------|---------|
| **Frontend** | `src/lib/api.ts` | All `integrationApi.*` pixel & CAPI methods |
| **Frontend** | `src/components/facebook-oauth/FacebookDashboard.tsx` | Main dashboard with 6 tabs |
| **Frontend** | `src/components/facebook-oauth/PixelTestConsole.tsx` | Pixel Manager, Test Console, Script Generator |
| **Frontend** | `src/components/facebook-oauth/CreatePixelModal.tsx` ✨ | 3-step pixel creation wizard |
| **Frontend** | `src/components/facebook-oauth/RoiDashboard.tsx` | ROI metrics, bar chart, event breakdown |
| **Backend** | `app/Http/Controllers/Meta/MetaPixelController.php` | Pixel sync, create in Meta, CRUD |
| **Backend** | `app/Http/Controllers/TrackingController.php` | Public event ingestion (rate-limited) |
| **Backend** | `app/Http/Controllers/Meta/ConversionDashboardController.php` | ROI summary API |
| **Backend** | `app/Observers/LeadObserver.php` | Lead → Lead, LeadQualified, Purchase events |
| **Backend** | `app/Observers/UserObserver.php` | User signup → CompleteRegistration event |
| **Backend** | `app/Services/FacebookConversionApiService.php` | Core CAPI logic + SHA-256 hashing (v21.0) |
| **Backend** | `app/Services/FacebookApiService.php` | `getUserPixels()`, `createPixel()` via v21.0 API |
| **Backend** | `routes/api.php` | Route definitions |
| **DB** | `database/migrations/2026_03_10_*` | All 4 new migration files |

---

*Last Updated: 2026-03-11 (v3 — Pixel Creation Flow) by LeadBajaar Engineering*
