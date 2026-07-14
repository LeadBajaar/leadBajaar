---
type: api
group: auth
sourceFile: src/lib/api.ts
usedByFeatures: [authentication, dashboard]
---

# API: auth

| Function | HTTP | Params | Purpose | Line ref |
|---|---|---|---|---|
| `login` | `POST /login` | `email, password` | Authenticates, extracts `token`/`access_token` from response, calls `setSession(token)`. Throws normalized `Error` with server message on 422/other errors. | `src/lib/api.ts:116` |
| `register` | `POST /register` | `name, email, password, password_confirmation, phone` | Creates a new account. **Bug**: calls `setSession('your_auth_token')` — a literal placeholder, not the real token from `response.data`. | `src/lib/api.ts:143` |
| `forgotPassword` | `POST /forgot-password` | `email` | Requests a password-reset email. | `src/lib/api.ts:159` |
| `resetPassword` | `POST /reset-password` | `token, email, password, password_confirmation` | Consumes the emailed reset token to set a new password. | `src/lib/api.ts:169` |
| `logout` | `POST /logout` | none (uses current session token in header) | Calls backend logout, then `clearSession()` regardless of success/failure. | `src/lib/api.ts:184` |
| `getUser` | `GET /user` | none | Fetches the full authenticated user (with `company` relation). Sole call site should be `UserContext` — see [state/user-context.md](../state/user-context.md); do not re-fetch elsewhere. | `src/lib/api.ts:211` |
| `submitTesterRequest` | `POST /tester-requests` | `{ name, email, phone }` | Submits a Play Store beta-tester access request (used on `/dashboard`). | `src/lib/api.ts:215` |
| `loginWithGoogle` | `POST /login/google` | `token` (Google OAuth token) | Exchanges a Google token for a session; calls `setSession(token)` with the *input* token (not a server-issued one) — no UI in this cluster currently calls this function. | `src/lib/api.ts:220` |
| `me` | `GET /user` (explicit `Authorization` header from `localStorage`) | none | Functionally duplicates `getUser()` — redundant alternate implementation; not referenced by any page read in this cluster. | `src/lib/api.ts:1517` |

## Related, not in this table
- `teamApi.setupAccount` — see [api/team.md](../api/team.md) — is the API call used by `/setup-account` to activate an invited member (also an "auth" concern but grouped under Team per the assigned scope).
- `getDashboardStats` (`GET /dashboard/stats`) — see [features/dashboard.md](../features/dashboard.md).
- Global axios instance `api` (`src/lib/api.ts:53`) attaches `Authorization: Bearer <token>` from `localStorage.token` on every request via a request interceptor, and on any `401` response clears the session and hard-redirects to `/signin` (unless already on `/signin`/`/signup`) via a response interceptor. `402` responses are logged but handled visually by `SubscriptionGuard`, not by this interceptor.
