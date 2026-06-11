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
import { sourceConfig, columns } from './types'
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
  stages: Record<string, any>;
  viewMode: 'table' | 'kanban';
  setViewMode: (mode: 'table' | 'kanban') => void;
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
  openFacebookRetrieval,
  stages,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="shrink-0 flex flex-col border-b" style={{ borderColor: 'var(--crm-border)' }}>
      {/* Row 1: Search and Main Actions */}
      <div className="px-3 py-1.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              {isSearching ? (
                <i className="ti ti-loader absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[var(--crm-text-tertiary)] animate-spin" />
              ) : (
                <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[var(--crm-text-tertiary)]" />
              )}
              <input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="crm-input !pl-8 h-7 text-[12px]"
              />
            </div>

            {/* Mobile-only Add Lead button */}
            <button
              onClick={() => setShowNewLead?.(true)}
              className="btn btn-primary sm:hidden shrink-0 w-9 h-9 p-0 justify-center"
            >
              <i className="ti ti-plus" />
            </button>
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
              <button
                onClick={() => setShowStageManager(true)}
                className="btn btn-secondary h-8 px-3 text-[12px]"
              >
                <i className="ti ti-settings" />
                <span className="hidden lg:inline">Manage Stages</span>
              </button>
            )}

            <button
              onClick={() => setShowExportDialog?.(true)}
              className="btn btn-secondary h-8 px-3 text-[12px]"
            >
              <i className="ti ti-download" />
              <span className="hidden lg:inline">Export</span>
            </button>

            <button
              onClick={() => handleImportClick?.()}
              className="btn btn-secondary h-8 px-3 text-[12px]"
            >
              <i className="ti ti-upload" />
              <span className="hidden lg:inline">Import</span>
            </button>

            <button
              onClick={() => openFacebookRetrieval?.()}
              className="btn btn-secondary h-8 px-3 text-[12px]"
            >
              <i className="ti ti-brand-facebook" />
              <span className="hidden lg:inline">Sync Leads</span>
            </button>

            <button
              onClick={() => setShowNewLead?.(true)}
              className="btn btn-primary h-8 px-3 text-[12px]"
            >
              <i className="ti ti-plus" />
              Add Lead
            </button>

            <div className="w-[1px] h-4 bg-[var(--crm-border)] mx-1" />

            <div className="flex bg-[var(--crm-surface-2)] p-0.5 rounded-[var(--r-md)] border border-[var(--crm-border)]">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "px-2 py-1 rounded-[var(--r-sm)] text-[11px] font-semibold transition-all",
                  viewMode === 'table' ? "bg-[var(--crm-surface-1)] shadow-sm text-[var(--crm-text-primary)]" : "text-[var(--crm-text-tertiary)] hover:text-[var(--crm-text-secondary)]"
                )}
              >
                <i className="ti ti-list mr-1" />
                Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "px-2 py-1 rounded-[var(--r-sm)] text-[11px] font-semibold transition-all",
                  viewMode === 'kanban' ? "bg-[var(--crm-surface-1)] shadow-sm text-[var(--crm-text-primary)]" : "text-[var(--crm-text-tertiary)] hover:text-[var(--crm-text-secondary)]"
                )}
              >
                <i className="ti ti-layout-kanban mr-1" />
                Board
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Filters - Hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto px-4 pt-1 pb-2.5 no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {/* Status Group */}
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--r-md)] bg-[var(--crm-surface-2)]">
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="h-7 w-[90px] border-none bg-transparent text-[11px] font-medium focus:ring-0 shadow-none text-[var(--crm-text-primary)]">
                <i className="ti ti-temperature text-[13px] mr-1 text-[var(--crm-text-secondary)] shrink-0" />
                <SelectValue placeholder="Temp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Temp</SelectItem>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-[1px] h-4 bg-[var(--crm-border)]" />

            <Select value={filters.stage} onValueChange={(value) => handleFilterChange('stage', value)}>
              <SelectTrigger className="h-7 w-[100px] border-none bg-transparent text-[11px] font-medium focus:ring-0 shadow-none text-[var(--crm-text-primary)]">
                <i className="ti ti-tag text-[13px] mr-1 text-[var(--crm-text-secondary)] shrink-0" />
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {Object.keys(stages).map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-[var(--r-md)] bg-[var(--crm-surface-2)]">
            <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
              <SelectTrigger className="h-7 w-[100px] border-none bg-transparent text-[11px] font-medium focus:ring-0 shadow-none text-[var(--crm-text-primary)]">
                <i className="ti ti-world text-[13px] mr-1 text-[var(--crm-text-secondary)] shrink-0" />
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
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--r-md)] bg-[var(--crm-surface-2)]">
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => handleFilterChange('dateRange', range)}
              placeholder="Last Contact"
              className="h-7 w-[160px] border-none bg-transparent text-[11px] font-medium shadow-none text-[var(--crm-text-primary)]"
            />
            <div className="w-[1px] h-4 bg-[var(--crm-border)]" />
            <DateRangePicker
              value={filters.createdAt}
              onChange={(range) => handleFilterChange('createdAt', range)}
              placeholder="Created Date"
              className="h-7 w-[160px] border-none bg-transparent text-[11px] font-medium shadow-none text-[var(--crm-text-primary)]"
            />
          </div>

          <button
            onClick={clearFilters}
            className="filter-pill"
          >
            <i className="ti ti-refresh" />
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
