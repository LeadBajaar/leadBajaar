import React from 'react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from './types';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  setIsOpen: (open: boolean) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  setIsOpen,
  onMarkAllRead,
  onClearAll,
  onMarkRead,
  onDelete
}: NotificationDropdownProps) {
  return (
    <PopoverContent className="w-[380px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden" align="end">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Notifications</h4>
          <p className="text-[10px] text-slate-500 font-medium">You have {unreadCount} unread alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-tight text-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-indigo-900/20 rounded-lg"
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearAll}
              className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[420px] no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium italic">Scanning for updates...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center p-8">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">No new notifications at the moment. We'll alert you when something happens.</p>
          </div>
        ) : (
          <div className="p-1.5 space-y-1">
            {notifications.map((n) => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
         <Button 
          variant="ghost" 
          className="w-full h-8 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-xl"
          onClick={() => setIsOpen(false)}
         >
           Close Notifications
         </Button>
      </div>
    </PopoverContent>
  );
}
