"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, X, Trash2 } from 'lucide-react';
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
  };
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchNotifications = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }

      const [notificationsResponse, unreadResponse] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);

      const newNotifications = notificationsResponse.data.data || [];
      const newUnreadCount = unreadResponse.data.count || 0;

      if (isInitial) {
        // Initial load - replace all notifications
        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      } else {
        // Subsequent loads - only add new notifications
        setNotifications(prev => {
          const existingIds = new Set(prev.map((n: Notification) => n.id));
          const trulyNew = newNotifications.filter((n: Notification) => !existingIds.has(n.id));

          if (trulyNew.length > 0) {
            return [...trulyNew, ...prev];
          }
          return prev;
        });

        // Update unread count
        setUnreadCount(newUnreadCount);
      }

      setLastFetchTime(new Date());
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  const markAsRead = async (notificationIds: number[]) => {
    try {
      await api.post('/notifications/mark-read', {
        notification_ids: notificationIds
      });

      // Update local state
      setNotifications(prev =>
        prev.map((notification: Notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map((notification: Notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      console.log('Deleting notification:', notificationId);
      const response = await api.delete(`/notifications/${notificationId}`);
      console.log('Delete response:', response);

      // Remove from local state
      setNotifications(prev => {
        const notification = prev.find((n: Notification) => n.id === notificationId);
        const newNotifications = prev.filter((n: Notification) => n.id !== notificationId);

        // Update unread count if the deleted notification was unread
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        return newNotifications;
      });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
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
    // Initial fetch
    fetchNotifications(true);

    // Poll for new notifications every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting_booked':
        return '📅'; // Meeting booking
      case 'facebook_lead_activity':
        return '📘'; // Facebook form submission
      case 'new_lead_created':
        return '🎉'; // New lead
      case 'old_lead_reactivation':
        return '📅'; // Legacy meeting booking
      case 'old_lead_facebook_reactivation':
        return '📘'; // Legacy Facebook form submission
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'meeting_booked':
        return 'text-green-600'; // Meeting booking - green
      case 'facebook_lead_activity':
        return 'text-blue-800'; // Facebook form - blue
      case 'new_lead_created':
        return 'text-purple-600'; // New lead - purple
      case 'old_lead_reactivation':
        return 'text-green-600'; // Legacy meeting booking - green
      case 'old_lead_facebook_reactivation':
        return 'text-blue-800'; // Legacy Facebook form - blue
      default:
        return 'text-gray-600';
    }
  };

  const formatNotificationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!isMounted) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-colors group relative ${notification.is_read
                    ? 'hover:bg-gray-50'
                    : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {(() => {
                          const msg = String(notification.message ?? '');
                          const match = msg.match(/after\s+([0-9]*\.?[0-9]+)\s+days/i);
                          if (match) {
                            const raw = Number(match[1]);
                            const days = Number.isFinite(raw) ? Math.round(raw) : 0;
                            const label = days === 1 ? 'day' : 'days';
                            return msg.replace(match[0], `after ${days} ${label}`);
                          }
                          return msg;
                        })()}
                      </p>
                      {notification.data?.days_since_creation !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {(() => {
                            const raw = Number(notification.data.days_since_creation);
                            const days = Number.isFinite(raw) ? Math.round(raw) : 0;
                            const label = days === 1 ? 'day' : 'days';
                            return `Lead was created ${days} ${label} ago`;
                          })()}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead([notification.id])}
                              className="h-6 px-2 text-xs"
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
