'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, UserCheck, Search, Check, UserX, 
  ShieldCheck, Star, User, X, Users, Sparkles
} from 'lucide-react'
import { getAgentColor } from '@/utils/agentColors'
import { cn } from '@/lib/utils'
import { useModalHistory } from '@/hooks/use-modal-history'

interface AssignAgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  currentAgentId?: number | null;
  teamMembers: any[];
  isAssigning: boolean;
  onAssign: (agentId: string) => void;
  onCancel: () => void;
}

export function AssignAgentDialog({
  isOpen,
  onOpenChange,
  leadName,
  currentAgentId,
  teamMembers,
  isAssigning,
  onAssign,
  onCancel
}: AssignAgentDialogProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'agent' | 'manager' | 'admin'>('all')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = useModalHistory(isOpen, onOpenChange, 'assignAgentDialog');

  useEffect(() => {
    if (isOpen) {
      setSelectedAgent(currentAgentId ? currentAgentId.toString() : '')
      setSearchQuery('')
      setRoleFilter('all')
      // Focus search input after animation
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, currentAgentId])

  const activeMembers = useMemo(() => {
    return (teamMembers || []).filter(m => !m.status || m.status.toLowerCase() === 'active')
  }, [teamMembers])

  const roleCounts = useMemo(() => {
    const counts = { all: activeMembers.length, agent: 0, manager: 0, admin: 0 }
    activeMembers.forEach(m => {
      const role = (m.role || '').toLowerCase()
      if (role.includes('admin')) counts.admin++
      else if (role.includes('manager')) counts.manager++
      else counts.agent++
    })
    return counts
  }, [activeMembers])

  const filteredMembers = useMemo(() => {
    let list = activeMembers

    if (roleFilter !== 'all') {
      list = list.filter(m => {
        const r = (m.role || '').toLowerCase()
        if (roleFilter === 'admin') return r.includes('admin')
        if (roleFilter === 'manager') return r.includes('manager')
        if (roleFilter === 'agent') return !r.includes('admin') && !r.includes('manager')
        return true
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(m => 
        (m.name || '').toLowerCase().includes(q) || 
        (m.email || '').toLowerCase().includes(q) ||
        (m.role || '').toLowerCase().includes(q)
      )
    }

    return list
  }, [activeMembers, roleFilter, searchQuery])

  const handleSelect = (id: string) => {
    setSelectedAgent(id)
  }

  const getRoleIcon = (role: string) => {
    const r = (role || '').toLowerCase()
    if (r.includes('admin')) return <ShieldCheck className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
    if (r.includes('manager')) return <Star className="h-3 w-3 text-amber-500 dark:text-amber-400 shrink-0" />
    return <User className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[540px] rounded-2xl border-slate-200 dark:border-slate-800 p-5 shadow-xl font-sans"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold font-heading text-slate-900 dark:text-white leading-tight">
                  Assign Lead to Agent
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Target Lead: <span className="font-semibold text-slate-800 dark:text-slate-200">{leadName || 'Selected Lead'}</span>
                </DialogDescription>
              </div>
            </div>
            
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-medium text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <Users className="h-3 w-3 mr-1 text-slate-400" />
              {activeMembers.length} Agents
            </Badge>
          </div>
        </DialogHeader>

        {/* Controls: Search + Unassign Row */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-8 bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-750 rounded-xl text-xs font-medium focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
              />
              {searchQuery && (
                <Button 
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 h-auto w-auto p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Unassign quick button */}
            <Button variant="ghost" /* TODO: Toggle/Selection element */
              type="button"
              onClick={() => handleSelect('unassign')}
              className={cn(
                "h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs p-0 w-auto",
                selectedAgent === 'unassign'
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
              title="Remove current agent assignment"
            >
              <UserX className="h-3.5 w-3.5 text-rose-500" />
              <span>Unassign</span>
              {selectedAgent === 'unassign' && <Check className="h-3 w-3 ml-0.5 text-rose-600 dark:text-rose-400 stroke-[3]" />}
            </Button>
          </div>

          {/* Role Filter Tabs (Ideal for 15+ agents) */}
          {activeMembers.length > 5 && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 pt-0.5">
              <Button variant="ghost" /* TODO: Segmented control */
                type="button"
                onClick={() => setRoleFilter('all')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 h-auto p-0",
                  roleFilter === 'all'
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                )}
              >
                All ({roleCounts.all})
              </Button>
              {roleCounts.agent > 0 && (
                <Button variant="ghost" /* TODO: Segmented control */
                  type="button"
                  onClick={() => setRoleFilter('agent')}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 h-auto p-0",
                    roleFilter === 'agent'
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                  )}
                >
                  Agents ({roleCounts.agent})
                </Button>
              )}
              {roleCounts.manager > 0 && (
                <Button variant="ghost" /* TODO: Segmented control */
                  type="button"
                  onClick={() => setRoleFilter('manager')}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 h-auto p-0",
                    roleFilter === 'manager'
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                  )}
                >
                  Managers ({roleCounts.manager})
                </Button>
              )}
              {roleCounts.admin > 0 && (
                <Button variant="ghost" /* TODO: Segmented control */
                  type="button"
                  onClick={() => setRoleFilter('admin')}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 h-auto p-0",
                    roleFilter === 'admin'
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                  )}
                >
                  Admins ({roleCounts.admin})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 2-Column Responsive Grid for 15+ Agents */}
        <div className="mt-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredMembers.map((member) => {
                const colors = getAgentColor(member.id);
                const isSelected = selectedAgent === member.id.toString();
                const isCurrent = currentAgentId && currentAgentId.toString() === member.id.toString();
                const initials = (member.name || '')
                  .split(' ')
                  .filter(Boolean)
                  .map((n: string) => n[0].toUpperCase())
                  .join('') || 'A';

                return (
                  <Button variant="ghost" /* TODO: Toggle/Selection element */
                    key={member.id}
                    type="button"
                    onClick={() => handleSelect(member.id.toString())}
                    className={cn(
                      "group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left h-auto w-full",
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold font-heading shrink-0 shadow-xs"
                        style={{ backgroundColor: colors.bg }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold font-heading text-slate-900 dark:text-white truncate">
                            {member.name}
                          </p>
                          {isCurrent && !isSelected && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium shrink-0">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getRoleIcon(member.role)}
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">
                            {member.role || 'Agent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs ml-1">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500 font-normal">
              No team members match <span className="font-semibold">&quot;{searchQuery}&quot;</span> in this category.
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'agent' : 'agents'} available
          </span>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => { onCancel(); handleOpenChange(false); }} 
              className="rounded-xl h-9 text-xs font-medium text-slate-600 dark:text-slate-300"
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onAssign(selectedAgent)}
              disabled={!selectedAgent || isAssigning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-5 text-xs font-semibold shadow-xs"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Assigning...
                </>
              ) : selectedAgent === 'unassign' ? (
                'Unassign Lead'
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
