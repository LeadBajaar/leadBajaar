import { useEffect, useRef, useCallback } from 'react';

/**
 * A hook to manage modal/drawer state in browser history so the back button can close it.
 * @param isOpen Whether the modal is currently open
 * @param onOpenChange Callback to change the open state
 * @param modalId A unique string identifier for this modal's history state
 * @returns A wrapped onOpenChange handler that manages history cleanup
 */
export function useModalHistory(
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  modalId: string = 'modal'
) {
  const isPopping = useRef(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handlePopState = (e: PopStateEvent) => {
      // Only close if the history state doesn't match our modal ID.
      // If we go back, the state will be the PREVIOUS state (not our modalId).
      if (isOpen && window.history.state?.modal !== modalId) {
        isPopping.current = true;
        onOpenChange(false);
      }
    };

    if (isOpen) {
      isPopping.current = false;
      // Delay pushState to allow any pending history.back() from closing modals to process first.
      timeoutId = setTimeout(() => {
        window.history.pushState({ modal: modalId }, '');
        window.addEventListener('popstate', handlePopState);
      }, 50);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', handlePopState);
      
      if (isOpen && !isPopping.current) {
        // The modal is closing programmatically, we should clean up the history state
        if (window.history.state?.modal === modalId) {
          window.history.back();
        }
      }
    };
  }, [isOpen, onOpenChange, modalId]);

  const handleOpenChange = useCallback((open: boolean) => {
    onOpenChange(open);
  }, [onOpenChange]);

  return handleOpenChange;
}
