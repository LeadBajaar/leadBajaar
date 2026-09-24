"use client";

import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { PromotionModal } from './promotion-modal';
import { useNotificationBellState } from './notification-bell/useNotificationBellState';
import { NotificationDropdown } from './notification-bell/NotificationDropdown';
import { NotificationConfirmModal } from './notification-bell/NotificationConfirmModal';

export function NotificationBell() {
  const {
    isMounted,
    isOpen,
    setIsOpen,
    loading,
    notifications,
    unreadCount,
    activePromotions,
    handleClosePromotion,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    confirmModal,
    setConfirmModal
  } = useNotificationBellState();

  if (!isMounted) {
    return (
      <button className="flex items-center justify-center h-10 w-10 rounded-full text-[var(--crm-shell-text)] transition-all bg-transparent hover:bg-transparent">
        <Bell className="h-[22px] w-[22px]" />
      </button>
    );
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="relative group flex items-center justify-center h-10 w-10 rounded-full text-[var(--crm-shell-text)] transition-all bg-transparent hover:bg-transparent">
            {unreadCount > 0 ? (
              <BellRing className="h-[22px] w-[22px] text-primary animate-pulse group-hover:scale-110 transition-transform" />
            ) : (
              <Bell className="h-[22px] w-[22px] transition-all" />
            )}
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center p-0.5 text-[8px] font-black bg-primary hover:bg-primary text-white border-2 border-white dark:border-slate-900 shadow-sm"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </button>
        </PopoverTrigger>
        
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          setIsOpen={setIsOpen}
          onMarkAllRead={markAllAsRead}
          onClearAll={clearAllNotifications}
          onMarkRead={(id) => markAsRead([id])}
          onDelete={deleteNotification}
        />
      </Popover>

      {activePromotions.length > 0 && (
        <PromotionModal 
          notifications={activePromotions} 
          onClose={handleClosePromotion}
          onMarkAsRead={(id) => markAsRead([id])}
        />
      )}

      <NotificationConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
