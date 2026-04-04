import { useError } from "@/contexts/ErrorContext";
import { handleError as baseHandleError } from "./handleError";
import { toast } from "sonner";

interface ErrorOptions {
  title?: string;
  showToast?: boolean;
}

/**
 * A hook that provides a simplified way to handle errors using the global ErrorContext.
 */
export function useErrorHandler() {
  const { showError } = useError();

  const handleError = (error: any, options?: ErrorOptions) => {
    return baseHandleError(error, {
      title: options?.title,
      showToast: options?.showToast ? (msg) => toast.error(msg) : undefined,
      showModal: (opts) => showError({ title: opts.title, message: opts.message })
    });
  };

  return { handleError };
}
