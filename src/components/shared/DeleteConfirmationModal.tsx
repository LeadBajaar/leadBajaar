"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed? This cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-none mb-2">{title}</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{description}</DialogDescription>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-xs font-bold uppercase tracking-tight text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all rounded-lg"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="h-9 px-4 text-xs font-bold uppercase tracking-tight bg-red-600 hover:bg-red-700 transition-all rounded-lg flex items-center gap-2 shadow-sm border-0"
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
