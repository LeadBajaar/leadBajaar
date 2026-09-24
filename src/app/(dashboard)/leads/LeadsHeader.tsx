'use client'

import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TableColumnToggle } from '@/components/ui/table-column-toggle'
import { columns } from './types'

interface LeadsHeaderProps {
  visibleColumns: string[];
  handleColumnToggle: (columnId: string) => void;
  setShowStageManager: (show: boolean) => void;
  setShowNewLead: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  handleImportClick: () => void;
  openFacebookRetrieval: () => void;
}

export const LeadsHeader: React.FC<LeadsHeaderProps> = ({
  visibleColumns,
  handleColumnToggle,
  setShowStageManager,
  setShowNewLead,
  setShowExportDialog,
  handleImportClick,
  openFacebookRetrieval
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1.5 px-2 border-b bg-[var(--crm-surface-1)]" style={{ borderColor: 'var(--crm-border)' }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2 border-r border-[var(--crm-border)] pr-4">
          <h2 className="text-[13px] font-medium text-[var(--crm-text-primary)]">Leads</h2>
          <i className="ti ti-info-circle text-[14px] text-[var(--crm-text-tertiary)]" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--r-sm)] bg-[var(--crm-surface-2)] text-[12px] font-medium text-[var(--crm-text-secondary)] cursor-pointer hover:text-[var(--crm-text-primary)] transition-colors">
          <i className="ti ti-users-group text-emerald-500" />
          <span>All Leads</span>
          <i className="ti ti-chevron-down text-[10px]" />
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        <TableColumnToggle
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setShowStageManager(true)}
                className="h-7 px-2.5 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-[12px] font-extrabold rounded-[6px] border border-slate-300 dark:border-slate-650 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shadow-sm"
              >
                <i className="ti ti-settings text-slate-600 dark:text-slate-400" />
                <span>View settings</span>
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Manage Lead Stages</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-7 px-2.5 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[12px] font-extrabold rounded-[6px] border border-slate-300 dark:border-slate-650 whitespace-nowrap shadow-sm">
          <span onClick={handleImportClick} className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
            <i className="ti ti-download text-slate-600 dark:text-slate-400" />
            Import
          </span>
          <span className="text-slate-300 dark:text-slate-650">/</span>
          <span onClick={() => setShowExportDialog(true)} className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
            <i className="ti ti-upload text-slate-600 dark:text-slate-400" />
            Export
          </span>
        </div>

        <button
          onClick={openFacebookRetrieval}
          className="h-7 px-2.5 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-[12px] font-extrabold rounded-[6px] border border-slate-300 dark:border-slate-650 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shadow-sm"
        >
          <i className="ti ti-brand-facebook text-slate-600 dark:text-slate-400" />
          <span className="hidden lg:inline">Sync</span>
        </button>

        <button
          onClick={() => setShowNewLead(true)}
          className="h-7 px-4 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#FE4548] to-[#FF6E54] hover:from-[#FF6E54] hover:to-[#FE4548] text-white text-[12px] font-extrabold rounded-full shadow-sm shadow-rose-500/15 border border-[#FE4548]/10 hover:scale-[1.05] active:scale-[0.95] transition-all ml-2 whitespace-nowrap"
        >
          <i className="ti ti-plus text-[12px] font-extrabold" />
          New Lead
        </button>
      </div>
    </div>
  )
}
