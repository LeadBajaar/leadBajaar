'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, CheckCircle2, Loader2, FileSpreadsheet, AlertCircle, XCircle } from 'lucide-react'
import { ColumnMapping, ImportError, ImportStats } from './types'

interface ImportLeadsDialogProps {
  showMapping: boolean;
  setShowMapping: (show: boolean) => void;
  resetImport: () => void;
  importError: string | null;
  columnMapping: ColumnMapping[];
  handleColumnMapChange: (csvHeader: string, leadField: string) => void;
  isImporting: boolean;
  handleImport: () => void;
  importStats: ImportStats | null;
  showGeneratingReport: boolean;
}

export const ImportLeadsDialog: React.FC<ImportLeadsDialogProps> = ({
  showMapping,
  setShowMapping,
  resetImport,
  importError,
  columnMapping,
  handleColumnMapChange,
  isImporting,
  handleImport,
  importStats,
  showGeneratingReport
}) => {
  return (
    <Dialog open={showMapping} onOpenChange={(open) => !open && resetImport()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Import Leads from CSV</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-medium mt-0.5">Map your CSV columns to LeadBajaar fields</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-950/30 no-scrollbar">
          <div className="space-y-6">
            {importError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 animate-in fade-in slide-in-from-top-2 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm mb-1">Import Error</div>
                  <p className="text-sm opacity-90 leading-relaxed font-medium">{importError}</p>
                </div>
              </div>
            )}

            {/* Mapping Section - Only show if not importing and no stats yet */}
            {!isImporting && !importStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {columnMapping.map((mapping) => (
                  <div
                    key={mapping.csvHeader}
                    className="flex flex-col space-y-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate pr-2">
                        CSV Column
                      </span>
                      {mapping.leadField !== 'skip' && (
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mb-1">
                      {mapping.csvHeader}
                    </div>
                    <Select
                      value={mapping.leadField}
                      onValueChange={(value) => handleColumnMapChange(mapping.csvHeader, value)}
                    >
                      <SelectTrigger className="w-full h-8.5 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-[11px] font-semibold rounded-xl focus:ring-indigo-500/20">
                        <SelectValue placeholder="Map to..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-slate-200 dark:border-slate-800">
                        <SelectItem value="skip" className="text-xs font-medium text-slate-400 italic">Skip this column</SelectItem>
                        <SelectItem value="name" className="text-xs font-bold">Full Name</SelectItem>
                        <SelectItem value="email" className="text-xs font-bold">Email</SelectItem>
                        <SelectItem value="phone" className="text-xs font-bold">Phone Number</SelectItem>
                        <SelectItem value="company" className="text-xs font-medium">Company</SelectItem>
                        <SelectItem value="city" className="text-xs font-medium">City</SelectItem>
                        <SelectItem value="profession" className="text-xs font-medium">Profession</SelectItem>
                        <SelectItem value="deal_value" className="text-xs font-medium">Deal Value</SelectItem>
                        <SelectItem value="stage" className="text-xs font-medium">Stage</SelectItem>
                        <SelectItem value="status" className="text-xs font-medium">Temperature</SelectItem>
                        <SelectItem value="source" className="text-xs font-medium">Source</SelectItem>
                        <SelectItem value="notes" className="text-xs font-medium">Notes/Comment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Progress/Importing View */}
            {isImporting && (
              <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                  <div className="h-24 w-24 rounded-full border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Processing Data</h3>
                <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                  We're currently importing and validating your leads. Please keep this window open.
                </p>
              </div>
            )}

            {/* Results/Stats View */}
            {importStats && !showGeneratingReport && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Rows</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{importStats.totalRows}</div>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 text-center shadow-sm">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Success</div>
                    <div className="text-2xl font-black text-emerald-600">{importStats.successfulRows}</div>
                  </div>
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/30 text-center shadow-sm">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Skipped</div>
                    <div className="text-2xl font-black text-amber-600">{importStats.skippedRows}</div>
                  </div>
                </div>

                {importStats.errors.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Error Log ({importStats.errors.length})
                      </h4>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-2 space-y-1.5 no-scrollbar">
                      {importStats.errors.map((error, index) => (
                        <div key={index} className="text-[11px] flex items-center gap-4 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <span className="font-bold text-slate-400 shrink-0 w-12">Row {error.row}</span>
                          <div className="flex-1 truncate">
                             <span className="font-bold text-red-500 mr-2">{error.reason}</span>
                             <span className="text-slate-400 font-medium">Field: {error.field}</span>
                          </div>
                          <div className="text-[10px] font-medium text-slate-300 italic truncate max-w-[100px]">
                            {error.value || 'null'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3 sm:gap-0 shrink-0">
          <Button variant="ghost" onClick={resetImport} disabled={isImporting} className="rounded-xl font-semibold text-slate-500">
            {importStats ? 'Close' : 'Cancel'}
          </Button>
          {!importStats && (
            <Button
              onClick={handleImport}
              disabled={isImporting || columnMapping.length === 0}
              className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 h-10 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none font-bold text-sm transition-all active:scale-95"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Start Import
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
