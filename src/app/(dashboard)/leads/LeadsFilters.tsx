'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from "@/components/ui/separator"
import {
  Search, Loader2, Thermometer, Tag, Globe, RefreshCcw, Plus,
  Settings2, FileDown, FileUp, Facebook, SlidersHorizontal, ChevronDown, X
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TableColumnToggle } from '@/components/ui/table-column-toggle'
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { cn } from "@/lib/utils"
import { sourceConfig, columns } from './types'
import { DateRange } from "react-day-picker"

interface LeadsFiltersProps {
  filters: {
    search: string;
    status: string[];
    stage: string[];
    source: string[];
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
  onOpenMobileFilters?: () => void;
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
  setViewMode,
  onOpenMobileFilters
}) => {
  const mobileActiveFiltersCount =
    (filters.status.length > 0 ? 1 : 0) +
    (filters.stage.length > 0 ? 1 : 0) +
    (filters.source.length > 0 ? 1 : 0) +
    (filters.dateRange ? 1 : 0) +
    (filters.createdAt ? 1 : 0);

  return (
    <div className="shrink-0 flex flex-col border-b" style={{ borderColor: 'var(--crm-border)' }}>
      {/* Row 1: Search and Main Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-tertiary)] animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-tertiary)]" />
            )}
            <input
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-8 h-10 text-[14px] rounded-lg bg-[var(--crm-surface-2)] hover:bg-[var(--crm-surface-3)] focus:bg-[var(--crm-surface-1)] border border-[var(--crm-border)] focus:border-[var(--crm-blue)] focus:ring-1 focus:ring-[var(--crm-blue)] text-[var(--crm-text-primary)] placeholder:text-[var(--crm-text-tertiary)] outline-none transition-all"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md hover:bg-[var(--crm-surface-3)] flex items-center justify-center text-[var(--crm-text-tertiary)] hover:text-[var(--crm-text-primary)] transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Mobile-only filter button */}
          <div className="sm:hidden flex items-center shrink-0">
            <button
              onClick={() => onOpenMobileFilters?.()}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)] transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {mobileActiveFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-[var(--crm-blue)] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {mobileActiveFiltersCount}
                </span>
              )}
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowStageManager(true)}
              >
                <i className="ti ti-settings" />
                <span className="hidden lg:inline">Manage Stages</span>
              </Button>
            )}

            {(() => {
              const activeFiltersCount = 
                (filters.status.length > 0 ? 1 : 0) +
                (filters.stage.length > 0 ? 1 : 0) +
                (filters.source.length > 0 ? 1 : 0) +
                (filters.dateRange ? 1 : 0) +
                (filters.createdAt ? 1 : 0);

              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={activeFiltersCount > 0 ? "outline" : "secondary"}
                      size="sm"
                      className={cn(
                        "flex items-center gap-1.5 transition-all duration-200",
                        activeFiltersCount > 0 && "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                      )}
                    >
                      <i className="ti ti-filter" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <div 
                          role="button"
                          tabIndex={0}
                          className="ml-0.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 text-primary transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            clearFilters();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--crm-border)] pb-2">
                    <h4 className="font-semibold text-sm">Filters</h4>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:text-primary font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[var(--crm-text-secondary)]">Temperature</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full justify-between h-8 text-xs font-normal transition-all duration-200",
                              filters.status.length > 0 
                                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-[var(--crm-surface-1)] hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                          >
                            <span className="truncate">{filters.status.length > 0 ? `${filters.status.length} selected` : 'All Temps'}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {filters.status.length > 0 && (
                                <div 
                                  role="button"
                                  tabIndex={0}
                                  className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 text-primary transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleFilterChange('status', []);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </div>
                              )}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[250px] overflow-y-auto">
                          {['Hot', 'Warm', 'Cold'].map(temp => (
                            <DropdownMenuCheckboxItem
                              key={temp}
                              checked={filters.status.includes(temp)}
                              onCheckedChange={(checked) => {
                                const next = checked 
                                  ? [...filters.status, temp]
                                  : filters.status.filter(t => t !== temp);
                                handleFilterChange('status', next);
                              }}
                            >
                              {temp}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[var(--crm-text-secondary)]">Stage</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full justify-between h-8 text-xs font-normal transition-all duration-200",
                              filters.stage.length > 0 
                                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-[var(--crm-surface-1)] hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                          >
                            <span className="truncate">{filters.stage.length > 0 ? `${filters.stage.length} selected` : 'All Stages'}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {filters.stage.length > 0 && (
                                <div 
                                  role="button"
                                  tabIndex={0}
                                  className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 text-primary transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleFilterChange('stage', []);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </div>
                              )}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[250px] overflow-y-auto">
                          {Object.keys(stages).map(stage => (
                            <DropdownMenuCheckboxItem
                              key={stage}
                              checked={filters.stage.includes(stage)}
                              onCheckedChange={(checked) => {
                                const next = checked 
                                  ? [...filters.stage, stage]
                                  : filters.stage.filter(s => s !== stage);
                                handleFilterChange('stage', next);
                              }}
                            >
                              {stage}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[var(--crm-text-secondary)]">Source</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full justify-between h-8 text-xs font-normal transition-all duration-200",
                              filters.source.length > 0 
                                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-[var(--crm-surface-1)] hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                          >
                            <span className="truncate">{filters.source.length > 0 ? `${filters.source.length} selected` : 'All Sources'}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {filters.source.length > 0 && (
                                <div 
                                  role="button"
                                  tabIndex={0}
                                  className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 text-primary transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleFilterChange('source', []);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </div>
                              )}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[250px] overflow-y-auto">
                          {Object.keys(sourceConfig).map(source => (
                            <DropdownMenuCheckboxItem
                              key={source}
                              checked={filters.source.includes(source)}
                              onCheckedChange={(checked) => {
                                const next = checked 
                                  ? [...filters.source, source]
                                  : filters.source.filter(s => s !== source);
                                handleFilterChange('source', next);
                              }}
                            >
                              {source}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[var(--crm-text-secondary)]">Last Contact</label>
                      <DateRangePicker
                        value={filters.dateRange}
                        onChange={(range) => handleFilterChange('dateRange', range)}
                        placeholder="Select date range"
                        className="w-full h-8 text-xs border border-input rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[var(--crm-text-secondary)]">Created Date</label>
                      <DateRangePicker
                        value={filters.createdAt}
                        onChange={(range) => handleFilterChange('createdAt', range)}
                        placeholder="Select date range"
                        className="w-full h-8 text-xs border border-input rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            );
          })()}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  More Actions <i className="ti ti-chevron-down ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-lg p-1 text-xs">
                <DropdownMenuItem onClick={() => setShowExportDialog?.(true)} className="gap-2 cursor-pointer">
                  <i className="ti ti-download text-[14px] text-slate-500" /> Export Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleImportClick?.()} className="gap-2 cursor-pointer">
                  <i className="ti ti-upload text-[14px] text-slate-500" /> Import Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openFacebookRetrieval?.()} className="gap-2 cursor-pointer">
                  <i className="ti ti-brand-facebook text-[14px] text-primary" /> Sync Facebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowNewLead?.(true)}
            >
              <i className="ti ti-plus" />
              Add Lead
            </Button>

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

      {/* Mobile-only quick actions row */}
      <div className="sm:hidden grid grid-cols-3 gap-2 px-4 pb-4">
        {setShowExportDialog && (
          <button
            onClick={() => setShowExportDialog(true)}
            className="h-10 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-400 text-[13px] font-medium text-[var(--crm-text-primary)] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <FileDown className="h-4 w-4 text-emerald-500" />
            Export
          </button>
        )}
        {handleImportClick && (
          <button
            onClick={() => handleImportClick()}
            className="h-10 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-700 dark:hover:text-blue-400 text-[13px] font-medium text-[var(--crm-text-primary)] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <FileUp className="h-4 w-4 text-blue-500" />
            Import
          </button>
        )}
        {setShowStageManager && (
          <button
            onClick={() => setShowStageManager(true)}
            className="h-10 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 hover:text-purple-700 dark:hover:text-purple-400 text-[13px] font-medium text-[var(--crm-text-primary)] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Settings2 className="h-4 w-4 text-purple-500" />
            Stages
          </button>
        )}
      </div>
    </div>
  )
}
