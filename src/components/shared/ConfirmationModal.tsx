"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'destructive' | 'primary' | 'success' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = 'primary',
}: ConfirmationModalProps) {
  
  const variantStyles = {
    destructive: {
      bg: "bg-red-50 dark:bg-red-900/10",
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      button: "bg-red-600 hover:bg-red-700",
      btnVariant: "destructive" as const
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      button: "bg-emerald-600 hover:bg-emerald-700",
      btnVariant: "default" as const
    },
    primary: {
      bg: "bg-indigo-50 dark:bg-indigo-900/10",
      icon: <Info className="h-5 w-5 text-indigo-600" />,
      button: "bg-indigo-600 hover:bg-indigo-700",
      btnVariant: "default" as const
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      icon: <Info className="h-5 w-5 text-blue-600" />,
      button: "bg-blue-600 hover:bg-blue-700",
      btnVariant: "default" as const
    }
  };

  const currentStyles = variantStyles[variant];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0", currentStyles.bg)}>
              {currentStyles.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">{title}</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{description}</DialogDescription>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all rounded-xl"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={currentStyles.btnVariant}
            size="sm"
            onClick={onConfirm}
            className={cn("h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 shadow-lg", currentStyles.button, variant !== 'destructive' && 'text-white')}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
