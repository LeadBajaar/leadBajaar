'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserCheck, User } from 'lucide-react'
import { getAgentColor } from '@/utils/agentColors'
import { useTheme } from 'next-themes'

interface AssignAgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  teamMembers: any[];
  isAssigning: boolean;
  onAssign: (agentId: string) => void;
  onCancel: () => void;
}

export function AssignAgentDialog({
  isOpen,
  onOpenChange,
  leadName,
  teamMembers,
  isAssigning,
  onAssign,
  onCancel
}: AssignAgentDialogProps) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'
  const [selectedAgent, setSelectedAgent] = useState<string>('')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-purple-500" />
            Assign Lead to Agent
          </DialogTitle>
          <DialogDescription>
            Select a team member to handle <strong>{leadName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agent">Select Agent</Label>
            <Select onValueChange={setSelectedAgent} value={selectedAgent}>
              <SelectTrigger id="agent">
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => {
                  const colors = getAgentColor(member.id);
                  return (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-6 w-6 rounded-full flex items-center justify-center border shadow-sm shrink-0"
                          style={{
                            backgroundColor: isDark 
                              ? colors.bgDark 
                              : colors.bg,
                            color: isDark 
                              ? colors.textDark 
                              : colors.text,
                            borderColor: isDark 
                              ? colors.borderDark 
                              : colors.border,
                          }}
                        >
                          <User className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{member.name}</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{member.role}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onAssign(selectedAgent)} 
            disabled={!selectedAgent || isAssigning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Confirm Assignment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
