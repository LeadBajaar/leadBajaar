'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Lead, defaultStages, temperatureConfig, sourceConfig } from './types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from "@/lib/utils"
import { getAgentColor } from '@/utils/agentColors'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Phone, 
  MessageSquare, 
  IndianRupee, 
  Globe, 
  AlertCircle, 
  Flame, 
  ThermometerSun, 
  Snowflake,
  User,
  Building2,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { useTheme } from 'next-themes'

interface KanbanBoardProps {
  leads: Lead[];
  stages: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  handleStageChange: (leadId: number, newStage: string) => Promise<void>;
  handleEdit: (lead: Lead) => void;
  handleWhatsAppClick: (lead: Lead) => void;
  handleCallClick: (lead: Lead) => void;
  handleDealValueClick: (lead: Lead) => void;
  handleAssignAgentClick: (lead: Lead) => void;
  handleDelete: (lead: Lead) => void;
  handleCardClick?: (id: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  stages,
  isLoading,
  error,
  handleStageChange,
  handleEdit,
  handleWhatsAppClick,
  handleCallClick,
  handleDealValueClick,
  handleAssignAgentClick,
  handleDelete,
  handleCardClick
}) => {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'

  // Local state for optimistic updates during drag
  const [boardLeads, setBoardLeads] = useState<Lead[]>(leads);

  useEffect(() => {
    setBoardLeads(leads);
  }, [leads]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <i className="ti ti-alert-circle text-3xl text-rose-500 mb-3" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Error Loading Leads</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex gap-5 p-4 sm:p-5 h-full overflow-x-auto bg-[var(--crm-surface-2)]/30 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[310px] w-[310px] bg-[var(--crm-surface-1)] dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 skeleton rounded-md" />
              <div className="h-5 w-8 skeleton rounded-full" />
            </div>
            <div className="h-32 bg-slate-50 dark:bg-slate-850 rounded-xl skeleton" />
            <div className="h-32 bg-slate-50 dark:bg-slate-850 rounded-xl skeleton" />
            <div className="h-32 bg-slate-50 dark:bg-slate-850 rounded-xl skeleton" />
          </div>
        ))}
      </div>
    );
  }

  const stageKeys = Object.keys(stages && Object.keys(stages).length > 0 ? stages : defaultStages);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const leadId = parseInt(draggableId.split('-')[1]);
    const newStage = destination.droppableId;
    const oldStage = source.droppableId;

    if (newStage !== oldStage) {
      // Optimistic update
      setBoardLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
      try {
        await handleStageChange(leadId, newStage);
      } catch (e) {
        // Revert on failure
        setBoardLeads(leads);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[var(--crm-surface-2)]/30 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 sm:p-5">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-5 overflow-x-auto overflow-y-hidden pb-2 items-start select-none custom-scrollbar">
          {stageKeys.map(stageName => {
            const stageLeads = boardLeads.filter(l => l.stage === stageName);
            const stageConfig = stages[stageName] || (defaultStages as any)[stageName];
            const totalStageValue = stageLeads.reduce((sum, lead) => sum + (Number(lead.deal_value) || 0), 0);

            return (
              <div 
                key={stageName} 
                className="flex flex-col min-w-[310px] w-[310px] max-h-full bg-[var(--crm-surface-1)] dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden shrink-0 transition-all duration-200"
              >
                {/* Stage Column Header */}
                <div className="p-3.5 shrink-0 border-b border-slate-100 dark:border-slate-800/90 flex flex-col gap-1.5 bg-slate-50/50 dark:bg-slate-850/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900 shadow-sm", 
                          stageConfig?.color ? stageConfig.color.split(' ')[0] : 'bg-slate-400'
                        )} 
                      />
                      <h3 className="font-extrabold text-[13.5px] text-slate-800 dark:text-slate-100 truncate tracking-tight">
                        {stageName}
                      </h3>
                    </div>
                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-full shadow-xs shrink-0">
                      {stageLeads.length}
                    </span>
                  </div>

                  {totalStageValue > 0 && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-0.5">
                      <span>Total Value:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-extrabold tabular-nums">₹{totalStageValue.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stageName}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 overflow-y-auto p-3 space-y-3 min-h-[160px] custom-scrollbar transition-colors rounded-b-2xl",
                        snapshot.isDraggingOver && "bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 ring-inset"
                      )}
                    >
                      {stageLeads.length === 0 && !snapshot.isDraggingOver ? (
                        <div className="h-28 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-xs font-semibold gap-1">
                          <i className="ti ti-arrow-down-left text-lg opacity-60" />
                          <span>Drop leads here</span>
                        </div>
                      ) : null}

                      {stageLeads.map((lead, index) => {
                        const tempConfig = (temperatureConfig as any)[lead.status];
                        const TempIcon = tempConfig?.icon || Flame;

                        return (
                          <Draggable key={`lead-${lead.id}`} draggableId={`lead-${lead.id}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleCardClick?.(lead.id)}
                                className={cn(
                                  "group relative bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-750/90 p-3.5 cursor-grab active:cursor-grabbing transition-all duration-200",
                                  snapshot.isDragging 
                                    ? "shadow-2xl scale-[1.03] border-indigo-500 ring-2 ring-indigo-500/30 z-50 rotate-[0.5deg]" 
                                    : "shadow-xs hover:shadow-md hover:border-indigo-400/60 dark:hover:border-indigo-500/60"
                                )}
                              >
                                {/* Top Row: Avatar Initial, Name, Temp Badge */}
                                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[12px] shadow-sm">
                                      {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight flex items-center gap-1">
                                        {lead.name}
                                        {lead.is_incomplete && (
                                          <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                                        )}
                                      </span>
                                      {(lead.company || lead.profession || lead.city || lead.email) ? (
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-normal mt-0.5">
                                          {lead.company || lead.profession || lead.city || lead.email}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>

                                  {/* Temperature Tag */}
                                  {lead.status && (
                                    <Badge 
                                      className={cn(
                                        "px-2 py-0.5 text-[10px] font-medium rounded-full flex items-center gap-1 border-none shrink-0 shadow-xs text-white",
                                        (temperatureConfig as any)[lead.status]?.color || "bg-slate-500"
                                      )}
                                    >
                                      {lead.status}
                                    </Badge>
                                  )}
                                </div>

                                {/* Contact & Details Row */}
                                <div className="space-y-1 my-2 py-1.5 border-y border-slate-100 dark:border-slate-800/80 text-[11.5px] text-slate-600 dark:text-slate-300 font-normal">
                                  {lead.phone && (
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                      <span className="truncate tabular-nums font-normal">{lead.phone}</span>
                                    </div>
                                  )}
                                  {lead.source && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                      <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{lead.source}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Bottom Row: Deal Value & Action Icons */}
                                <div className="flex items-center justify-between pt-1.5">
                                  <div className="flex items-center gap-1 text-[12px] font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                                    {lead.deal_value ? (
                                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">₹{Number(lead.deal_value).toLocaleString('en-IN')}</span>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 font-normal">₹0</span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleWhatsAppClick(lead); }} 
                                            className="h-6 w-6 rounded-[6px] flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-all hover:scale-[1.08] active:scale-[0.92] shadow-sm cursor-pointer border border-emerald-700/10 p-0"
                                          >
                                            <i className="ti ti-brand-whatsapp text-[13px]" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-[10px]">WhatsApp</TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleCallClick(lead); }} 
                                            className="h-6 w-6 rounded-[6px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-all hover:scale-[1.08] active:scale-[0.92] shadow-sm cursor-pointer border border-blue-700/10 p-0"
                                          >
                                            <i className="ti ti-phone text-[13px]" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-[10px]">Call</TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleDealValueClick(lead); }} 
                                            className="h-6 w-6 rounded-[6px] flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-600 transition-all hover:scale-[1.08] active:scale-[0.92] shadow-sm cursor-pointer border border-amber-600/10 p-0"
                                          >
                                            <i className="ti ti-currency-rupee text-[13px]" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-[10px]">Deal Value</TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleAssignAgentClick(lead); }} 
                                            className={cn(
                                              "h-6 w-6 rounded-[6px] flex items-center justify-center transition-all hover:scale-[1.08] active:scale-[0.92] shadow-sm cursor-pointer p-0",
                                              lead.agent 
                                                ? "border border-purple-700/15" 
                                                : "bg-purple-600 hover:bg-purple-700 text-white border border-purple-700/10"
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
                                            {lead.agent ? (
                                              <span className="text-[10px] font-black">{lead.agent.name.charAt(0).toUpperCase()}</span>
                                            ) : (
                                              <i className="ti ti-user-plus text-[12px]" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-[10px]">
                                          {lead.agent ? `Assigned to: ${lead.agent.name}` : 'Assign Agent'}
                                        </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(lead); }} 
                                            className="h-6 w-6 rounded-[6px] flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all hover:scale-[1.08] active:scale-[0.92] shadow-sm cursor-pointer border border-indigo-700/10 p-0"
                                          >
                                            <i className="ti ti-edit text-[13px]" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-[10px]">Edit Lead</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
