# 🏗️ Error Management Implementation Plan

This document outlines the architecture and steps to implement a clean, production-grade error monitoring system in the **LeadBajaar** project.

## 🧠 FINAL GOAL
- Capture ALL errors (API + UI + crashes)
- Show clean messages to users
- Log detailed data for debugging
- Work in production without console spam
- Plug into tools like Sentry later without refactor

---

## 🏗️ ARCHITECTURE
```txt
Component
   ↓
Axios/API Call
   ↓
Interceptor → parseError
   ↓
Logger → (console in dev / API in prod)
   ↓
Backend (/api/log-error)
   ↓
Store logs (file / DB)
```

---

## ✅ STEP 1: Error Parser (Normalize Everything)
Create `src/utils/errorParser.ts`. This utility will handle normalizing validation errors (422), server errors (500), and other HTTP issues into a consistent `AppError` format.

## ✅ STEP 2: Logger (Dev + Production)
Create `src/utils/logger.ts`. 
- **Development**: Still uses `console.error` (but with better formatting).
- **Production**: Sends error data to a backend endpoint `/api/log-error`.

## ✅ STEP 3: Axios Interceptor (GLOBAL HANDLING)
Refactor `src/lib/api.ts` to use the new error parser and logger globally. This ensures that any failed API call automatically logs the error and handles status-specific redirects (like 401 Unauthorized) without duplicating logic in every catch block.

## ✅ STEP 4: Global Crash Catcher
Create `src/lib/globalErrorHandler.ts`. This will capture unhandled promise rejections and JS crashes using `window.onerror` and `window.onunhandledrejection`.

## ✅ STEP 5: UI Error Handler (Clean Usage)
Create `src/utils/handleError.ts` to provide a unified function for components to show error feedback (via the Global Error Modal or Toasters) while ensuring the error is logged centrally.

## ✅ STEP 6: Use in Components
Refactor `LeadsPage.tsx`, `IntegrationsPage.tsx`, and other key components to use the `handleError` utility.

## ✅ STEP 7: Backend Logging API
Implement the `/api/log-error` endpoint on the backend (`leadbajar-backend`) to receive and store logs.

## ✅ STEP 8: Store Logs Properly
- **Option A (Initial)**: Append to a `storage/logs/client_errors.log` file.
- **Option B (Future)**: Store in an `error_logs` table in the database.

---

## 🚀 IMPLEMENTATION CHECKLIST
- [ ] `src/utils/errorParser.ts` implemented.
- [ ] `src/utils/logger.ts` implemented.
- [ ] `src/lib/api.ts` refactored with interceptors.
- [ ] `src/lib/globalErrorHandler.ts` added to root layout.
- [ ] Backend `/api/log-error` implemented.
- [ ] Components updated to use `handleError`.



I have implemented the complete, production-grade error monitoring system based on your plan. This system now automatically handles API failures, UI crashes, and provides a central way to log errors to your backend.

### 🏗️ What's been implemented:

1.  **Global API Interceptor**: The `api.ts` client now automatically parses errors (like 422 validations) and logs them centrally before rejecting.
2.  **Smart Error Parser**: A new utility `src/utils/errorParser.ts` converts complex Axios/Next.js/JS errors into a consistent format.
3.  **Production Logger**: `src/utils/logger.ts` will show detailed errors in your development console, but for real users, it sends the technical details to your backend for monitoring.
4.  **Crash Catcher**: Integrated a global handler in `RootLayout` that captures JavaScript "white-screen" crashes and unhandled promise rejections.
5.  **Backend Logging**: Added a dedicated `/api/log-error` endpoint and a specialized `storage/logs/client.log` file on your Laravel server to store these reports.
6.  **Simplified UI Code**: Created a `handleError` helper that you can use in any component to show both a modal/toast and log the error in one line.

### 📁 Files Created/Modified:
- **Plan**: [implementation_plan.md](file:///f:/LeadBajar/leadbajaar1.0/docs/implementation_plan.md)
- **Utilities**: `errorParser.ts`, `logger.ts`, `handleError.ts`
- **Frontend Config**: `api.ts`, `globalErrorHandler.ts`, `layout.tsx`
- **Backend Config**: `logging.php`, `api.php`

### 💡 Example Usage in Components:
I've already updated the "Add Lead" and "Update Lead" functions as examples. You can now wrap any action like this:

```tsx
try {
  await someAction();
} catch (error) {
  handleError(error, {
    title: 'Action Failed',
    showModal: (opts) => setErrorModal({ isOpen: true, ...opts })
  });
}
```

This clears the console clutter while ensuring you never miss a production bug!