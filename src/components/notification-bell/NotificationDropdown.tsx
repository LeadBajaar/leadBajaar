import React, { useState } from 'react';
import { Trash2, CheckCircle2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Notification } from './types';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  setIsOpen: (open: boolean) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkRead: (ids: number[]) => void;
  onDelete: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  setIsOpen,
  onMarkAllRead,
  onClearAll,
  onMarkRead,
  onDelete,
  onBulkDelete
}: NotificationDropdownProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectToggle = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkRead = () => {
    onMarkRead(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <SheetContent className="w-full sm:w-[400px] sm:max-w-md p-0 bg-[var(--crm-surface-1)] border-l border-[var(--crm-border)] shadow-2xl flex flex-col h-full gap-0" side="right">
      {/* Header */}
      <SheetHeader className="px-5 py-5 bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => notifications.length > 0 && handleSelectAll(selectedIds.length !== notifications.length)}
              className={cn(
                "shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm",
                notifications.length > 0 && selectedIds.length === notifications.length
                  ? "bg-blue-600 text-white border border-blue-600" 
                  : "bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-2)] border border-[var(--crm-border)]"
              )}
            >
              {notifications.length > 0 && selectedIds.length === notifications.length ? (
                <CheckCircle2 className="h-4.5 w-4.5" />
              ) : (
                <Bell className="h-4.5 w-4.5" />
              )}
            </div>
            <SheetTitle className="text-[16px] font-black text-[var(--crm-text-primary)] tracking-tight text-left">
              Notifications
            </SheetTitle>
          </div>
        </div>
        <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium text-left mt-1 ml-[44px]">
          {selectedIds.length > 0 
            ? `${selectedIds.length} notification${selectedIds.length > 1 ? 's' : ''} selected` 
            : `You have ${unreadCount} unread alerts requiring your attention`}
        </p>
      </SheetHeader>

      {/* Action Toolbar */}
      {notifications.length > 0 && (
        <div className="px-4 sm:px-5 py-3 bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)] flex flex-wrap items-center justify-end shrink-0 gap-2">
          {selectedIds.length > 0 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRead}
                className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 border-blue-600/20 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                Mark Selected Read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </>
          ) : (
            <>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAllRead}
                  className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--crm-text-primary)] border-[var(--crm-border)] hover:bg-[var(--crm-surface-3)] rounded-lg transition-all"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--crm-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </Button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-3">
            <div className="h-6 w-6 border-2 border-[var(--crm-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-widest">Scanning for updates...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
            <div className="h-14 w-14 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center mb-4 text-[var(--crm-text-tertiary)] border border-[var(--crm-border)]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="text-[14px] font-black text-[var(--crm-text-primary)]">All caught up!</p>
            <p className="text-[11px] text-[var(--crm-text-secondary)] mt-1.5 leading-relaxed font-medium">No new notifications at the moment. We'll alert you when something happens.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkRead={onMarkRead}
                onDelete={onDelete}
                isSelected={selectedIds.includes(n.id)}
                onSelectToggle={() => handleSelectToggle(n.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </SheetContent>
  );
}
