# Email Marketing Implementation Guide

This document outlines the architecture and implementation details of the Email Marketing & Automation system in LeadBajaar.

## 1. Overview
The Email Marketing system allows users (Admins/Super Admins) to connect their own email providers (Amazon SES, SMTP, or Mailgun) to send automated lead nurturing sequences and bulk marketing campaigns directly from the dashboard.

---

## 2. Technical Architecture

### Backend (Laravel)
The backend uses a dynamic mailer injection system to allow each company to use its own credentials.

- **Models**:
  - `EmailConfiguration`: Stores provider type (`ses`, `smtp`, `mailgun`), sender details (`from_email`, `from_name`), and encrypted credentials.
  - `Company`: Each company is linked to one active `EmailConfiguration`.
  
- **Controllers**:
  - `EmailConfigurationController`: Handles CRUD operations for email settings and provides a `test` endpoint to verify connectivity.
  
- **Jobs & Automation**:
  - `SendCampaignEmailJob`: A queued job that resolves the dynamic mailer settings at runtime and dispatches the email via the configured provider.
  - `automation:process` Command: Dynamically processes lead automation steps, including sending emails via the configured provider.

### Frontend (Next.js)
The frontend is built with modularity and scalability in mind using custom UI components.

- **Main Page**: `src/app/(dashboard)/integrations/page.tsx`
- **Modular Components**:
  - `src/components/integrations/EmailConfigDialog.tsx`: The primary configuration modal. 
  - `src/components/integrations/TestEmailDialog.tsx`: Dedicated minimal modal for sending test emails.
  - `src/components/integrations/IntegrationCard.tsx`: Reusable UI card for service status.
  - `src/components/integrations/UnifiedIntegrationDialog.tsx`: Generic modal for WhatsApp/Meta integrations.
  - `src/components/integrations/WebhookConfigDialog.tsx`: Handles complex webhook field mapping.

---

## 3. Integration Flow

### Step 1: Connection
The user discovers "Email Marketing" in the Integrations Gallery.
- **Component**: `IntegrationCard.tsx`
- **Action**: When "Connect" is clicked, it opens the `EmailConfigDialog`.

### Step 2: Configuration
The user selects a provider and enters credentials.
- **SES**: Requires Key, Secret, and Region.
- **SMTP/Gmail**: Requires Host, Port, Username, and Password (App Password for Gmail).
- **Mailgun**: Requires Domain and API Key.

### Step 3: Validation (Test Email)
Before saving, the user can (and should) send a test email.
- **Component**: `TestEmailDialog.tsx`
- **Endpoint**: `POST /api/email/configurations/test`
- **Result**: The backend attempts to send a real email using the *unsaved* temporary credentials to ensure they work.

### Step 4: Activation
Once saved, the configuration is marked as `is_active` for the company. All future automations for this company will use these settings.

---

## 4. Maintenance & Scaling

### Adding a New Provider
To add a new provider (e.g., SendGrid):
1. **Backend**: Update `EmailConfigurationController` and `SendCampaignEmailJob` to handle the SendGrid driver.
2. **Frontend**: Update the `Select` options in `EmailConfigDialog.tsx` and add the specific credential fields (e.g., API Key).

### Updating Styles
All dialogs are optimized for **Dark Mode** and use a custom design system:
- **Dialog Colors**: Indigo-themed headers for marketing actions.
- **Animations**: Subtle fade-in and slide effects for switching between providers.
- **Modal Heights**: Controlled via `max-h-[60vh] overflow-y-auto` to ensure it looks good on all screen sizes.

---

## 5. Security Notes
- **Credential Encryption**: All email passwords and keys are encrypted at rest in the database.
- **Role Guard**: Only `Super Admin` and `Admin` roles can view or edit email configurations.
- **Rate Limiting**: The system monitors `monthly_email_count` on the `Company` model to prevent abuse based on the subscription plan.

---

*Last Updated: 2026-04-17*
