import React from 'react';
import Link from 'next/link';
import { Bell, Calendar, Facebook, UserPlus, Megaphone, Check, Trash2, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification } from './types';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const getNotificationConfig = (type: string) => {
  switch (type) {
    case 'meeting_booked':
    case 'old_lead_reactivation':
      return { icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/30' };
    case 'facebook_lead_activity':
    case 'old_lead_facebook_reactivation':
      return { icon: Facebook, color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800/30' };
    case 'new_lead_created':
      return { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/30' };
    case 'platform_modal':
    case 'platform_broadcast':
      return { icon: Megaphone, color: 'text-primary', bg: 'bg-primary/10 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/30' };
    default:
      return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-100 dark:border-slate-800/30' };
  }
};

export function NotificationItem({ notification: n, onMarkRead, onDelete }: NotificationItemProps) {
  const config = getNotificationConfig(n.type);
  return (
    <div
      className={cn(
        "group relative p-3 rounded-xl transition-all duration-200 border border-transparent",
        n.is_read
          ? "hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-100 dark:hover:border-slate-800"
          : "bg-primary/5 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-800/30 shadow-[0_2px_10px_-4px_rgba(99,102,241,0.1)]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-300", config.bg, config.border, config.color)}>
          <config.icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("text-xs font-bold truncate leading-none", n.is_read ? "text-slate-900 dark:text-slate-100" : "text-indigo-900 dark:text-indigo-400")}>
              {n.title}
            </p>
            <span className="shrink-0 text-[9px] font-medium text-slate-400">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2 italic">
            {n.message}
          </p>

          {/* Metadata / Days Ago badge */}
          {n.data?.days_since_creation !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                 CREATED {Math.round(n.data.days_since_creation)} DAYS AGO
               </p>
            </div>
          )}

          {/* Actions Row */}
          <div className="mt-3 flex items-center gap-2">
            {n.lead && (
              <Link href={`/leads?id=${n.lead.id}`}>
                <Button variant="outline" className="h-7 px-2.5 text-[10px] font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:text-primary transition-all rounded-lg gap-1.5">
                  View Lead <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
            {!n.is_read && (
              <Button
                variant="ghost"
                onClick={() => onMarkRead(n.id)}
                className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 dark:hover:bg-indigo-900/20 rounded-lg gap-1.5"
              >
                <Check className="h-3 w-3" /> Mark Read
              </Button>
            )}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(n.id)}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Unread dot */}
      {!n.is_read && (
        <div className="absolute top-3 right-3 h-1.5 w-1.5 bg-primary/100 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
      )}
    </div>
  );
}
