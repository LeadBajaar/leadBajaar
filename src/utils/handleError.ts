import { logger } from "./logger";
import { parseError } from "./errorParser";
import { toast } from "sonner";

interface HandleErrorOptions {
  title?: string;
  silent?: boolean;
  showModal?: (options: { title: string; message: string }) => void;
}

/**
 * Centrally handles errors from try-catch blocks in components.
 * It ensures errors are logged and appropriate UI feedback is shown.
 */
export function handleError(error: any, options?: HandleErrorOptions) {
  // Ensure we have a parsed AppError object
  const parsed = parseError(error);
  const errorMessage = parsed.message;
  const errorTitle = options?.title || "Error";

  // Log the error centrally via our logger (silently, as we handle UI here)
  logger.error(errorTitle, error, { silent: true, hideConsole: true });

  if (options?.silent) {
    return errorMessage;
  }

  // Show modal if provided (high priority)
  if (options?.showModal) {
    options.showModal({
      title: errorTitle,
      message: errorMessage
    });
  } else {
    // Default: show a nice toast
    toast.error(errorTitle, {
      description: errorMessage,
    });
  }

  return errorMessage;
}
