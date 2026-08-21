import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import type { Notification } from '@/types/models';

const BROADCAST_CHANNEL_NAME = 'lms-realtime-channel';

export function useNotifications(refreshInterval = 8000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        api.getNotifications().catch(() => []),
        api.getUnreadCount().catch(() => ({ unread_count: 0 })),
      ]);
      if (isMountedRef.current) {
        setNotifications((notifs as any).notifications || notifs || []);
        setUnreadCount(count?.unread_count || 0);
        lastFetchTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

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

  // Initial load
  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Interval polling (stops when tab is inactive)
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        void fetchNotifications();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchNotifications, refreshInterval]);

  // Window Focus & Online Revalidation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRevalidate = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (Date.now() - lastFetchTimeRef.current > 2500) {
        void fetchNotifications();
      }
    };

    window.addEventListener('focus', handleRevalidate);
    window.addEventListener('online', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);

    return () => {
      window.removeEventListener('focus', handleRevalidate);
      window.removeEventListener('online', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
    };
  }, [fetchNotifications]);

  // Realtime Events & Broadcast Channel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleEvent = () => {
      void fetchNotifications();
    };

    window.addEventListener('lms:notifications', handleEvent);
    window.addEventListener('lms:assignments', handleEvent);
    window.addEventListener('notifications_read', handleEvent);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.onmessage = (msg) => {
          const eventName = msg?.data?.event;
          if (eventName === 'lms:notifications' || eventName === 'lms:assignments') {
            void fetchNotifications();
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('lms:notifications', handleEvent);
      window.removeEventListener('lms:assignments', handleEvent);
      window.removeEventListener('notifications_read', handleEvent);
      if (channel) channel.close();
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
