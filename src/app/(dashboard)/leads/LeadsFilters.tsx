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
    <div className="shrink-0 flex flex-col">
      {/* Row 1: Search and Main Actions */}
      <div className="px-4 py-2.5">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1 sm:w-[260px] md:w-[300px] min-w-0">
            {isSearching ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            )}
            <input
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-8 h-8 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all shadow-xs"
            />
            {filters.search && (
              <Button
                variant="ghost" size="icon"
                onClick={() => handleFilterChange('search', '')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Mobile-only filter button */}
          <div className="sm:hidden flex items-center shrink-0">
            <Button
              variant="outline" size="icon"
              onClick={() => onOpenMobileFilters?.()}
              className="relative flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {mobileActiveFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {mobileActiveFiltersCount}
                </span>
              )}
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
              <Button
                variant="outline"
                onClick={() => setShowStageManager(true)}
                className="h-8 px-3 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all whitespace-nowrap shadow-xs w-auto"
              >
                <i className="ti ti-settings text-slate-500 dark:text-slate-400" />
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
                      variant="outline"
                      className={cn(
                        "h-8 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shadow-xs w-auto",
                        activeFiltersCount > 0 
                          ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <i className={cn("ti ti-filter text-[13px]", activeFiltersCount > 0 ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <div 
                          role="button"
                          tabIndex={0}
                          className="ml-0.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-indigo-700/50 text-white transition-colors"
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
                  <PopoverContent align="end" className="w-80 p-4 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800 font-sans">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-semibold text-xs font-heading text-slate-900 dark:text-white">Filters</h4>
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium p-0 h-auto w-auto"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Temperature</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full justify-between h-8 text-xs font-normal transition-all rounded-xl",
                              filters.status.length > 0 
                                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
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
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Stage</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full justify-between h-8 text-xs font-normal transition-all rounded-xl",
                              filters.stage.length > 0 
                                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
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
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Source</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={cn(
                              "w-full justify-between h-8 text-xs font-normal transition-all rounded-xl",
                              filters.source.length > 0 
                                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
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
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Last Contact</label>
                      <DateRangePicker
                        value={filters.dateRange}
                        onChange={(range) => handleFilterChange('dateRange', range)}
                        placeholder="Select date range"
                        className="w-full h-8 text-xs border border-slate-200 dark:border-slate-800 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Created Date</label>
                      <DateRangePicker
                        value={filters.createdAt}
                        onChange={(range) => handleFilterChange('createdAt', range)}
                        placeholder="Select date range"
                        className="w-full h-8 text-xs border border-slate-200 dark:border-slate-800 rounded-xl"
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
                <Button variant="outline" className="h-8 px-3 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all whitespace-nowrap shadow-xs w-auto">
                  More Actions <i className="ti ti-chevron-down text-slate-500 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 text-xs border-slate-200 dark:border-slate-800">
                <DropdownMenuItem onClick={() => setShowExportDialog?.(true)} className="gap-2 cursor-pointer rounded-lg text-xs">
                  <i className="ti ti-upload text-[14px] text-slate-500" /> Export Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleImportClick?.()} className="gap-2 cursor-pointer rounded-lg text-xs">
                  <i className="ti ti-download text-[14px] text-slate-500" /> Import Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openFacebookRetrieval?.()} className="gap-2 cursor-pointer rounded-lg text-xs">
                  <i className="ti ti-brand-facebook text-[14px] text-primary" /> Sync Facebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="default"
              onClick={() => setShowNewLead?.(true)}
              className="h-8 px-3.5 flex items-center justify-center gap-1.5 bg-[#FE4548] hover:bg-[#FF6E54] text-white text-xs font-semibold rounded-xl shadow-xs transition-all whitespace-nowrap w-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Lead
            </Button>

            <div className="flex bg-slate-100 dark:bg-slate-850 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button /* TODO: Segment control pattern */
                onClick={() => setViewMode('table')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer",
                  viewMode === 'table' 
                    ? "bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white font-semibold" 
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                )}
              >
                <i className="ti ti-list mr-1" />
                Table
              </button>
              <button /* TODO: Segment control pattern */
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer",
                  viewMode === 'kanban' 
                    ? "bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white font-semibold" 
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
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
      <div className="sm:hidden flex items-center justify-between gap-2 px-4 pb-3 pt-1">
        {setShowExportDialog && (
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="flex-1 h-8 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs font-semibold text-[var(--crm-text-primary)] flex items-center justify-center gap-1.5 transition-all w-auto"
          >
            <FileDown className="h-3.5 w-3.5 text-emerald-500" />
            Export
          </Button>
        )}
        {handleImportClick && (
          <Button
            variant="outline"
            onClick={() => handleImportClick()}
            className="flex-1 h-8 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-semibold text-[var(--crm-text-primary)] flex items-center justify-center gap-1.5 transition-all w-auto"
          >
            <FileUp className="h-3.5 w-3.5 text-blue-500" />
            Import
          </Button>
        )}
        {setShowStageManager && (
          <Button
            variant="outline"
            onClick={() => setShowStageManager(true)}
            className="flex-1 h-8 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs font-semibold text-[var(--crm-text-primary)] flex items-center justify-center gap-1.5 transition-all w-auto"
          >
            <Settings2 className="h-3.5 w-3.5 text-purple-500" />
            Stages
          </Button>
        )}
      </div>
    </div>
  )
}
