import { logger } from "@/utils/logger";

/**
 * Dispatches a custom event that the ErrorProvider can listen to
 */
export const dispatchGlobalError = (title: string, message: string) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('app-global-error', { 
      detail: { title, message } 
    });
    window.dispatchEvent(event);
  }
};

if (typeof window !== 'undefined') {
  window.onerror = (msg, src, line, col, error) => {
    logger.error("JS Crash", { msg, src, line, col, error });
    
    // Show modal for critical crashes
    dispatchGlobalError(
      "Application Crash", 
      typeof msg === 'string' ? msg : "An unexpected script error occurred."
    );
  };

  window.onunhandledrejection = (event) => {
    logger.error("Unhandled Promise Rejection", event.reason);
    
    // Show modal for unhandled promise rejections (often API failures not caught by try/catch)
    dispatchGlobalError(
      "System Error", 
      event.reason?.message || "A background process failed unexpectedly."
    );
  };
}
