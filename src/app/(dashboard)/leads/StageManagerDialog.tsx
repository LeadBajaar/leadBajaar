'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash, CheckCircle2, X, RefreshCcw, Layers } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useModalHistory } from '@/hooks/use-modal-history'

interface StageManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Record<string, { color: string; icon: any }>;
  newStageName: string;
  setNewStageName: (name: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  editingStage: string | null;
  setEditingStage: (stage: string | null) => void;
  editedStageName: string;
  setEditedStageName: (name: string) => void;
  editedStageColor: string;
  setEditedStageColor: (color: string) => void;
  handleAddStage: () => void;
  handleEditStage: (name: string) => void;
  handleUpdateStage: () => void;
  handleDeleteStage: (name: string) => void;
  onSyncDefault?: () => void;
}

export const StageManagerDialog: React.FC<StageManagerDialogProps> = ({
  isOpen,
  onOpenChange,
  stages,
  newStageName,
  setNewStageName,
  selectedColor,
  setSelectedColor,
  editingStage,
  setEditingStage,
  editedStageName,
  setEditedStageName,
  editedStageColor,
  setEditedStageColor,
  handleAddStage,
  handleEditStage,
  handleUpdateStage,
  handleDeleteStage,
  onSyncDefault
}) => {
  const handleOpenChange = useModalHistory(isOpen, onOpenChange, 'stageManagerDialog');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[85vh] max-sm:!max-w-none max-sm:w-full max-sm:h-[100dvh] max-sm:!max-h-[100dvh] max-sm:!rounded-none max-sm:border-0 max-sm:!left-0 max-sm:!top-0 max-sm:!translate-x-0 max-sm:!translate-y-0 flex flex-col overflow-hidden bg-[var(--crm-surface-1)] p-0 shadow-2xl">
        <DialogHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)] shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-[16px] font-medium text-[var(--crm-text-primary)]">Manage stages</DialogTitle>
                <DialogDescription className="text-[13px] text-[var(--crm-text-secondary)] mt-0.5">
                  Customize your sales pipeline
                </DialogDescription>
              </div>
            </div>
            {onSyncDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSyncDefault}
                aria-label="Reset defaults"
                className="h-8 w-8 p-0 text-[var(--crm-text-secondary)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 shrink-0 rounded-lg"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col bg-[var(--crm-surface-1)]">
          <div className="p-4 sm:p-6 pb-4 sm:pb-5 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
            <div className="flex flex-col sm:flex-row gap-3">
            <div className="sm:flex-1">
              <Input
                placeholder="Enter new stage name..."
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                className="h-11 sm:h-10 text-[15px] sm:text-[13px] bg-[var(--crm-surface-2)] border-[var(--crm-border)] rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="flex-1 sm:flex-none sm:w-[120px] h-11 sm:h-10 text-[14px] sm:text-[13px] bg-[var(--crm-surface-2)] border-[var(--crm-border)] rounded-xl">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  {['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'orange', 'cyan', 'indigo'].map(color => (
                    <SelectItem key={color} value={color} className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                        {color}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddStage} 
                disabled={!newStageName.trim()}
                className="h-11 sm:h-10 px-6 rounded-xl bg-[var(--crm-blue)] hover:opacity-90 font-bold shadow-md shadow-blue-500/20 text-white transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add
              </Button>
            </div>
          </div>
        </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="divide-y divide-[var(--crm-border)]">
                {Object.entries(stages).map(([name, config]) => (
                  <div
                    key={name}
                    className={cn(
                      "flex items-center justify-between px-4 sm:px-6 py-3.5 transition-all",
                      editingStage === name 
                        ? "bg-blue-50/50 dark:bg-blue-900/10" 
                        : "bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-2)]"
                    )}
                  >
                    {editingStage === name ? (
                      <div className="flex flex-col sm:flex-row gap-3 w-full animate-in fade-in duration-200">
                        <Input
                          value={editedStageName}
                          onChange={(e) => setEditedStageName(e.target.value)}
                          className="h-11 sm:h-10 text-[15px] sm:text-[13px] bg-[var(--crm-surface-1)] flex-1 rounded-lg"
                          autoFocus
                        />
                        <div className="flex items-center gap-3">
                          <Select value={editedStageColor} onValueChange={setEditedStageColor}>
                            <SelectTrigger className="w-full sm:w-[120px] h-11 sm:h-10 text-[14px] sm:text-[13px] bg-[var(--crm-surface-1)] rounded-lg">
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'orange', 'cyan', 'indigo'].map(color => (
                              <SelectItem key={color} value={color} className="text-xs">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                                  {color}
                                </div>
                              </SelectItem>
                            ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1 shrink-0 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 rounded-full p-0 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                              onClick={handleUpdateStage}
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 rounded-full p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => setEditingStage(null)}
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shadow-sm border border-[var(--crm-border)]", config.color.split(' ')[0])}>
                            {React.createElement(config.icon, { className: "h-4 w-4" })}
                          </div>
                          <span className="text-sm font-semibold text-[var(--crm-text-primary)]">{name}</span>
                        </div>
                        <div className="flex items-center gap-1 -mr-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-full p-0 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            onClick={() => handleEditStage(name)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-full p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() => handleDeleteStage(name)}
                            disabled={Object.keys(stages).length <= 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-4 border-t border-[var(--crm-border)] bg-[var(--crm-surface-1)] flex max-sm:flex-row max-sm:gap-3 flex-row items-center sm:justify-end gap-2 shrink-0">
          <Button
            onClick={() => handleOpenChange(false)}
            className="w-full max-sm:h-12 max-sm:rounded-xl font-bold sm:w-auto sm:min-w-[120px] sm:h-10 bg-[var(--crm-blue)] hover:opacity-90 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
