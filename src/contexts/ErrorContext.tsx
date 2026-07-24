'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, XCircle, WifiOff } from 'lucide-react';

interface ErrorOptions {
  title?: string;
  message: string;
}

interface ErrorContextType {
  showError: (options: ErrorOptions) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: 'Error Occurred',
    message: '',
  });

  const showError = ({ title, message }: ErrorOptions) => {
    setErrorModal({
      isOpen: true,
      title: title || 'Error Occurred',
      message: message,
    });
  };

  const hideError = () => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  };

  // Global listener for crashes/unhandled rejections that happen outside React components
  React.useEffect(() => {
    const handleGlobalError = (event: any) => {
      const { title, message } = event.detail;
      showError({ title, message });
    };

    window.addEventListener('app-global-error', handleGlobalError);
    return () => window.removeEventListener('app-global-error', handleGlobalError);
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}

      <Dialog open={errorModal.isOpen} onOpenChange={hideError}>
        <DialogContent className="sm:max-w-[400px] p-6">
          <DialogHeader className="mb-0">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                {errorModal.message?.toLowerCase().includes('internet connection') ? (
                  <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {errorModal.title}
              </DialogTitle>
              <DialogDescription className="text-[15px] text-slate-600 dark:text-slate-300 leading-snug">
                {errorModal.message}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogFooter className="mt-6 sm:justify-center">
            <Button
              type="button"
              onClick={hideError}
              className="px-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-medium w-full sm:w-auto"
            >
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}
