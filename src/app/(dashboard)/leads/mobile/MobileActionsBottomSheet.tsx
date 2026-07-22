'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Tag, IndianRupee, User, Trash2, X, Phone, Check, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Lead } from '../types'

interface MobileActionsBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  stages: Record<string, any>;
  onEdit: (lead: Lead) => void;
  onStageSelect: (lead: Lead, stage: string) => void;
  onDealValue: (lead: Lead) => void;
  onAssign: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export const MobileActionsBottomSheet: React.FC<MobileActionsBottomSheetProps> = ({
  isOpen,
  onOpenChange,
  lead,
  stages,
  onEdit,
  onStageSelect,
  onDealValue,
  onAssign,
  onDelete
}) => {
  const [view, setView] = React.useState<'menu' | 'stage'>('menu');

  // Always reopen on the main menu
  React.useEffect(() => {
    if (isOpen) setView('menu');
  }, [isOpen]);

  if (!lead) return null;

  const stageConfig = stages[lead.stage] || { color: 'bg-slate-100 text-slate-500' };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed !top-auto !bottom-0 !left-0 !right-0 !translate-x-0 !translate-y-0 w-full sm:w-full rounded-t-3xl rounded-b-none border-t border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-0 m-0 max-w-none slide-in-from-bottom-[100%] duration-300 [&>button.absolute]:hidden"
      >
        <DialogTitle className="sr-only">Actions for {lead.name}</DialogTitle>
        <DialogDescription className="sr-only">Choose an action for this lead</DialogDescription>

        <div className="flex flex-col pt-3 pb-6 px-4">
          <div className="w-12 h-1.5 bg-[var(--crm-surface-3)] rounded-full mx-auto mb-4" />

          {/* Lead context header */}
          <div className="flex items-start justify-between mb-5 px-2">
            <div className="min-w-0 pr-4">
              <h3 className="text-lg font-semibold text-[var(--crm-text-primary)] truncate">
                {lead.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className={cn("px-2 py-0.5 h-5 text-[10px] font-bold uppercase tracking-wider border-none", stageConfig.color)}>
                  {lead.stage}
                </Badge>
                {lead.phone && (
                  <span className="inline-flex items-center gap-1 text-[12px] text-[var(--crm-text-secondary)]">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-full shrink-0">
              <X className="h-5 w-5 text-[var(--crm-text-tertiary)]" />
            </Button>
          </div>

          {view === 'menu' ? (
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 font-medium text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] rounded-xl"
                onClick={() => { onOpenChange(false); onEdit(lead); }}
              >
                <Edit2 className="h-5 w-5 mr-4 text-[var(--crm-text-tertiary)]" />
                Edit Lead
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 font-medium text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] rounded-xl"
                onClick={() => setView('stage')}
              >
                <Tag className="h-5 w-5 mr-4 text-[var(--crm-text-tertiary)]" />
                Change Stage
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 font-medium text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] rounded-xl"
                onClick={() => { onOpenChange(false); onDealValue(lead); }}
              >
                <IndianRupee className="h-5 w-5 mr-4 text-[var(--crm-text-tertiary)]" />
                Deal Value
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 font-medium text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] rounded-xl"
                onClick={() => { onOpenChange(false); onAssign(lead); }}
              >
                <User className="h-5 w-5 mr-4 text-[var(--crm-text-tertiary)]" />
                Assign Rep
              </Button>

              <div className="h-px bg-[var(--crm-border)] my-2 mx-4" />

              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 font-medium text-[var(--crm-red)] hover:bg-[var(--crm-red-soft)] rounded-xl"
                onClick={() => { onOpenChange(false); onDelete(lead); }}
              >
                <Trash2 className="h-5 w-5 mr-4" />
                Delete Lead
              </Button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setView('menu')}
                className="flex items-center gap-1 mb-3 px-2 text-[13px] font-medium text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <div className="space-y-1 max-h-[45vh] overflow-y-auto no-scrollbar">
                {Object.keys(stages).map((stageName) => {
                  const isCurrent = lead.stage === stageName;
                  return (
                    <Button
                      key={stageName}
                      variant="ghost"
                      disabled={isCurrent}
                      className={cn(
                        "w-full justify-between h-12 px-4 font-medium rounded-xl",
                        isCurrent
                          ? "bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] opacity-100"
                          : "text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)]"
                      )}
                      onClick={() => { onOpenChange(false); onStageSelect(lead, stageName); }}
                    >
                      {stageName}
                      {isCurrent && <Check className="h-4 w-4" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
