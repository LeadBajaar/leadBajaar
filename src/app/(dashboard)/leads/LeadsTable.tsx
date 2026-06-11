'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
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
  Globe
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Lead, columns, temperatureConfig, sourceConfig } from './types'
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
  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
    <table className="crm-table">
      <thead>
        <tr>
          <th><Skeleton className="h-4 w-4" /></th>
          {columns.filter(c => visibleColumns.includes(c.id)).map(c => (
            <th key={c.id}><Skeleton className="h-3 w-16" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 12 }).map((_, i) => (
          <tr key={i} className="border-slate-50 dark:border-slate-800">
            <td><Skeleton className="h-4 w-4" /></td>
            {columns.filter(c => visibleColumns.includes(c.id)).map(c => (
              <td key={c.id}>
                <div className="flex items-center gap-2">
                  {c.id === 'name' && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
                  <Skeleton className={cn("h-3", c.id === 'name' ? "w-20" : "w-12")} />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Error Loading Leads</h3>
        <p className="text-xs mb-4">{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => { setError(null); fetchLeads(); }}
        >
          <RefreshCcw className="h-3 w-3" />
          Try Again
        </button>
      </div>
    )
  }

  if (isLoading) {
    return <LeadsTableSkeleton columns={columns} visibleColumns={visibleColumns} />
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
        <i className="ti ti-user-check" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No leads found</h3>
        <p className="text-xs mt-1">Adjust filters or add a new lead.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden">
      <div className="flex-1 overflow-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <table className="crm-table w-full">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 focus:ring-0"
                  checked={selectedLeads.length > 0 && selectedLeads.length === leads.length}
                  onChange={handleSelectAll}
                />
              </th>
              {columns
                .filter(column => visibleColumns.includes(column.id))
                .map(column => (
                  <th key={column.id}
                    className="sticky top-0 z-30 whitespace-nowrap px-3 py-2 text-[12px] font-medium text-[var(--crm-text-secondary)] bg-transparent border-b border-[var(--crm-border)]"
                  >
                    <div className="flex items-center gap-1.5">
                      {column.icon && <column.icon className="h-3.5 w-3.5 opacity-60" />}
                      {column.label}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={`lead-${lead.id}`}
                className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td>
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 focus:ring-0"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => handleSelectLead(lead.id)}
                  />
                </td>
                {columns
                  .filter(column => visibleColumns.includes(column.id))
                  .map(column => {
                    const value = (lead as any)[column.id];

                    return (
                      <td key={`${lead.id}-${column.id}`} className="whitespace-nowrap px-3 py-1.5 text-[13px] font-medium text-[var(--crm-text-primary)]">
                        {column.id === 'actions' ? (
                          <div className="flex gap-1.5 whitespace-nowrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => handleEdit(lead)} className="btn-icon w-6 h-6">
                                    <i className="ti ti-edit text-[14px]" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Edit</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => handleWhatsAppClick(lead)} className="btn-icon w-6 h-6">
                                    <i className="ti ti-brand-whatsapp text-[14px]" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">WhatsApp</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => handleCallClick(lead)} className="btn-icon w-6 h-6">
                                    <i className="ti ti-phone text-[14px]" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Call</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => handleDealValueClick(lead)} className="btn-icon w-6 h-6">
                                    <i className="ti ti-currency-rupee text-[14px]" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Value</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    onClick={() => handleAssignAgentClick(lead)} 
                                    className={cn(
                                      "btn-icon w-6 h-6 transition-all duration-300",
                                      lead.agent 
                                        ? "ring-1" 
                                        : "text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                    style={lead.agent ? {
                                      backgroundColor: isDark 
                                        ? getAgentColor(lead.agent.id).bgDark 
                                        : getAgentColor(lead.agent.id).bg,
                                      color: isDark 
                                        ? getAgentColor(lead.agent.id).textDark 
                                        : getAgentColor(lead.agent.id).text,
                                      borderColor: isDark 
                                        ? getAgentColor(lead.agent.id).borderDark 
                                        : getAgentColor(lead.agent.id).border,
                                    } : {}}
                                  >
                                    <i className="ti ti-user-check text-[14px]" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">
                                  {lead.agent ? `Assigned to: ${lead.agent.name}` : 'Assign Agent'}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => handleDelete(lead)} className="btn-icon w-6 h-6">
                                    <i className="ti ti-trash text-[14px]" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : column.id === 'name' ? (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--crm-surface-3)] text-[10px] text-[var(--crm-text-primary)] font-bold border border-[var(--crm-border)]">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-[13px] text-[var(--crm-text-primary)] truncate">{lead.name}</span>
                              <span className="text-[12px] text-[var(--crm-text-tertiary)] font-normal truncate opacity-80">{lead.phone || lead.email}</span>
                            </div>
                          </div>
                        ) : column.id === 'stage' ? (
                          <span className={cn("badge", stages[lead.stage]?.color || 'badge-neutral')}>
                            {lead.stage}
                          </span>
                        ) : column.id === 'status' ? (
                          <span className={cn("badge", (temperatureConfig as any)[lead.status]?.color || 'badge-neutral')}>
                            {lead.status}
                          </span>
                        ) : column.id === 'source' ? (
                          <div className="flex items-center gap-1.5 text-[12px] text-[var(--crm-text-secondary)]">
                            {(() => {
                              const config = (sourceConfig as any)[lead.source];
                              const Icon = config?.icon || Globe;
                              return <Icon className="h-3.5 w-3.5" />
                            })()}
                            <span className="font-medium tracking-tight">{lead.source}</span>
                          </div>
                        ) : column.id === 'created_at' ? (
                          <span className="text-[var(--crm-text-tertiary)] text-[12px] tabular-nums font-normal">
                            {format(new Date(lead.created_at), 'dd MMM, yy | hh:mm a')}
                          </span>
                        ) : column.id === 'deal_value' ? (
                          <div className="flex items-center gap-0.5 text-[var(--crm-text-primary)] font-medium text-[13px] tabular-nums">
                            <span className="text-[11px] text-[var(--crm-text-tertiary)]">₹</span>
                            <span>{lead.deal_value || 0}</span>
                          </div>
                        ) : column.id === 'paid_amount' ? (
                          <div className="flex items-center gap-0.5 text-emerald-600 font-medium text-[13px] tabular-nums">
                            <span className="text-[11px] opacity-60">₹</span>
                            <span>{lead.paid_amount || 0}</span>
                          </div>
                        ) : column.id === 'notes' ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate max-w-[200px] inline-block cursor-help italic opacity-70">
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
                          <span className="truncate max-w-[150px] inline-block font-normal text-[13px] text-[var(--crm-text-primary)]">{value || '-'}</span>
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
