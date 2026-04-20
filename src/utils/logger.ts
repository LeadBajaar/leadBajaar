import { API_BASE_URL } from "@/lib/api";

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  error: (message: string, error?: any) => {
    // Only log to console in dev if it's NOT a handled validation error (like 422)
    const isHandled = error?.status === 422 || error?.status === 401;

    if (isDev && !isHandled) {
      console.error(`[LEADBAJAAR ERR] ${message}`, error);
    }
    
    // Always attempt to send to server in both dev and prod for monitoring
    sendToServer(message, error);
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
