---
type: state
group: error-context
directory: src/contexts
usedByFeatures: [dashboard, account_settings, team_management, authentication]
---

# State: ErrorContext (`src/contexts/ErrorContext.tsx`)

## What it provides
`useError()` returns `{ showError, hideError }`.

- **`showError({ title?, message })`** — opens a global modal `Dialog` (not a toast) displaying the error title (default `"Error Occurred"`) and a monospace, pre-wrapped error message.
- **`hideError()`** — closes it.

`ErrorProvider` is mounted once at the very top of the app in `src/app/layout.tsx` (wraps everything, including public auth pages), rendering the `Dialog` alongside `{children}`.

## Who consumes it
- Intended for any component needing a blocking, dismissible error dialog rather than a transient toast — none of the pages read in this cluster (`signin`, `register`, `settings`, `team`, `dashboard`) call `useError()` directly; they use `sonner` toasts (or, in dashboard's case, the legacy `useToast`) instead for inline errors.
- **Global crash listener**: `ErrorProvider` also subscribes to a `window` custom event `app-global-error` (`event.detail: { title, message }`) and calls `showError()` automatically — this is the bridge for uncaught errors/promise rejections raised outside React's render cycle. The dispatching side (`src/lib/globalErrorHandler`, imported in `src/app/layout.tsx`) was not read in this cluster but is the likely source of these events (e.g. window `onerror`/`onunhandledrejection` handlers).

## Gotchas
- This is a **separate, parallel error-surfacing mechanism** from both `sonner` toasts and the legacy `useToast` — three distinct ways to show an error exist in the codebase (`toast.error()` from `sonner`, `toast({ variant: 'destructive' })` from `useToast`, and `showError()` modal from `ErrorContext`). When writing new error-handling code, prefer `sonner` per the repo-wide convention (`context/ai-context.md`) unless the error is severe/blocking enough to warrant a modal.
- The "Got it" button in the error dialog currently just calls `hideError()` — no retry/logout wiring despite a comment suggesting that was planned (`// If it's a critical error (like auth), we can provide a retry or logout option here`).
