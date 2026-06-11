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
                className="flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-2)] rounded-[var(--r-sm)] transition-colors"
              >
                <i className="ti ti-settings" />
                View settings
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Manage Lead Stages</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-1 px-2 py-1 text-[12px] font-medium text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-2)] rounded-[var(--r-sm)] transition-colors cursor-pointer">
          <i className="ti ti-download" />
          <span onClick={() => setShowExportDialog(true)}>Export</span>
          <span className="mx-1 opacity-50">/</span>
          <span onClick={handleImportClick}>Import</span>
        </div>

        <button
          onClick={openFacebookRetrieval}
          className="flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-2)] rounded-[var(--r-sm)] transition-colors"
        >
          <i className="ti ti-brand-facebook" />
          <span className="hidden lg:inline">Sync</span>
        </button>

        <button
          onClick={() => setShowNewLead(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-[var(--crm-text-primary)] text-white text-[12px] font-medium rounded-[var(--r-sm)] hover:opacity-90 transition-opacity ml-2"
        >
          <i className="ti ti-plus" />
          New Lead
        </button>
      </div>
    </div>
  )
}
