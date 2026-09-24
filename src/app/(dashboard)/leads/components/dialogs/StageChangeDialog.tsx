'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useModalHistory } from '@/hooks/use-modal-history'

interface StageChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string | null;
  selectedLeadsCount: number;
  stages: Record<string, { color: string; icon: any }>;
  selectedStage: string | null;
  setSelectedStage: (stage: string | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const StageChangeDialog: React.FC<StageChangeDialogProps> = ({
  isOpen,
  onOpenChange,
  leadName,
  selectedLeadsCount,
  stages,
  selectedStage,
  setSelectedStage,
  onConfirm,
  onCancel
}) => {
  const handleOpenChange = useModalHistory(isOpen, onOpenChange, 'stageChangeDialog');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Lead Stage</DialogTitle>
          <DialogDescription>
            {leadName ? `Select a new stage for ${leadName}.` : `Select a new stage for ${selectedLeadsCount} leads.`}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          <div className="grid gap-2.5 py-4">
            {Object.entries(stages).map(([name, config]) => (
              <Button
                key={name}
                variant="outline"
                className={cn(
                  "justify-start h-12 rounded-xl transition-all border-slate-200 dark:border-slate-800",
                  selectedStage === name && "border-primary bg-primary/5 dark:bg-indigo-900/10 text-primary dark:text-indigo-400 ring-1 ring-primary"
                )}
                onClick={() => setSelectedStage(name)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700", config.color.split(' ')[0])}>
                    {React.createElement(config.icon, { className: "h-4 w-4" })}
                  </div>
                  <span className="text-sm font-semibold">{name}</span>
                </div>
                {selectedStage === name && (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-primary dark:text-indigo-400 animate-in zoom-in duration-200" />
                )}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter className="border-t pt-4 mt-2 flex max-sm:flex-row max-sm:gap-3 flex-row items-center sm:justify-end gap-2 px-4 pb-4 sm:px-0 sm:pb-0">
          <Button variant="outline" size="sm" onClick={() => { onCancel(); handleOpenChange(false); }} className="max-sm:flex-1 max-sm:h-12 max-sm:rounded-xl">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedStage}
            onClick={onConfirm}
            className="bg-primary hover:bg-primary/90 font-bold max-sm:flex-1 max-sm:h-12 max-sm:rounded-xl"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
