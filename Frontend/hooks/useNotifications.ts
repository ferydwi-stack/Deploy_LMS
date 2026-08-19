import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Notification } from '@/types/models';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(refreshInterval = 30000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        api.getNotifications(),
        api.getUnreadCount(),
      ]);
      setNotifications((notifs as any).notifications || notifs);
      setUnreadCount(count.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchNotifications();
      }
    }, refreshInterval);

    const handleNotificationsRead = () => {
      fetchNotifications();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('notifications_read', handleNotificationsRead);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('notifications_read', handleNotificationsRead);
      }
    };
  }, [refreshInterval]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
