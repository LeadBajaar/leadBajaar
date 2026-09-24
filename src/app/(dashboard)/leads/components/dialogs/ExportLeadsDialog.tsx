'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, FileDown, DownloadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import { useModalHistory } from '@/hooks/use-modal-history'
import { cn } from '@/lib/utils'

interface ExportLeadsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isExporting: boolean;
  isExportSuccess?: boolean;
  onExport: (all: boolean) => void;
  onCancel: () => void;
}

export const ExportLeadsDialog: React.FC<ExportLeadsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedCount,
  isExporting,
  isExportSuccess,
  onExport,
  onCancel
}) => {
  const handleOpenChange = useModalHistory(isOpen, onOpenChange, 'exportLeadsDialog');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[450px] p-0 overflow-hidden bg-[var(--crm-surface-1)] border-[var(--crm-border)] sm:rounded-2xl shadow-2xl max-sm:w-full max-sm:max-w-none max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:rounded-none max-sm:border-0 max-sm:flex max-sm:flex-col">
        <div className="px-6 py-8 flex flex-col items-center text-center border-b border-[var(--crm-border)] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-indigo-950/20 shrink-0">
          <div className={cn(
            "h-16 w-16 rounded-3xl flex items-center justify-center mb-5 shadow-sm border transition-all duration-300",
            isExportSuccess 
              ? "bg-green-100 dark:bg-green-900/30 border-green-200/50 dark:border-green-500/20 text-green-600 dark:text-green-400"
              : "bg-blue-100 dark:bg-indigo-900/30 border-blue-200/50 dark:border-indigo-500/20 text-blue-600 dark:text-indigo-400"
          )}>
            {isExportSuccess ? <CheckCircle2 className="h-8 w-8" /> : <DownloadCloud className="h-8 w-8" />}
          </div>
          <DialogTitle className="text-xl font-bold text-[var(--crm-text-primary)]">
            {isExportSuccess ? "Export Complete" : "Export Leads"}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-[var(--crm-text-secondary)] max-w-[280px]">
            {isExportSuccess 
              ? "Your leads have been successfully exported."
              : "Download your leads data as a CSV spreadsheet."}
          </DialogDescription>
        </div>

        <div className="p-6 grid gap-4 bg-[var(--crm-surface-1)] overflow-y-auto">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => onExport(false)}
              disabled={isExporting || isExportSuccess}
              className="group relative flex items-start gap-4 p-4 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center border border-[var(--crm-border)] group-hover:bg-blue-100 group-hover:border-blue-200 dark:group-hover:bg-blue-900/50 dark:group-hover:border-blue-700 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-[var(--crm-text-secondary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-[var(--crm-text-primary)] mb-1">Export Selected</h4>
                <p className="text-[13px] text-[var(--crm-text-secondary)] leading-snug">
                  Download only the {selectedCount} leads currently selected.
                </p>
              </div>
              {isExporting && (
                 <div className="absolute right-4 top-4">
                   <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                 </div>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onExport(true)}
            disabled={isExporting || isExportSuccess}
            className={cn(
              "group relative flex items-start gap-4 p-4 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-1)] transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
              selectedCount === 0 ? "hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10" : "hover:border-[var(--crm-text-tertiary)] hover:bg-[var(--crm-surface-2)]"
            )}
          >
            <div className={cn(
              "h-10 w-10 shrink-0 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center border border-[var(--crm-border)] transition-colors",
              selectedCount === 0 ? "group-hover:bg-blue-100 group-hover:border-blue-200 dark:group-hover:bg-blue-900/50 dark:group-hover:border-blue-700" : "group-hover:bg-[var(--crm-surface-3)]"
            )}>
              <FileSpreadsheet className={cn(
                "h-5 w-5 text-[var(--crm-text-secondary)] transition-colors",
                selectedCount === 0 ? "group-hover:text-blue-600 dark:group-hover:text-blue-400" : "group-hover:text-[var(--crm-text-primary)]"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-[var(--crm-text-primary)] mb-1">Export All Leads</h4>
              <p className="text-[13px] text-[var(--crm-text-secondary)] leading-snug">
                Download your entire leads database as a CSV file.
              </p>
            </div>
            {isExporting && selectedCount === 0 && (
               <div className="absolute right-4 top-4">
                 <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
               </div>
            )}
          </button>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[var(--crm-border)] bg-[var(--crm-surface-2)]/50 shrink-0 max-sm:mt-auto">
          <Button
            variant="outline"
            onClick={() => { onCancel(); handleOpenChange(false); }}
            disabled={isExporting || isExportSuccess}
            className="w-full h-10 max-sm:h-12 rounded-xl font-medium shadow-sm bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-2)] transition-colors"
          >
            {isExportSuccess ? 'Close' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
