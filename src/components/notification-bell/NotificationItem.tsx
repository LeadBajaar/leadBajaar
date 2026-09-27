import React from 'react';
import Link from 'next/link';
import { Bell, Calendar, Facebook, UserPlus, Megaphone, Check, Trash2, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Notification } from './types';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (ids: number[]) => void;
  onDelete: (id: number) => void;
  isSelected?: boolean;
  onSelectToggle?: () => void;
}

const getNotificationConfig = (type: string) => {
  switch (type) {
    case 'meeting_booked':
    case 'old_lead_reactivation':
      return { icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/50 dark:border-emerald-500/20' };
    case 'facebook_lead_activity':
    case 'old_lead_facebook_reactivation':
      return { icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200/50 dark:border-blue-500/20' };
    case 'new_lead_created':
      return { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/30' };
    case 'platform_modal':
    case 'platform_broadcast':
      return { icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/30' };
    default:
      return { icon: Bell, color: 'text-[var(--crm-text-secondary)]', bg: 'bg-[var(--crm-surface-3)]', border: 'border-[var(--crm-border)]' };
  }
};

export function NotificationItem({ notification: n, onMarkRead, onDelete, isSelected, onSelectToggle }: NotificationItemProps) {
  const config = getNotificationConfig(n.type);
  return (
    <div
      className={cn(
        "group relative p-5 transition-all duration-300 border-b border-[var(--crm-border)]",
        n.is_read
          ? "bg-[var(--crm-surface-1)] hover:bg-[var(--crm-surface-2)]"
          : "bg-blue-50/30 dark:bg-blue-900/10",
        isSelected && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div 
          onClick={onSelectToggle}
          className={cn(
            "shrink-0 h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm cursor-pointer",
            isSelected 
              ? "bg-blue-600 border-blue-600 text-white" 
              : cn(config.bg, config.border, config.color)
          )}
        >
          {isSelected ? <Check className="h-5 w-5" /> : <config.icon className="h-4 w-4" />}
        </div>
        
        <div className="flex-1 min-w-0 pr-4 sm:pr-6">
          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
            <p className={cn("text-[13px] font-bold break-words leading-tight flex-1 min-w-[120px]", n.is_read ? "text-[var(--crm-text-primary)]" : "text-blue-950 dark:text-blue-100")}>
              {n.title}
            </p>
            <span className="shrink-0 text-[11px] font-medium text-[var(--crm-text-tertiary)] ml-2">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-[12px] text-[var(--crm-text-secondary)] mt-1.5 leading-relaxed break-words line-clamp-2">
            {n.message}
          </p>

          {/* Metadata / Days Ago badge */}
          {n.data?.days_since_creation !== undefined && (
            <div className="mt-2.5 flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-[var(--crm-text-tertiary)]" />
               <p className="text-[9px] font-black text-[var(--crm-text-tertiary)] uppercase tracking-widest">
                 CREATED {Math.round(n.data.days_since_creation)} DAYS AGO
               </p>
            </div>
          )}

          {/* Actions Row */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {n.lead && (
              <Link href={`/leads?id=${n.lead.id}`}>
                <Button variant="outline" className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-3)] transition-all rounded-lg gap-1.5">
                  View Lead <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
            {!n.is_read && (
              <Button
                variant="outline"
                onClick={() => onMarkRead([n.id])}
                className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-800 border-[var(--crm-border)] text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-3)] rounded-lg gap-1.5 transition-all"
              >
                <Check className="h-3.5 w-3.5 text-blue-600" /> Mark Read
              </Button>
            )}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(n.id)}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all text-[var(--crm-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Unread dot */}
      {!n.is_read && (
        <div className="absolute top-5 right-5 h-2 w-2 bg-blue-500 rounded-full shadow-sm" />
      )}
    </div>
  );
}
