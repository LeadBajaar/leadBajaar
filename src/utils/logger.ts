import { API_BASE_URL } from "@/lib/api";
import { parseError } from "./errorParser";
import { toast } from "sonner";

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  error: (message: string, error?: any, options?: { silent?: boolean, hideConsole?: boolean }) => {
    // Only log to console in dev if it's NOT a handled validation error or a network error
    const isHandled = error?.status === 422 || error?.status === 401;
    const isNetworkError = error?.message === 'Network Error' || (error && !error.status && error.message?.includes('connect'));

    if (isDev && !isHandled && !isNetworkError && !options?.hideConsole) {
      console.error(`[LEADBAJAAR ERR] ${message}`, error);
    }
    
    // Dispatch global error event for the UI to catch (if not handled and not silenced)
    if (!isHandled && !options?.silent && typeof window !== 'undefined') {
      const parsed = parseError(error);
      const errorDetail = parsed.message;
      
      // If it's a network error or a 500 server error, show the high-visibility Modal
      if (errorDetail.includes('connect to server') || (parsed.status && parsed.status >= 500)) {
        const event = new CustomEvent('app-global-error', { 
          detail: { 
            title: message, 
            message: errorDetail
          } 
        });
        window.dispatchEvent(event);
      } else {
        // For other unhandled errors, show a Toast
        toast.error(message, {
          description: errorDetail,
        });
      }
    }

    // Attempt to send to server ONLY if it's not a network error 
    // (no point trying to log to a server that is unreachable)
    if (!isNetworkError) {
      sendToServer(message, error);
    }
  },
  info: (message: string, data?: any) => {
    if (isDev) {
      console.log(`[LEADBAJAAR INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(`[LEADBAJAAR WARN] ${message}`, data);
    }
  }
};

async function sendToServer(message: string, error?: any) {
  try {
    // Only attempt if we have an error to log
    const payload = {
      message,
      error: serialize(error),
      url: typeof window !== 'undefined' ? window.location.href : 'server-side',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      time: new Date().toISOString()
    };

    // Use our global API base URL for logging
    await fetch(`${API_BASE_URL}/errors/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Fail silently in production
  }
}

function serialize(error: any) {
  if (!error) return null;

  return {
    message: error.message,
    stack: error.stack,
    status: error.response?.status || error.status,
    data: error.response?.data || error.data
  };
}
