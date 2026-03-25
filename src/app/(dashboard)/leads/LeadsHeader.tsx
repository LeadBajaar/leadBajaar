'use client'

import React from 'react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TableColumnToggle } from '@/components/ui/table-column-toggle'
import { Settings2, Plus, FileDown, FileUp, Facebook } from 'lucide-react'
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
    <CardHeader className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Leads</CardTitle>
        <p className="text-xs text-slate-500 mt-0.5">Manage and track your sales pipeline</p>
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
              <Button variant="outline" size="icon" onClick={() => setShowStageManager(true)}
                className="h-9 w-9 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Settings2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage Lead Stages</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          onClick={() => setShowNewLead(true)}
          className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
          onClick={() => setShowExportDialog(true)}
        >
          <FileDown className="h-4 w-4 lg:mr-2" />
          <span className="hidden lg:inline">Export</span>
        </Button>
        <Button
          onClick={handleImportClick}
          variant="outline"
          className="h-9 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
        >
          <FileUp className="mr-1.5 h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          onClick={openFacebookRetrieval}
          className="h-9 px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
        >
          <Facebook className="h-4 w-4 lg:mr-2" />
          <span className="hidden lg:inline">Sync Leads</span>
        </Button>
      </div>
    </CardHeader>
  )
}
