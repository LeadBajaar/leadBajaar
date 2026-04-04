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
import { AlertCircle, XCircle } from 'lucide-react';

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {errorModal.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
              We encountered a following issue while processing your request:
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="flex gap-3">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {errorModal.message}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={hideError}
              className="px-6 font-bold"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                // If it's a critical error (like auth), we can provide a retry or logout option here
                hideError();
              }}
              className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Got it
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
