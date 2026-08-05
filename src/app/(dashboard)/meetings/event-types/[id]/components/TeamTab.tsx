import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Check } from 'lucide-react'
import { cn } from "@/lib/utils"
import { TeamMember } from '@/types/events'

interface Props {
  eventType: any
  toggleTeamMember: (member: TeamMember) => void
  availableMembers: TeamMember[]
}

export const TeamTab = ({ eventType, toggleTeamMember, availableMembers }: Props) => {
  return (
    <TabsContent value="team" className="mt-0 outline-none">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--crm-text-primary)]">Squad assignment</p>
            <p className="text-xs text-[var(--crm-text-secondary)]">Select members to manage bookings for this event.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--crm-surface-2)] px-2.5 py-1.5 rounded-lg border border-[var(--crm-border)] shrink-0">
            <Users className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
            <span className="text-xs font-semibold text-[var(--crm-text-secondary)]">
              {eventType.teamMembers.length} assigned
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {availableMembers.map((member: TeamMember) => {
            const isSelected = eventType.teamMembers.some((m: any) => m.id === member.id)
            return (
              <button
                type="button"
                key={member.id}
                onClick={() => toggleTeamMember(member)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors",
                  isSelected
                    ? "border-[var(--crm-accent)] bg-[var(--crm-accent-soft)]"
                    : "border-[var(--crm-border)] hover:border-[var(--lb-navy)]/40"
                )}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)] font-semibold text-xs">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--crm-text-primary)] truncate">{member.name}</p>
                  <p className="text-xs text-[var(--crm-text-secondary)] truncate">{member.email}</p>
                </div>

                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-semibold shrink-0",
                    isSelected ? "bg-[var(--crm-accent-soft)] text-[var(--crm-accent)]" : "bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)]"
                  )}
                >
                  {member.role}
                </Badge>

                {isSelected && (
                  <span data-testid="member-selected-indicator" className="h-5 w-5 rounded-full bg-[var(--crm-accent)] flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Empty state if no team members are available to select */}
        {availableMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-[var(--crm-border)] rounded-lg bg-[var(--crm-surface-2)]">
            <Users className="h-6 w-6 text-[var(--crm-text-tertiary)] mb-2" />
            <p className="text-sm font-semibold text-[var(--crm-text-primary)] mb-1">No team members found</p>
            <p className="text-xs text-[var(--crm-text-secondary)] max-w-[220px] text-center">Add members to your workspace first to assign them here.</p>
          </div>
        )}
      </div>
    </TabsContent>
  )
}
