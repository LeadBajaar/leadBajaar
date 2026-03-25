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
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash, CheckCircle, X } from 'lucide-react'
import { cn } from "@/lib/utils"

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
  handleDeleteStage
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Lead Stages</DialogTitle>
          <DialogDescription>
            Create and manage your lead stages to track your sales pipeline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="New stage name"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="w-[110px] h-9 text-xs">
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
            <Button onClick={handleAddStage} size="sm" className="h-9 px-4">
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
          </div>

          <div className="border rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(stages).map(([name, config]) => (
                  <div
                    key={name}
                    className={cn(
                      "flex items-center justify-between p-3.5 transition-colors",
                      editingStage === name ? "bg-indigo-50/50 dark:bg-indigo-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                    )}
                  >
                    {editingStage === name ? (
                      <div className="flex items-center gap-2 flex-1 animate-in fade-in duration-200">
                        <Input
                          value={editedStageName}
                          onChange={(e) => setEditedStageName(e.target.value)}
                          className="h-8 text-xs max-w-[180px]"
                          autoFocus
                        />
                        <Select value={editedStageColor} onValueChange={setEditedStageColor}>
                          <SelectTrigger className="w-[100px] h-8 text-xs">
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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={handleUpdateStage}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setEditingStage(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700", config.color.split(' ')[0])}>
                            {React.createElement(config.icon, { className: "h-4 w-4" })}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge className={cn("pointer-events-none px-2.5 py-0.5 border-none font-bold text-[10px] uppercase tracking-wider", config.color)}>
                            Example
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => handleEditStage(name)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteStage(name)}
                            disabled={Object.keys(stages).length <= 1}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
