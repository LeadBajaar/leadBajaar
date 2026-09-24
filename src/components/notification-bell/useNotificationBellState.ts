import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { Notification } from './types';

export function useNotificationBellState() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activePromotions, setActivePromotions] = useState<any[]>([]);
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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const markAsRead = async (notificationIds: number[]) => {
    try {
      await api.post('/notifications/mark-read', { notification_ids: notificationIds });
      setNotifications(prev => prev.map(n => 
        notificationIds.includes(n.id) ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const executeDeleteNotification = async (notificationId: number) => {
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

  const deleteNotification = (notificationId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Notification",
      description: "Are you sure you want to delete this notification?",
      onConfirm: () => executeDeleteNotification(notificationId)
    });
  };

  const executeClearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const clearAllNotifications = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear All Notifications",
      description: "Are you sure you want to clear all notifications? This action cannot be undone.",
      onConfirm: () => executeClearAllNotifications()
    });
  };

  useEffect(() => {
    fetchNotifications(true);
    intervalRef.current = setInterval(() => fetchNotifications(false), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user, isLoadingUser, isRestricted]); // Need to include dependencies to avoid stale closures if user changes

  useEffect(() => {
    if (loading || notifications.length === 0 || activePromotions.length > 0) return;

    const modalNotifications = notifications.filter(n => n.type === 'platform_modal' && !n.is_read);
    
    if (modalNotifications.length > 0) {
      const validPromotions: any[] = [];
      
      modalNotifications.forEach(modal => {
        const data = modal.data || {};
        const frequency = data.frequency || 'once';
        const storageKey = `promo_shown_${modal.id}`;
        
        if (frequency === 'session') {
          if (!sessionStorage.getItem(storageKey)) {
            validPromotions.push(modal);
            sessionStorage.setItem(storageKey, 'true');
          }
        } else if (frequency === 'always') {
          // 'always' modals show every time the bell mounts
          validPromotions.push(modal);
        } else {
          // 'once'
          validPromotions.push(modal);
        }
      });
      
      if (validPromotions.length > 0) {
        if (!hasShownModalThisMount.current) {
           hasShownModalThisMount.current = true;
        }
        setActivePromotions(validPromotions);
      }
    }
  }, [notifications, loading, activePromotions.length]);

  const handleClosePromotion = () => {
    setActivePromotions([]);
  };

  return {
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
  };
}
