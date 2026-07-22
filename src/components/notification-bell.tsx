"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, X, Trash2, CheckCircle2, UserPlus, Calendar, Facebook, Info, ChevronRight, Check, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PromotionModal } from './promotion-modal';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  lead?: {
    id: number;
    name: string;
    phone: string;
  };
  data?: {
    days_since_creation?: number;
    facebook_lead_id?: string;
    original_created_at?: string;
    frequency?: 'once' | 'session' | 'always';
    [key: string]: any;
  };
}

export function NotificationBell() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activePromotion, setActivePromotion] = useState<any>(null);
  const hasShownModalThisMount = useRef(false);

  // Check if subscription is expired or suspended
  const expiresAt = user?.company?.expires_at ? new Date(user.company.expires_at) : null;
  const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : false;
  const isSuspended = user?.company?.status === 'Suspended';
  const isRestricted = isExpired || isSuspended;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchNotifications = async (isInitial = false) => {
    if (isLoadingUser || !user || isRestricted) return;

    try {
      if (isInitial) setLoading(true);

      const [notificationsResponse, unreadResponse] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);

      const newNotifications = notificationsResponse.data.data || [];
      const newUnreadCount = unreadResponse.data.count || 0;

      if (isInitial) {
        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      } else {
        setNotifications(prev => {
          const existingIds = new Set(prev.map((n: Notification) => n.id));
          const trulyNew = newNotifications.filter((n: Notification) => !existingIds.has(n.id));
          return trulyNew.length > 0 ? [...trulyNew, ...prev] : prev;
        });
        setUnreadCount(newUnreadCount);
      }
      setLastFetchTime(new Date());
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: number[]) => {
    try {
      await api.post('/notifications/mark-read', { notification_ids: notificationIds });
      setNotifications(prev =>
        prev.map((n: Notification) => notificationIds.includes(n.id) ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map((n: Notification) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => {
        const notification = prev.find((n: Notification) => n.id === notificationId);
        if (notification && !notification.is_read) setUnreadCount(p => Math.max(0, p - 1));
        return prev.filter((n: Notification) => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    intervalRef.current = setInterval(() => fetchNotifications(false), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (loading || notifications.length === 0 || activePromotion) return;

    const modalNotifications = notifications.filter(n => n.type === 'platform_modal' && !n.is_read);
    
    if (modalNotifications.length > 0) {
      const latestModal = modalNotifications[0];
      const data = latestModal.data || {};
      const frequency = data.frequency || 'once';
      const storageKey = `promo_shown_${latestModal.id}`;
      
      if (frequency === 'session') {
        if (!sessionStorage.getItem(storageKey)) {
          setActivePromotion(latestModal);
          sessionStorage.setItem(storageKey, 'true');
        }
      } else if (frequency === 'always') {
        if (!hasShownModalThisMount.current) {
          setActivePromotion(latestModal);
          hasShownModalThisMount.current = true;
        }
      } else {
        // 'once'
        setActivePromotion(latestModal);
      }
    }
  }, [notifications, loading]);

  const handleClosePromotion = () => {
    if (activePromotion) {
      const data = activePromotion.data || {};
      const frequency = data.frequency || 'once';
      
      // If it's a 'once' promotion, mark as read in DB so it doesn't show again
      if (frequency === 'once') {
        markAsRead([activePromotion.id]);
      }
      
      setActivePromotion(null);
    }
  };

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

  if (!isMounted) {
    return (
      <button className="flex items-center justify-center h-10 w-10 rounded-full text-[var(--crm-text-secondary)] transition-all bg-transparent hover:bg-transparent">
        <Bell className="h-[22px] w-[22px]" />
      </button>
    );
  }

  return (
    <>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative group flex items-center justify-center h-10 w-10 rounded-full text-[var(--crm-text-secondary)] transition-all bg-transparent hover:bg-transparent">
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
                onClick={markAllAsRead}
                className="h-7 px-2 text-[10px] font-bold uppercase tracking-tight text-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-indigo-900/20 rounded-lg"
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearAllNotifications}
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
              {notifications.map((n) => {
                const config = getNotificationConfig(n.type);
                return (
                  <div
                    key={n.id}
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
                              onClick={() => markAsRead([n.id])}
                              className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 dark:hover:bg-indigo-900/20 rounded-lg gap-1.5"
                            >
                              <Check className="h-3 w-3" /> Mark Read
                            </Button>
                          )}
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(n.id)}
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
              })}
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
    </Popover>
    {activePromotion && (
      <PromotionModal 
        notification={activePromotion} 
        onClose={handleClosePromotion} 
      />
    )}
    </>
  );
}

