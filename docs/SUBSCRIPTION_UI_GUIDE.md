# Subscription & Billing UI Implementation

This document explains how the frontend handles subscription states, plan displays, and limits.

## 1. Global State Management

The subscription data is part of the `UserContext`. Every time a user logs in or the session is refreshed, the `company` object is populated with:
- `plan`: Current tier (Free, Pro, Enterprise).
- `expires_at`: Expiry timestamp.
- `monthly_email_count`: Current usage.

## 2. Subscription Views

### A. Settings Page (Billing Tab)
Located at `/settings`, the billing tab serves as the user-facing dashboard for their plan.
- **Plan Display**: Shows the current plan name with an "Active" badge if `expires_at` is in the future.
- **Usage Progress**: A dynamic progress bar calculates email usage against hardcoded limits:
  - `Free`: 100
  - `Pro`: 5,000
  - `Enterprise`: 50,000
  - `Agency`: Unlimited
- **Upgrade Path**: The "Upgrade Plan" button is currently a placeholder for users to contact support or their managing agency.

### B. Admin Dashboard (Super Admin)
Located at `/admin`, provides high-level control over all subscriptions:
- **Companies Tab**: Lists all orgs with their plan and expiry.
- **Renewal Dialog**: Allows admins to add `N` days to any company.
- **Edit Modal**: Allows manual switching of plans and status (`Active`, `Delinquent`, `Suspended`).
- **History Modal**: Recalls the `subscription_history` from the backend to show an audit trail of changes.

### C. Agency Portal
Located at `/agency`, allows agencies to manage their sub-clients:
- **Onboarding**: Creates a new company under the agency parent, assigns a plan, and sets an initial 30-day expiry.
- **One-Click Renewal**: Agencies can quickly add 30 days to any client's subscription.

## 3. SubscriptionGuard & Enforcement

The `SubscriptionGuard` component (in `src/components/SubscriptionGuard.tsx`) is the primary UI gatekeeper.
- **Location**: It wraps the dashboard content in `src/app/(dashboard)/layout.tsx`.
- **Behavior**:
  - If `isExpired` or `isSuspended`, it renders a full-page blur and a high-fidelity modal.
  - **Super Admins** are automatically bypassed to ensure platform management remains functional.
  - It provides 1-click renewal links and support contact options.

## 4. Plan-Based Feature Access

Features should be restricted based on `user.company.plan`. 

Example logic in `RoleGuard` or specific pages:
- **Free**: No WhatsApp API, restricted lead limits.
- **Pro+**: Full access to Automation, Webhooks, and Multi-tenant Email.

## 5. Upcoming Implementation Tasks
- [ ] Connect "Upgrade Plan" button to a checkout flow (e.g., Razorpay/Stripe).
- [ ] Implement a global "Expired Account" overlay to block access if `expires_at` is passed.
- [ ] Add "Low Usage" notifications when a user reaches 80% of their monthly email limit.

---
*Last Updated: 2026-04-19*
