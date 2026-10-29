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
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const didPushRef = useRef(false);
  const isPoppingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handlePopState = () => {
      if (isOpen && window.history.state?.modal !== modalId) {
        isPoppingRef.current = true;
        didPushRef.current = false;
        onOpenChangeRef.current(false);
      }
    };

    if (isOpen) {
      isPoppingRef.current = false;
      // Delay pushState to allow any pending history.back() from closing modals to process first.
      timeoutId = setTimeout(() => {
        try {
          const currentState = window.history.state || {};
          window.history.pushState({ ...currentState, modal: modalId }, '');
          didPushRef.current = true;
          window.addEventListener('popstate', handlePopState);
        } catch {
          // Ignore history errors if any
        }
      }, 50);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, modalId]);

  // Clean up history state only when isOpen transitions from true to false
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      // Modal closed programmatically (not via browser back button)
      if (didPushRef.current && !isPoppingRef.current) {
        didPushRef.current = false;
        if (typeof window !== 'undefined' && window.history.state?.modal === modalId) {
          window.history.back();
        }
      }
      isPoppingRef.current = false;
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, modalId]);

  const handleOpenChange = useCallback((open: boolean) => {
    onOpenChangeRef.current(open);
  }, []);

  return handleOpenChange;
}
