'use client'

import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Phone,
  MessageSquare,
  IndianRupee,
  User,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Lead, temperatureConfig } from './types'
import { format } from 'date-fns'

interface LeadsMobileViewProps {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  selectedLeads: number[];
  handleSelectLead: (id: number) => void;
  handleEdit: (lead: Lead) => void;
  handleDelete: (lead: Lead) => void;
  handleWhatsAppClick: (lead: Lead) => void;
  handleCallClick: (lead: Lead) => void;
  handleDealValueClick: (lead: Lead) => void;
  handleCardClick: (id: number) => void;
  stages: Record<string, any>;
}

export const LeadsMobileSkeleton = () => (
  <div className="grid grid-cols-1 gap-2 p-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export const LeadsMobileView: React.FC<LeadsMobileViewProps> = ({
  leads,
  isLoading,
  error,
  selectedLeads,
  handleSelectLead,
  handleEdit,
  handleDelete,
  handleWhatsAppClick,
  handleCallClick,
  handleCardClick,
  stages
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-slate-500">
        <p className="text-sm mb-4">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return <LeadsMobileSkeleton />
  }

  return (
    <div className="grid grid-cols-1 gap-2 p-3 pb-24">
      {leads.map((lead) => {
        const temp = (temperatureConfig as any)[lead.status] || temperatureConfig.Cold;
        const stage = stages[lead.stage] || { color: 'bg-slate-100 text-slate-500', icon: User };
        const isSelected = selectedLeads.includes(lead.id);

        return (
          <div
            key={lead.id}
            onClick={() => handleCardClick(lead.id)}
            className={cn(
              "group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-all active:scale-[0.99] cursor-pointer",
              isSelected ? "border-indigo-400 ring-1 ring-indigo-400/30" : "hover:border-slate-200"
            )}
          >
            <div className="p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative z-10 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600 focus:ring-0"
                    checked={isSelected}
                    onChange={() => handleSelectLead(lead.id)}
                  />
                </div>
                <div className={cn("h-2 w-2 rounded-full shrink-0", temp.color)} />
                <h4 className="flex-1 text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                  {lead.name}
                </h4>
                <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-slate-50 text-slate-400">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-lg p-1 text-xs">
                      <DropdownMenuItem onClick={() => handleEdit(lead)} className="gap-2">
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(lead)} className="gap-2 text-red-500">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex justify-between items-end pl-5.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={cn("px-1.5 py-0 h-4 text-[9px] font-bold uppercase tracking-tight border-none shadow-none", stage.color)}>
                      {lead.stage}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium opacity-70">{lead.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      <span className="text-[10px] opacity-40">₹</span>
                      {lead.deal_value || 0}
                    </div>
                    <span className="text-[9px] text-slate-300 dark:text-slate-600 font-medium uppercase">
                      {format(new Date(lead.created_at), 'dd MMM')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 relative z-10" onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => handleWhatsAppClick(lead)}
                    size="sm"
                    className="h-7 w-7 p-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleCallClick(lead)}
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 rounded-lg border-slate-100 dark:border-slate-800"
                  >
                    <Phone className="h-3.5 w-3.5 text-indigo-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
