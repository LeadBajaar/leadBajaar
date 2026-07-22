'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, MessageSquare, Tag } from 'lucide-react'

interface MobileBulkActionBarProps {
  selectedCount: number;
  totalCount?: number;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  onBroadcast: () => void;
  onChangeStage: () => void;
  onDelete: () => void;
}

export const MobileBulkActionBar: React.FC<MobileBulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onBroadcast,
  onChangeStage,
  onDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--crm-surface-1)] border-t border-[var(--crm-border)] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.15)] pb-safe animate-in slide-in-from-bottom-full duration-300">
      <div className="flex flex-col">
        {/* Header line */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--crm-border)]">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--crm-accent)] text-white text-[11px] font-bold">
              {selectedCount}
            </div>
            <span className="text-[13px] font-semibold text-[var(--crm-text-primary)]">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            {onSelectAll && totalCount !== undefined && selectedCount < totalCount && (
              <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-7 text-xs text-[var(--crm-accent)] font-medium">
                Select all ({totalCount})
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-7 text-xs text-[var(--crm-text-tertiary)] font-medium">
              Clear
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around py-2.5 px-2">
          <button
            className="flex flex-col items-center gap-1.5 flex-1 active:scale-[0.96] transition-transform"
            onClick={onBroadcast}
          >
            <span className="h-11 w-11 rounded-full bg-[var(--crm-green-soft)] text-[var(--crm-green)] flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium text-[var(--crm-text-secondary)]">Broadcast</span>
          </button>

          <button
            className="flex flex-col items-center gap-1.5 flex-1 active:scale-[0.96] transition-transform"
            onClick={onChangeStage}
          >
            <span className="h-11 w-11 rounded-full bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium text-[var(--crm-text-secondary)]">Stage</span>
          </button>

          <button
            className="flex flex-col items-center gap-1.5 flex-1 active:scale-[0.96] transition-transform"
            onClick={onDelete}
          >
            <span className="h-11 w-11 rounded-full bg-[var(--crm-red-soft)] text-[var(--crm-red)] flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium text-[var(--crm-text-secondary)]">Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
