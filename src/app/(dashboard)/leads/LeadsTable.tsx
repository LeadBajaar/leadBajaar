'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pencil,
  Trash,
  Phone,
  MessageSquare,
  IndianRupee,
  Clock,
  RefreshCcw,
  AlertCircle,
  UserCheck,
  Globe,
  Flame,
  ThermometerSun,
  Snowflake
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Lead, columns, temperatureConfig, sourceConfig, defaultStages } from './types'
import { format } from 'date-fns'
import { getAgentColor } from '@/utils/agentColors'
import { useTheme } from 'next-themes'

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  visibleColumns: string[];
  selectedLeads: number[];
  handleSelectLead: (id: number) => void;
  handleSelectAll: () => void;
  handleEdit: (lead: Lead) => void;
  handleDelete: (lead: Lead) => void;
  handleWhatsAppClick: (lead: Lead) => void;
  handleCallClick: (lead: Lead) => void;
  handleDealValueClick: (lead: Lead) => void;
  handleAssignAgentClick: (lead: Lead) => void;
  fetchLeads: () => void;
  setError: (error: string | null) => void;
  stages: Record<string, any>;
}

export const LeadsTableSkeleton = ({ columns, visibleColumns }: { columns: any[], visibleColumns: string[] }) => (
  <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
    <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
      <table className="crm-table w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky top-0 z-30 px-4 py-3.5 bg-slate-50/90 dark:bg-slate-850/95 border-b border-slate-200/80 dark:border-slate-750 w-12 text-left backdrop-blur-sm">
              <Skeleton className="h-4 w-4 rounded" />
            </th>
            {columns.filter(c => visibleColumns.includes(c.id)).map(c => (
              <th key={c.id} className="sticky top-0 z-30 px-4 py-3.5 bg-slate-50/90 dark:bg-slate-850/95 border-b border-slate-200/80 dark:border-slate-750 text-left backdrop-blur-sm">
                <Skeleton className="h-3 w-16 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800/80 last:border-b-0">
              <td className="px-4 py-3.5 w-12 text-left">
                <Skeleton className="h-4 w-4 rounded" />
              </td>
              {columns.filter(c => visibleColumns.includes(c.id)).map(c => (
                <td key={c.id} className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className={cn("h-3.5", c.id === 'name' ? "w-28" : "w-16", "rounded")} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  isLoading,
  error,
  visibleColumns,
  selectedLeads,
  handleSelectLead,
  handleSelectAll,
  handleEdit,
  handleDelete,
  handleWhatsAppClick,
  handleCallClick,
  handleDealValueClick,
  handleAssignAgentClick,
  fetchLeads,
  setError,
  stages
}) => {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Error Loading Leads</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">{error}</p>
        <Button
          variant="default"
          onClick={() => { setError(null); fetchLeads(); }}
          className="rounded-xl font-bold"
        >
          <RefreshCcw className="h-3 w-3 mr-1.5" />
          Try Again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <LeadsTableSkeleton columns={columns} visibleColumns={visibleColumns} />
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
          <i className="ti ti-users text-2xl" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No leads found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Adjust your filters or add a new lead to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
        <table className="crm-table w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky top-0 z-30 px-4 py-3.5 bg-slate-50/90 dark:bg-slate-850/95 border-b border-slate-200/80 dark:border-slate-750 w-12 text-left select-none backdrop-blur-sm">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 focus:ring-0 cursor-pointer"
                  checked={selectedLeads.length > 0 && selectedLeads.length === leads.length}
                  onChange={handleSelectAll}
                />
              </th>
              {columns
                .filter(column => visibleColumns.includes(column.id))
                .map(column => (
                  <th 
                    key={column.id}
                    className="sticky top-0 z-30 whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-850/95 border-b border-slate-200/80 dark:border-slate-750 text-left select-none backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1.5">
                      {column.icon && <column.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                      <span>{column.label}</span>
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const isSelected = selectedLeads.includes(lead.id);

              return (
                <tr
                  key={`lead-${lead.id}`}
                  className={cn(
                    "border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 transition-colors",
                    isSelected 
                      ? "bg-indigo-50/60 dark:bg-indigo-950/30" 
                      : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  )}
                >
                  <td className="px-4 py-3 w-12 text-left">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 focus:ring-0 cursor-pointer"
                      checked={isSelected}
                      onChange={() => handleSelectLead(lead.id)}
                    />
                  </td>
                  {columns
                    .filter(column => visibleColumns.includes(column.id))
                    .map(column => {
                      const value = (lead as any)[column.id];

                      return (
                        <td key={`${lead.id}-${column.id}`} className="whitespace-nowrap px-4 py-3 text-[13px] font-normal text-slate-700 dark:text-slate-300">
                          {column.id === 'actions' ? (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost"
                                      onClick={() => handleWhatsAppClick(lead)} 
                                      className="h-6 w-6 flex items-center justify-center rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-all hover:scale-[1.08] active:scale-[0.92] border border-emerald-700/10 shadow-sm cursor-pointer p-0"
                                      aria-label="WhatsApp lead"
                                    >
                                      <i className="ti ti-brand-whatsapp text-[13px]" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">WhatsApp</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost"
                                      onClick={() => handleCallClick(lead)} 
                                      className="h-6 w-6 flex items-center justify-center rounded-[6px] bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-all hover:scale-[1.08] active:scale-[0.92] border border-blue-700/10 shadow-sm cursor-pointer p-0"
                                      aria-label="Call lead"
                                    >
                                      <i className="ti ti-phone text-[13px]" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">Call</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost"
                                      onClick={() => handleDealValueClick(lead)} 
                                      className="h-6 w-6 flex items-center justify-center rounded-[6px] bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-600 transition-all hover:scale-[1.08] active:scale-[0.92] border border-amber-600/10 shadow-sm cursor-pointer p-0"
                                      aria-label="Edit deal value"
                                    >
                                      <i className="ti ti-currency-rupee text-[13px]" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">Deal Value</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost"
                                      onClick={() => handleEdit(lead)} 
                                      className="h-6 w-6 flex items-center justify-center rounded-[6px] bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all hover:scale-[1.08] active:scale-[0.92] border border-indigo-700/10 shadow-sm cursor-pointer p-0"
                                      aria-label="Edit lead"
                                    >
                                      <i className="ti ti-edit text-[13px]" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">Edit Lead</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost"
                                      onClick={() => handleDelete(lead)} 
                                      className="h-6 w-6 flex items-center justify-center rounded-[6px] bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-500 dark:hover:bg-rose-600 transition-all hover:scale-[1.08] active:scale-[0.92] border border-rose-600/10 shadow-sm cursor-pointer p-0"
                                      aria-label="Delete lead"
                                    >
                                      <i className="ti ti-trash text-[13px]" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">Delete</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ) : column.id === 'agent' ? (
                            <Button variant="ghost"
                              onClick={() => handleAssignAgentClick(lead)}
                              className="group/agent flex items-center justify-between gap-1.5 py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-750 max-w-[165px] h-auto w-auto"
                              title={lead.agent ? `Assigned to ${lead.agent.name} (click to change)` : 'Click to assign agent'}
                            >
                              {lead.agent ? (
                                <>
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div
                                      className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                                      style={{ backgroundColor: getAgentColor(lead.agent.id).bg }}
                                    >
                                      {lead.agent.name ? lead.agent.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover/agent:text-indigo-600 dark:group-hover/agent:text-indigo-400 transition-colors">
                                      {lead.agent.name}
                                    </span>
                                  </div>
                                  <Pencil className="h-3 w-3 text-slate-400 group-hover/agent:text-indigo-600 dark:group-hover/agent:text-indigo-400 shrink-0 opacity-60 group-hover/agent:opacity-100 transition-all ml-1" />
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 group-hover/agent:text-indigo-600 dark:group-hover/agent:text-indigo-400 transition-colors">
                                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-750 flex items-center justify-center shrink-0">
                                    <UserCheck className="h-3 w-3 text-slate-400 group-hover/agent:text-indigo-600 transition-colors" />
                                  </div>
                                  <span className="text-xs font-normal italic">Assign</span>
                                  <Pencil className="h-2.5 w-2.5 text-slate-400 group-hover/agent:text-indigo-600 transition-colors shrink-0 ml-0.5" />
                                </div>
                              )}
                            </Button>
                          ) : column.id === 'name' ? (
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5 leading-snug">
                                {lead.name}
                                {lead.is_incomplete ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertCircle className="h-3 w-3 text-amber-500 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Missing Phone Number</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : null}
                              </span>
                              {(lead.company || lead.email) ? (
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate leading-none mt-0.5">
                                  {lead.company || lead.email}
                                </span>
                              ) : null}
                            </div>
                          ) : column.id === 'stage' ? (
                            <Badge className={cn("border-none rounded-full px-2.5 py-0.5 font-medium text-white text-[11px] shadow-xs", stages[lead.stage]?.color || (defaultStages as any)[lead.stage]?.color || 'bg-slate-500')}>
                              {lead.stage}
                            </Badge>
                          ) : column.id === 'status' ? (
                            <Badge className={cn("border-none rounded-full px-2.5 py-0.5 font-medium text-white text-[11px]", (temperatureConfig as any)[lead.status]?.color || 'bg-slate-500')}>
                              {lead.status}
                            </Badge>
                          ) : column.id === 'source' ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                              {(() => {
                                const config = (sourceConfig as any)[lead.source];
                                const Icon = config?.icon || Globe;
                                return <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              })()}
                              <span className="font-medium">{lead.source || 'Direct'}</span>
                            </div>
                          ) : column.id === 'created_at' ? (
                            <span className="text-slate-600 dark:text-slate-400 text-xs tabular-nums font-normal">
                              {format(new Date(lead.created_at), 'dd MMM, yy | hh:mm a')}
                            </span>
                          ) : column.id === 'deal_value' ? (
                            <div className="flex items-center gap-0.5 text-slate-800 dark:text-slate-200 font-semibold text-[13px] tabular-nums">
                              <span className="text-[11px] text-slate-400 font-normal">₹</span>
                              <span>{Number(lead.deal_value || 0).toLocaleString('en-IN')}</span>
                            </div>
                          ) : column.id === 'paid_amount' ? (
                            <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[13px] tabular-nums">
                              <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-normal">₹</span>
                              <span>{Number(lead.paid_amount || 0).toLocaleString('en-IN')}</span>
                            </div>
                          ) : column.id === 'notes' ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[200px] inline-block cursor-help italic text-slate-600 dark:text-slate-400 font-medium text-xs">
                                    {value || '-'}
                                  </span>
                                </TooltipTrigger>
                                {value && (
                                  <TooltipContent className="max-w-[300px] p-3 text-xs leading-relaxed">
                                    <p className="whitespace-pre-wrap font-normal">{value}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="truncate max-w-[150px] inline-block font-semibold text-[13px] text-slate-800 dark:text-slate-200">{value || '-'}</span>
                          )}
                        </td>
                      );
                    })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
