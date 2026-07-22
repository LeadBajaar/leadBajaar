'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sourceConfig } from '../types'
import { addDays, endOfDay, format, isSameDay, startOfDay } from 'date-fns'

interface MobileFilterBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: any;
  handleFilterChange: (key: string, value: any) => void;
  clearFilters: () => void;
  stages: Record<string, any>;
}

const FilterChip = ({
  active,
  onClick,
  children
}: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={cn(
      "h-9 px-3.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-colors",
      active
        ? "bg-[var(--crm-accent)] text-white border-[var(--crm-accent)]"
        : "bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] border-[var(--crm-border)]"
    )}
  >
    {children}
  </button>
)

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--crm-text-tertiary)] mb-2">
    {children}
  </div>
)

export const MobileFilterBottomSheet: React.FC<MobileFilterBottomSheetProps> = ({
  isOpen,
  onOpenChange,
  filters,
  handleFilterChange,
  clearFilters,
  stages
}) => {
  const toggleValue = (key: 'status' | 'stage' | 'source', value: string) => {
    const current: string[] = filters[key] || [];
    handleFilterChange(
      key,
      current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    );
  };

  const activeCount =
    (filters.status.length > 0 ? 1 : 0) +
    (filters.stage.length > 0 ? 1 : 0) +
    (filters.source.length > 0 ? 1 : 0) +
    (filters.dateRange ? 1 : 0) +
    (filters.createdAt ? 1 : 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed !top-auto !bottom-0 !left-0 !right-0 !translate-x-0 !translate-y-0 w-full sm:w-full rounded-t-3xl rounded-b-none border-t border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-0 m-0 max-w-none max-h-[85vh] flex flex-col slide-in-from-bottom-[100%] duration-300 [&>button.absolute]:hidden"
      >
        <DialogTitle className="sr-only">Filters</DialogTitle>
        <DialogDescription className="sr-only">Filter leads list</DialogDescription>

        <div className="flex-none pt-3 pb-2 px-4 border-b border-[var(--crm-border)]">
          <div className="w-12 h-1.5 bg-[var(--crm-surface-3)] rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[var(--crm-text-secondary)]" />
              <h3 className="text-lg font-semibold text-[var(--crm-text-primary)]">
                Filters
              </h3>
              {activeCount > 0 && (
                <span className="h-5 min-w-5 px-1.5 rounded-full bg-[var(--crm-accent)] text-white text-[11px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-full">
              <X className="h-5 w-5 text-[var(--crm-text-tertiary)]" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
          <div>
            <SectionLabel>Stage</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(stages).map((stageName) => (
                <FilterChip
                  key={stageName}
                  active={filters.stage.includes(stageName)}
                  onClick={() => toggleValue('stage', stageName)}
                >
                  {stageName}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Temperature</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {['Hot', 'Warm', 'Cold'].map((temp) => (
                <FilterChip
                  key={temp}
                  active={filters.status.includes(temp)}
                  onClick={() => toggleValue('status', temp)}
                >
                  {temp}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Source</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(sourceConfig).map((source) => (
                <FilterChip
                  key={source}
                  active={filters.source.includes(source)}
                  onClick={() => toggleValue('source', source)}
                >
                  {source}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Created Date</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                active={!filters.createdAt}
                onClick={() => handleFilterChange('createdAt', undefined)}
              >
                All time
              </FilterChip>
              {[
                { label: 'Today', days: 0 },
                { label: 'Last 7 days', days: 7 },
                { label: 'Last 30 days', days: 30 },
                { label: 'Last 90 days', days: 90 },
              ].map(({ label, days }) => {
                const active = !!(
                  filters.createdAt?.from &&
                  filters.createdAt?.to &&
                  isSameDay(filters.createdAt.to, new Date()) &&
                  isSameDay(filters.createdAt.from, addDays(new Date(), -days))
                );
                return (
                  <FilterChip
                    key={label}
                    active={active}
                    onClick={() =>
                      handleFilterChange('createdAt', {
                        from: startOfDay(addDays(new Date(), -days)),
                        to: endOfDay(new Date())
                      })
                    }
                  >
                    {label}
                  </FilterChip>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2.5">
              <div className="flex-1">
                <div className="text-[11px] text-[var(--crm-text-tertiary)] mb-1">From</div>
                <input
                  type="date"
                  value={filters.createdAt?.from ? format(filters.createdAt.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'createdAt',
                      e.target.value
                        ? { from: startOfDay(new Date(e.target.value)), to: filters.createdAt?.to }
                        : filters.createdAt?.to ? { from: undefined, to: filters.createdAt.to } : undefined
                    )
                  }
                  className="w-full h-11 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-3 text-[14px] text-[var(--crm-text-primary)]"
                />
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-[var(--crm-text-tertiary)] mb-1">To</div>
                <input
                  type="date"
                  value={filters.createdAt?.to ? format(filters.createdAt.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'createdAt',
                      e.target.value
                        ? { from: filters.createdAt?.from, to: endOfDay(new Date(e.target.value)) }
                        : filters.createdAt?.from ? { from: filters.createdAt.from, to: undefined } : undefined
                    )
                  }
                  className="w-full h-11 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-3 text-[14px] text-[var(--crm-text-primary)]"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="flex-none p-4 pt-3 border-t border-[var(--crm-border)] flex gap-3 bg-[var(--crm-surface-1)]">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-full text-[var(--crm-text-primary)] border-[var(--crm-border)] font-medium"
            onClick={() => {
              clearFilters();
              onOpenChange(false);
            }}
          >
            Clear All
          </Button>
          <Button
            className="flex-1 h-12 rounded-full bg-[var(--crm-accent)] hover:opacity-90 text-white font-medium"
            onClick={() => onOpenChange(false)}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
