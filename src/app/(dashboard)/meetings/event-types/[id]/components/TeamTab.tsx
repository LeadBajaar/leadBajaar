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

const labelStyle = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0"

export const TeamTab = ({ eventType, toggleTeamMember }: Props) => {
  return (
    <TabsContent value="team" className="mt-0 outline-none">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Squad Assignment</h3>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Select members to manage bookings for this event.</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
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
                    ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-none ring-1 ring-indigo-500" 
                    : "bg-white dark:bg-slate-900 border-slate-200 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700 shadow-sm"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500 fill-indigo-50" />
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-800 shadow-md">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-md border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm",
                      isSelected ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                    )}>
                      <UserPlus className={cn("h-2.5 w-2.5", isSelected ? "text-white" : "text-slate-500")} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate w-full max-w-[120px]">
                      {member.name}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate w-full max-w-[120px]">
                      {member.email}
                    </p>
                  </div>

                  <div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]",
                        isSelected 
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
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
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/30">
            <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700 mb-6">
              <Users className="h-8 w-8 text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">No Team Members Found</p>
            <p className="text-xs text-slate-400 font-medium max-w-[280px] text-center">Add members to your workspace first to assign them here.</p>
          </div>
        )}
      </div>
    </TabsContent>
  )
}
 