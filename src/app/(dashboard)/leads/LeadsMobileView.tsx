'use client'

import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Phone,
  IndianRupee,
  RefreshCcw,
  User,
  Users,
  Trash2,
  Map,
  Mail,
  Clock,
  Check,
  AlertCircle,
  SearchX,
  Plus,
  Briefcase,
  Pencil,
  UserCircle,
  MapPin,
  Building2
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Lead } from './types'
import { getAgentColor } from '@/utils/agentColors'
import { useTheme } from 'next-themes'
import { formatDistanceToNowStrict } from 'date-fns'

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
  handleAssignAgentClick: (lead: Lead) => void;
  handleCardClick: (id: number) => void;
  handleStageChange?: (leadId: number | undefined, stage: string) => void;
  stages: Record<string, any>;
  onRetry?: () => void;
  onAddLead?: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export const LeadsMobileSkeleton = () => (
  <div className="pb-24">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-[var(--crm-surface-1)] border-b border-[var(--crm-border)] px-4 py-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded-md mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40 rounded" />
            <div className="flex items-end justify-between pt-1">
              <Skeleton className="h-3 w-24 rounded" />
              <div className="flex gap-1.5">
                <Skeleton className="h-9 w-14 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

import { MobileActionsBottomSheet } from './mobile/MobileActionsBottomSheet'

const SWIPE_OPEN_OFFSET = -120;
const LONG_PRESS_MS = 450;

const SwipeableLeadCard = React.memo(({
  lead,
  isSelected,
  selectionMode,
  stage,
  isDark,
  isSwipeOpen,
  onSwipeOpenChange,
  onSelect,
  onClick,
  onActionClick,
  onAssign,
  onCall,
  onWhatsApp,
  onDealValue,
  onDelete
}: any) => {
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = React.useRef(false);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const agentFirstName = (name?: string | null) =>
    (name || '').trim().split(' ')[0].slice(0, 6);

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Long-press to enter selection mode (react-swipeable attaches its own
  // listeners through the ref, so these touch props don't clash with it)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTriggered.current = false;
    cancelLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15);
      onSelect();
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStart.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
    if (dx > 10 || dy > 10) cancelLongPress();
  };

  const handleForegroundClick = () => {
    // A click fires right after a long-press releases — swallow it
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    if (selectionMode) {
      onSelect();
      return;
    }
    onClick();
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border transition-all cursor-pointer flex flex-col h-full select-none",
      isSelected
        ? "border-[var(--crm-accent)] shadow-sm shadow-[var(--crm-accent)]/10 bg-[var(--crm-accent-soft)]"
        : "border-[var(--crm-border)]/40 shadow-xs bg-[var(--crm-surface-1)]"
    )}
    onClick={handleForegroundClick}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={cancelLongPress}
    >
        {/* Card content */}
        <div className="px-3 py-2.5">
          <div className="flex items-start gap-2.5">
            <button /* TODO: Selection toggle */
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              aria-label={isSelected ? 'Deselect lead' : 'Select lead'}
              className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                isSelected
                  ? "bg-[var(--crm-accent)] border-[var(--crm-accent)] text-white"
                  : "border-[var(--crm-border)] bg-[var(--crm-surface-1)]"
              )}
            >
              {isSelected && <Check className="h-2.5 w-2.5" />}
            </button>
            <div className="min-w-0 flex-1">
              {/* Name + Badge row */}
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[14px] font-medium text-[var(--crm-text-primary)] truncate leading-tight">
                  {lead.name}
                </h4>
                <span className={cn(
                  "shrink-0 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider",
                  stage.tonalClass || stage.color
                )}>
                  {lead.stage}
                </span>
              </div>
              
              {/* Phone + Sub-info row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                 <div className="flex items-center gap-1.5 text-[12px] text-[var(--crm-text-secondary)] font-medium truncate">
                   {lead.phone ? (
                     <><Phone className="h-3 w-3 text-slate-400 shrink-0" /><span className="truncate">{lead.phone}</span></>
                   ) : lead.email ? (
                     <><Mail className="h-3 w-3 text-slate-400 shrink-0" /><span className="truncate">{lead.email}</span></>
                   ) : null}
                 </div>
                 
                 {/* Time + deal */}
                 <div className="flex items-center gap-2 text-[10px] text-[var(--crm-text-tertiary)] shrink-0">
                    {lead.deal_value > 0 && (
                      <Button
                        variant="ghost"
                        className="inline-flex items-center gap-0.5 h-4 px-1.5 rounded-sm font-bold bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] w-auto p-0"
                        onClick={(e) => { e.stopPropagation(); onDealValue(lead); }}
                      >
                        <IndianRupee className="h-2.5 w-2.5" />
                        {Number(lead.deal_value).toLocaleString('en-IN')}
                      </Button>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNowStrict(new Date(lead.created_at), { addSuffix: true })}
                    </span>
                 </div>
              </div>

              {/* Tags row */}
              {(lead.city || lead.profession || lead.company) && (
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--crm-text-tertiary)] font-medium truncate">
                  {lead.profession && <span className="truncate">{lead.profession}</span>}
                  {lead.profession && (lead.company || lead.city) && <span>•</span>}
                  {lead.company && <span className="truncate">{lead.company}</span>}
                  {lead.company && lead.city && <span>•</span>}
                  {lead.city && <span className="truncate">{lead.city}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Row - Integrated directly without divider */}
        <div className="px-2 pb-2 pt-0 flex items-center justify-between ml-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost" size="icon"
              onClick={(e) => { e.stopPropagation(); if (lead.phone) onCall(lead); }}
              disabled={!lead.phone}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-md transition-colors p-0",
                lead.phone ? "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-700"
              )}
            >
              <Phone className="h-[15px] w-[15px]" />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={(e) => { e.stopPropagation(); if (lead.phone) onWhatsApp(lead); }}
              disabled={!lead.phone}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-md transition-colors p-0",
                lead.phone ? "text-[#25D366] hover:bg-[#25D366]/10" : "text-slate-300 dark:text-slate-700"
              )}
            >
              <i className="ti ti-brand-whatsapp text-[17px] leading-none" />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={(e) => { e.stopPropagation(); onAssign(lead); }}
              className="h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative p-0"
            >
              <i className="ti ti-user-check text-[17px] leading-none" />
              {lead.agent && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />}
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={(e) => { e.stopPropagation(); onActionClick(lead); }}
              className="h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-0"
            >
              <i className="ti ti-edit text-[17px] leading-none" />
            </Button>
          </div>
          <Button
            variant="ghost" size="icon"
            onClick={(e) => { e.stopPropagation(); onDelete(lead); }}
            className="h-8 w-8 flex items-center justify-center rounded-md text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors p-0"
          >
            <Trash2 className="h-[15px] w-[15px]" />
          </Button>
        </div>
      </div>
  );
});
SwipeableLeadCard.displayName = 'SwipeableLeadCard';

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
  handleDealValueClick,
  handleAssignAgentClick,
  handleCardClick,
  handleStageChange,
  stages,
  onRetry,
  onAddLead,
  hasActiveFilters,
  onClearFilters
}) => {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'

  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [openSwipeId, setOpenSwipeId] = React.useState<number | null>(null);
  const selectionMode = selectedLeads.length > 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-14 w-14 rounded-full bg-[var(--crm-red-soft)] flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-[var(--crm-red)]" />
        </div>
        <p className="text-[14px] font-semibold text-[var(--crm-text-primary)] mb-1">Something went wrong</p>
        <p className="text-[12px] text-[var(--crm-text-secondary)] mb-5 max-w-[260px]">{error}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="h-10 px-5 rounded-full bg-[var(--crm-accent)] hover:opacity-90 text-white text-[13px] font-medium"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <LeadsMobileSkeleton />
  }

  if (leads.length === 0) {
    return hasActiveFilters ? (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-14 w-14 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center mb-4">
          <SearchX className="h-7 w-7 text-[var(--crm-text-tertiary)]" />
        </div>
        <p className="text-[14px] font-semibold text-[var(--crm-text-primary)] mb-1">No leads match your filters</p>
        <p className="text-[12px] text-[var(--crm-text-secondary)] mb-5 max-w-[260px]">Try adjusting or clearing your filters to see more leads.</p>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="h-10 px-5 rounded-full border-[var(--crm-border)] text-[var(--crm-text-primary)] text-[13px] font-medium"
          >
            Clear filters
          </Button>
        )}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-14 w-14 rounded-full bg-[var(--crm-accent-soft)] flex items-center justify-center mb-4">
          <Users className="h-7 w-7 text-[var(--crm-accent)]" />
        </div>
        <p className="text-[14px] font-semibold text-[var(--crm-text-primary)] mb-1">No leads yet</p>
        <p className="text-[12px] text-[var(--crm-text-secondary)] mb-5 max-w-[260px]">Add your first lead or import from Facebook to get started.</p>
        {onAddLead && (
          <Button
            onClick={onAddLead}
            className="h-10 px-5 rounded-full bg-[var(--crm-accent)] hover:opacity-90 text-white text-[13px] font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first lead
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="pb-28 min-h-full px-[2px] pt-[5px] flex flex-col gap-[5px]">
      {leads.map((lead) => {
        const stage = stages[lead.stage] || { color: 'bg-slate-100 text-slate-500', icon: User };
        const isSelected = selectedLeads.includes(lead.id);

        return (
          <SwipeableLeadCard
            key={lead.id}
            lead={lead}
            isSelected={isSelected}
            selectionMode={selectionMode}
            stage={stage}
            isDark={isDark}
            isSwipeOpen={openSwipeId === lead.id}
            onSwipeOpenChange={setOpenSwipeId}
            onSelect={() => handleSelectLead(lead.id)}
            onClick={() => handleCardClick(lead.id)}
            onActionClick={(l: Lead) => { setActiveLead(l); setIsActionsOpen(true); }}
            onAssign={handleAssignAgentClick}
            onCall={handleCallClick}
            onWhatsApp={handleWhatsAppClick}
            onDealValue={handleDealValueClick}
            onDelete={handleDelete}
          />
        )
      })}

      <MobileActionsBottomSheet
        isOpen={isActionsOpen}
        onOpenChange={setIsActionsOpen}
        lead={activeLead}
        stages={stages}
        onEdit={handleEdit}
        onStageSelect={(l, stage) => handleStageChange?.(l.id, stage)}
        onDealValue={handleDealValueClick}
        onAssign={handleAssignAgentClick}
        onDelete={handleDelete}
      />
    </div>
  )
}
