'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from "@/components/ui/separator"
import {
  Search, Loader2, Thermometer, Tag, Globe, RefreshCcw, Plus,
  Settings2, FileDown, FileUp, Facebook
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TableColumnToggle } from '@/components/ui/table-column-toggle'
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { cn } from "@/lib/utils"
import { defaultStages, sourceConfig, columns } from './types'
import { DateRange } from "react-day-picker"

interface LeadsFiltersProps {
  filters: {
    search: string;
    status: string;
    stage: string;
    source: string;
    dateRange: DateRange | undefined;
    createdAt: DateRange | undefined;
  };
  handleFilterChange: (key: string, value: any) => void;
  clearFilters: () => void;
  isSearching: boolean;
  setShowNewLead?: (show: boolean) => void;
  // Shared with Header
  visibleColumns?: string[];
  handleColumnToggle?: (columnId: string) => void;
  setShowStageManager?: (show: boolean) => void;
  setShowExportDialog?: (show: boolean) => void;
  handleImportClick?: () => void;
  openFacebookRetrieval?: () => void;
}

export const LeadsFilters: React.FC<LeadsFiltersProps> = ({
  filters,
  handleFilterChange,
  clearFilters,
  isSearching,
  setShowNewLead,
  visibleColumns,
  handleColumnToggle,
  setShowStageManager,
  setShowExportDialog,
  handleImportClick,
  openFacebookRetrieval
}) => {
  return (
    <div className="shrink-0 flex flex-col border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Row 1: Search and Main Actions */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              )}
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={cn(
                  "pl-9 h-9 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-colors text-xs",
                  isSearching && "border-indigo-300"
                )}
              />
            </div>

            {/* Mobile-only Add Lead button */}
            <Button
              onClick={() => setShowNewLead?.(true)}
              size="icon"
              className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm sm:hidden shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {visibleColumns && handleColumnToggle && (
              <TableColumnToggle
                columns={columns}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
              />
            )}

            {setShowStageManager && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowStageManager(true)}
                      className="h-9 w-9 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Settings2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage Lead Stages</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              onClick={() => setShowNewLead?.(true)}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm text-xs font-bold"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs"
              onClick={() => setShowExportDialog?.(true)}
            >
              <FileDown className="h-4 w-4 lg:mr-1.5" />
              <span className="hidden lg:inline">Export</span>
            </Button>

            <Button
              onClick={() => handleImportClick?.()}
              variant="outline"
              className="h-9 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs"
            >
              <FileUp className="h-4 w-4 lg:mr-1.5" />
              <span className="hidden lg:inline">Import</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => openFacebookRetrieval?.()}
              className="h-9 px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs"
            >
              <Facebook className="h-4 w-4 lg:mr-1.5" />
              <span className="hidden lg:inline">Sync Leads</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Row 2: Filters - Hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto px-4 pt-1 pb-2.5 no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {/* Status Group */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/30">
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="h-7 w-[90px] border-none bg-transparent text-[10px] sm:text-[11px] font-medium focus:ring-0">
                <Thermometer className="mr-1 h-3 w-3 text-slate-500 shrink-0" />
                <SelectValue placeholder="Temp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Temp</SelectItem>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-4 bg-slate-200 dark:bg-slate-700" />

            <Select value={filters.stage} onValueChange={(value) => handleFilterChange('stage', value)}>
              <SelectTrigger className="h-7 w-[100px] border-none bg-transparent text-[10px] sm:text-[11px] font-medium focus:ring-0">
                <Tag className="mr-1 h-3 w-3 text-slate-500 shrink-0" />
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {Object.keys(defaultStages).map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/30">
            <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
              <SelectTrigger className="h-7 w-[100px] border-none bg-transparent text-[10px] sm:text-[11px] font-medium focus:ring-0">
                <Globe className="mr-1 h-3 w-3 text-slate-500 shrink-0" />
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.keys(sourceConfig).map((source) => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Group */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/30">
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => handleFilterChange('dateRange', range)}
              placeholder="Last Contact"
              className="h-7 w-[160px] border-none bg-transparent text-[10px] sm:text-[11px] font-medium"
            />
            <Separator orientation="vertical" className="h-4 bg-slate-200 dark:bg-slate-700" />
            <DateRangePicker
              value={filters.createdAt}
              onChange={(range) => handleFilterChange('createdAt', range)}
              placeholder="Created Date"
              className="h-7 w-[160px] border-none bg-transparent text-[10px] sm:text-[11px] font-medium"
            />
          </div>

          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-8 px-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all rounded-lg text-xs font-semibold"
          >
            <RefreshCcw className="mr-1.5 h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
