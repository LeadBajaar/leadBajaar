---
type: flow
slug: agency-client-management
featuresInvolved: [agency_management]
---
# Flow: Agency Client Management

End-to-end lifecycle of an agency onboarding and operating a portfolio of sub-client workspaces via `/agency` (see [`../pages/agency.md`](../pages/agency.md), [`../api/agency.md`](../api/agency.md)).

1. **Access**: An `agency`-type (or `super_admin`) user with role Admin+ navigates to `/agency`. `RoleGuard` checks `allowedTypes=['agency','super_admin']` and `allowedFeatures=['agency_management']`; `individual`-type accounts are always blocked regardless of feature flags.
2. **Load portfolio**: Page fetches `agencyApi.getClients()` and `agencyApi.getStats()` in parallel — populates the client table and the 3 portfolio KPI tiles (Managed Clients, Total Leads Managed, Portfolio Engagement).
3. **Onboard a new client**:
   a. Agency opens the "Onboard New Client" dialog, fills business name, owner name/email, plan tier, and optionally a password.
   b. Submits → `agencyApi.onboardClient(data)`.
   c. If no password was set, the backend returns an `invitation_link`; the UI swaps to a "copy link and share" success panel instead of closing the dialog.
   d. If a password was set, the backend (presumably) emails the credentials directly, and the dialog closes with a toast.
   e. `fetchData()` re-runs to show the new client in the table.
4. **Impersonate a client ("Open")**:
   a. Agency clicks "Open" on a client row.
   b. Current agency token is cached to `localStorage.admin_token`.
   c. `agencyApi.loginAsClient(clientId)` exchanges for the client's own token.
   d. `setSession(token)` swaps `localStorage.token`, then `window.location.href = '/dashboard'` forces a full reload so `UserContext` re-hydrates as the client.
   e. Exiting impersonation (handled by sidebar/shared logic per `context/ai-context.md`) restores `admin_token` back to `token` and redirects to `/agency`.
5. **Renew a client's subscription**: Confirmation modal → `agencyApi.renewClient(id)` extends by a fixed 30 days → refetch.
6. **View subscription history**: `agencyApi.getClientHistory(id)` populates a read-only modal table (event type, plan, new expiry) for audit purposes.
7. **Delete a client**: Confirmation modal (destructive variant) → `agencyApi.deleteClient(id)` permanently removes the workspace and all its data → refetch.

## Cross-references
- Compare with the platform-wide equivalent for Super Admin: [`../flows/super-admin-governance.md`](../flows/super-admin-governance.md) (same `admin_token` impersonation pattern, but `adminApi.loginAsAnyUser` targets any user on the platform, not just the agency's own clients).
- Team/member management *within* a single client company is a separate feature owned by another documentation cluster.
