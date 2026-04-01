'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from "@/components/ui/badge"
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
  fetchLeads: () => void;
  setError: (error: string | null) => void;
  stages: Record<string, any>;
}

export const LeadsTableSkeleton = ({ columns, visibleColumns }: { columns: any[], visibleColumns: string[] }) => (
  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/50 dark:bg-slate-800/60">
          <TableHead className="w-[40px] pl-4"><Skeleton className="h-4 w-4" /></TableHead>
          {columns.filter(c => visibleColumns.includes(c.id)).map(c => (
            <TableHead key={c.id} className="h-9 px-3"><Skeleton className="h-3 w-16" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 12 }).map((_, i) => (
          <TableRow key={i} className="border-slate-50 dark:border-slate-800">
            <TableCell className="pl-4"><Skeleton className="h-4 w-4" /></TableCell>
            {columns.filter(c => visibleColumns.includes(c.id)).map(c => (
              <TableCell key={c.id} className="py-3 px-3">
                <div className="flex items-center gap-2">
                  {c.id === 'name' && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
                  <Skeleton className={cn("h-3", c.id === 'name' ? "w-20" : "w-12")} />
                </div>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
  fetchLeads,
  setError,
  stages
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Error Loading Leads</h3>
        <p className="text-xs mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-xs font-medium"
          onClick={() => { setError(null); fetchLeads(); }}
        >
          <RefreshCcw className="h-3 w-3" />
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
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
        <UserCheck className="h-10 w-10 mb-3 opacity-20" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No leads found</h3>
        <p className="text-xs mt-1">Adjust filters or add a new lead.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 overflow-hidden shadow-sm">
      <div className="flex-1 overflow-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <Table wrapperClassName="overflow-visible min-w-max" className="relative border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-50/80">
              <TableHead className="sticky top-0 z-30 w-[40px] pl-4 bg-slate-50/80 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 focus:ring-0"
                  checked={selectedLeads.length > 0 && selectedLeads.length === leads.length}
                  onChange={handleSelectAll}
                />
              </TableHead>
              {columns
                .filter(column => visibleColumns.includes(column.id))
                .map(column => (
                  <TableHead key={column.id}
                    className="sticky top-0 z-30 whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/80 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-1.5">
                      {column.icon && <column.icon className="h-3 w-3 opacity-50" />}
                      {column.label}
                    </div>
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={`lead-${lead.id}`}
                className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <TableCell className="pl-4">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 focus:ring-0"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => handleSelectLead(lead.id)}
                  />
                </TableCell>
                {columns
                  .filter(column => visibleColumns.includes(column.id))
                  .map(column => {
                    const value = (lead as any)[column.id];

                    return (
                      <TableCell key={`${lead.id}-${column.id}`} className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {column.id === 'actions' ? (
                          <div className="flex gap-1.5 whitespace-nowrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(lead)} className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Edit</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleWhatsAppClick(lead)} className="h-7 w-7 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">WhatsApp</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleCallClick(lead)} className="h-7 w-7 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Phone className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Call</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleDealValueClick(lead)} className="h-7 w-7 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <IndianRupee className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Value</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(lead)} className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : column.id === 'name' ? (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 font-bold border border-slate-100 dark:border-slate-700">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">{lead.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate opacity-80">{lead.phone || lead.email}</span>
                            </div>
                          </div>
                        ) : column.id === 'stage' ? (
                          <Badge variant="secondary" className={cn("px-2 py-0 h-4.5 rounded-md text-[9px] font-bold border-none shadow-none", stages[lead.stage]?.color || 'bg-slate-100 text-slate-500')}>
                            {lead.stage}
                          </Badge>
                        ) : column.id === 'status' ? (
                          <Badge variant="secondary" className={cn("px-2 py-0 h-4.5 rounded-md text-[9px] font-bold border-none shadow-none", (temperatureConfig as any)[lead.status]?.color || 'bg-slate-100 text-slate-500')}>
                            {lead.status}
                          </Badge>
                        ) : column.id === 'source' ? (
                          <div className="flex items-center gap-1.5 opacity-80">
                            {(() => {
                              const config = (sourceConfig as any)[lead.source];
                              const Icon = config?.icon || Globe;
                              return <Icon className="h-3 w-3 text-slate-400" />
                            })()}
                            <span className="text-[10px] font-medium uppercase tracking-tight">{lead.source}</span>
                          </div>
                        ) : column.id === 'created_at' ? (
                          <span className="text-slate-400 text-[10px] tabular-nums">
                            {format(new Date(lead.created_at), 'dd MMM, yy | hh:mm a')}
                          </span>
                        ) : column.id === 'deal_value' ? (
                          <div className="flex items-center gap-0.5 text-slate-800 dark:text-slate-200 font-bold tabular-nums">
                            <span className="text-[10px] opacity-40">₹</span>
                            <span>{lead.deal_value || 0}</span>
                          </div>
                        ) : column.id === 'paid_amount' ? (
                          <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                            <span className="text-[10px] opacity-40">₹</span>
                            <span>{lead.paid_amount || 0}</span>
                          </div>
                        ) : (
                          <span className="truncate max-w-[150px] inline-block">{value || '-'}</span>
                        )}
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
