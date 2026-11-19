
import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useSocket } from './SocketContext.jsx';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const socket = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Fetch notifications only after authentication is resolved.
  const fetchNotifs = useCallback(async () => {
    if (authLoading || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setNotificationLoading(true);

      const response = await api.get('/notifications');
      const result = response.data?.data;

      setNotifications(result?.items || []);
      setUnreadCount(result?.unreadCount || 0);
    } catch (error) {
      console.error(
        'Unable to fetch notifications:',
        error.response?.data?.message || error.message
      );

      if (error.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setNotificationLoading(false);
    }
  }, [authLoading, user]);

  // Fetch only when a user is logged in.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifs();
  }, [authLoading, user, fetchNotifs]);

  // Listen for real-time notifications.
  useEffect(() => {
    if (!user || !socket) return;

    const handleNotification = (notification) => {
      setNotifications((previous) => {
        const exists = previous.some(
          (item) =>
            (item._id || item.id) ===
            (notification._id || notification.id)
        );

        if (exists) return previous;

        return [notification, ...previous].slice(0, 100);
      });

      setUnreadCount((count) => count + 1);

      if (notification.alarm) {
        const audio = new Audio('/sounds/waiter-alert.mp3');
        audio.play().catch(() => {
          // Browser may block sound until the user interacts with the page.
        });
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, user]);

  // Mark all notifications as read.
  const markAllRead = useCallback(async () => {
    if (!user) return;

    try {
      await api.patch('/notifications/read-all');

      setUnreadCount(0);

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        'Unable to mark notifications as read:',
        error.response?.data?.message || error.message
      );

      throw error;
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationLoading,
        markAllRead,
        fetchNotifs,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
