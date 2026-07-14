import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, CheckCircle2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TeamMember {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

interface Props {
  eventType: any
  toggleTeamMember: (member: TeamMember) => void
}

const labelStyle = "text-[10px] font-black uppercase tracking-[0.2em] text-[var(--crm-text-secondary)] mb-0"

export const TeamTab = ({ eventType, toggleTeamMember }: Props) => {
  return (
    <TabsContent value="team" className="mt-0 outline-none">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--crm-text-primary)] uppercase tracking-wider mb-1">Squad Assignment</h3>
            <p className="text-xs text-[var(--crm-text-secondary)] font-medium tracking-tight">Select members to manage bookings for this event.</p>
          </div>
          <div className="bg-[var(--crm-surface-3)] px-3 py-1.5 rounded-xl border border-[var(--crm-border)] flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
            <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest">
              {eventType.teamMembers.length} Assigned
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {eventType.teamMembers.map((member: TeamMember) => {
            const isSelected = eventType.teamMembers.some((m: any) => m.id === member.id)
            return (
              <div
                key={member.id}
                onClick={() => toggleTeamMember(member)}
                className={cn(
                  "group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                  isSelected 
                    ? "bg-[var(--crm-surface-1)]  border-[var(--crm-accent)] shadow-lg shadow-indigo-100  ring-1 ring-[var(--crm-accent)]" 
                    : "bg-[var(--crm-surface-1)]  border-[var(--crm-border)] hover:border-indigo-300 shadow-sm"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-primary fill-indigo-50" />
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)] font-bold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-md border-2 border-white  flex items-center justify-center shadow-sm",
                      isSelected ? "bg-[var(--crm-accent)]" : "bg-[var(--crm-surface-3)] "
                    )}>
                      <UserPlus className={cn("h-2.5 w-2.5", isSelected ? "text-white" : "text-[var(--crm-text-secondary)]")} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-[13px] font-bold text-[var(--crm-text-primary)] uppercase tracking-tight truncate w-full max-w-[120px]">
                      {member.name}
                    </h4>
                    <p className="text-[9px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest truncate w-full max-w-[120px]">
                      {member.email}
                    </p>
                  </div>

                  <div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]",
                        isSelected 
                          ? "bg-[var(--crm-accent-soft)] text-[var(--crm-accent)]  " 
                          : "bg-[var(--crm-surface-3)]  text-[var(--crm-text-secondary)]"
                      )}
                    >
                      {member.role}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>


        {/* Empty state if no team members are available to select */}
        {eventType.teamMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[var(--crm-border)] rounded-[2rem] bg-[var(--crm-surface-2)]">
            <div className="h-16 w-16 bg-[var(--crm-surface-1)] rounded-3xl flex items-center justify-center shadow-xl border border-[var(--crm-border)] mb-6">
              <Users className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-[var(--crm-text-primary)] uppercase tracking-widest mb-2">No Team Members Found</p>
            <p className="text-xs text-[var(--crm-text-secondary)] font-medium max-w-[280px] text-center">Add members to your workspace first to assign them here.</p>
          </div>
        )}
      </div>
    </TabsContent>
  )
}
 