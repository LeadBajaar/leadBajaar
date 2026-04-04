import { logger } from "./logger";

interface HandleErrorOptions {
  title?: string;
  showToast?: (message: string) => void;
  showModal?: (options: { title: string; message: string }) => void;
}

/**
 * Centrally handles errors from try-catch blocks in components.
 * It ensures errors are logged and appropriate UI feedback is shown.
 */
export function handleError(error: any, options?: HandleErrorOptions) {
  const errorMessage = error?.message || "An unexpected error occurred. Please try again.";
  const errorTitle = options?.title || "Error";

  // Log the error centrally via our logger
  logger.error(errorTitle, error);

  // Show toast if provided
  if (options?.showToast) {
    options.showToast(errorMessage);
  }

  // Show modal if provided
  if (options?.showModal) {
    options.showModal({
      title: errorTitle,
      message: errorMessage
    });
  }

  return errorMessage;
}
