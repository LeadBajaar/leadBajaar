# Frontend Architecture Guide: Multi-Tenant Workspace Integration

## 📌 Overview
LeadBajar's frontend has been updated to reflect the new **Multi-Tenant (Workspace-Centric)** backend. The UI is designed to support shared agency workspaces where team performance and lead management are centralized.

---

## 🎨 Design Principles
- **Collaborative**: Team members see shared activity across the entire company.
- **Isolated**: Workspace boundaries are strictly enforced through `company_id`.
- **Flexible Onboarding**: Support for both password-based and link-based client registration.

---

## 🏗️ Core Integrations

### 1. Unified Dashboard
Metrics (Leads, Appointments, Revenues) now pull from company-wide stats:
- **Activity Feed**: Shows system-wide events (new leads from any team member's integration).
- **Analytics**: Aggregated performance across the entire workspace.

### 2. Team-Based Lead Management
- **Shared Access**: Any team member with appropriate roles can manage any lead in the company.
- **Deduplication**: The frontend handles lead entry within the context of the workspace to prevent duplicates.

---

## 🛠️ Onboarding Workflow (Agency Portal)
Agencies can onboard clients using the `AgencyPortalPage`. 

- **Direct Password Setup**: During client creation, setting a password allows the client to log in immediately.
- **Setup Links**: If no password is provided, the platform generates a unique setup URL (`/setup-account?token=...`).
- **Confirmation UX**: A success modal provides the Setup Link for easy copying and sharing.

---

## 🔐 Authorization & Scoping
- **Context API**: Access the current user's `company_id` for client-side filtering (if needed).
- **Role Guards**: Use `RoleGuard` to restrict workspace-level management (e.g., adding integrations) to Admins/Owners.

---

## ⚙️ Key Backend API Interactions
The frontend must provide the `company_id` implicitly through the authenticated session. The backend automatically filters all standard CRUD (Leads, Bookings, EventTypes, etc.) by the authenticated user's workspace.

### ⚠️ Important: Creation Logic
When creating new items (e.g., adding a manual lead), ensure the frontend matches the backend's workspace-centric schema. No extra manual `company_id` field is needed from the user in most cases, as the backend resolves it the current user.

---

## 🚀 Future Maintenance
When adding new UI features:
1. Ensure components reflect **Company** data rather than **User** data.
2. Maintain role-based access for workspace settings (Integrations, Billing).
3. Update the `AgencyController` and `DashboardController` hooks if more aggregated metrics are needed.
