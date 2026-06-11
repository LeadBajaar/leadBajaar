'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Lead } from './types'
import { cn } from "@/lib/utils"
import { getAgentColor } from '@/utils/agentColors'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  // We need local state for optimistic updates during drag
  const [boardLeads, setBoardLeads] = useState<Lead[]>(leads);

  useEffect(() => {
    setBoardLeads(leads);
  }, [leads]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 h-full">
        <i className="ti ti-alert-circle text-2xl text-red-400 mb-2" />
        <h3 className="text-sm font-semibold text-[var(--crm-text-primary)] mb-1">Error Loading Leads</h3>
        <p className="text-xs mb-4">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 h-full overflow-x-auto">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[280px] bg-[var(--crm-surface-2)] rounded-[var(--r-xl)] p-3 space-y-3">
            <div className="h-4 w-24 bg-[var(--crm-surface-3)] rounded animate-pulse" />
            <div className="h-24 bg-[var(--crm-surface-1)] rounded-[var(--r-lg)] animate-pulse" />
            <div className="h-24 bg-[var(--crm-surface-1)] rounded-[var(--r-lg)] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const stageKeys = Object.keys(stages);

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
    <div className="flex-1 flex overflow-x-auto overflow-y-hidden p-4 min-h-0 bg-[var(--crm-bg)]">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full items-start">
          {stageKeys.map(stageName => {
            const stageLeads = boardLeads.filter(l => l.stage === stageName);
            const stageConfig = stages[stageName];

            return (
              <div key={stageName} className="flex flex-col min-w-[300px] w-[300px] max-h-full overflow-hidden">
                <div className="p-2 shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-full", stageConfig?.color ? stageConfig.color.split(' ')[0] : 'bg-slate-400')} />
                    <h3 className="font-semibold text-[13px] text-[var(--crm-text-primary)]">{stageName}</h3>
                  </div>
                  <span className="text-xs font-bold text-[var(--crm-text-tertiary)] bg-[var(--crm-surface-3)] px-2 py-0.5 rounded-[var(--r-pill)]">
                    {stageLeads.length}
                  </span>
                </div>

                <Droppable droppableId={stageName}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 overflow-y-auto p-2 space-y-2 min-h-[150px]",
                        snapshot.isDraggingOver && "bg-[var(--crm-surface-3)]/50"
                      )}
                    >
                      {stageLeads.map((lead, index) => (
                        <Draggable key={`lead-${lead.id}`} draggableId={`lead-${lead.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleCardClick?.(lead.id)}
                              className={cn(
                                "bg-[var(--crm-surface-2)] p-3 rounded-[var(--r-lg)] border cursor-pointer hover:shadow-md transition-all duration-200",
                                snapshot.isDragging ? "shadow-lg scale-[1.02] border-[var(--crm-blue-border)] z-50" : "shadow-sm border-[var(--crm-border)]"
                              )}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--r-md)] bg-[var(--crm-surface-3)] text-[11px] text-[var(--crm-text-primary)] font-bold">
                                    {lead.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-[13px] text-[var(--crm-text-primary)] truncate">{lead.name}</span>
                                    <span className="text-[11px] text-[var(--crm-text-tertiary)] truncate">{lead.company || lead.phone || lead.email}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--crm-border)]">
                                <span className="text-[11px] text-[var(--crm-text-tertiary)] font-medium">
                                  {lead.deal_value ? `₹${lead.deal_value}` : 'No value'}
                                </span>
                                
                                <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={(e) => { e.stopPropagation(); handleWhatsAppClick(lead); }} className="btn-icon w-6 h-6 hover:text-emerald-500">
                                          <i className="ti ti-brand-whatsapp text-[13px]" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="text-[10px]">WhatsApp</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={(e) => { e.stopPropagation(); handleCallClick(lead); }} className="btn-icon w-6 h-6 hover:text-blue-500">
                                          <i className="ti ti-phone text-[13px]" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="text-[10px]">Call</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleAssignAgentClick(lead); }} 
                                          className={cn("btn-icon w-6 h-6 hover:text-purple-500", lead.agent && "ring-1")}
                                          style={lead.agent ? {
                                            backgroundColor: getAgentColor(lead.agent.id).bg,
                                            color: getAgentColor(lead.agent.id).text,
                                            borderColor: getAgentColor(lead.agent.id).border,
                                          } : {}}
                                        >
                                          <i className="ti ti-user-check text-[13px]" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="text-[10px]">{lead.agent ? lead.agent.name : 'Assign'}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
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
