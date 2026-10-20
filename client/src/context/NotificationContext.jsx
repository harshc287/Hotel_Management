import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext.jsx';
import { api } from '../services/api.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.items);
      setUnreadCount(data.data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  useEffect(() => {
    if (!socket) return;
    socket.on('notification', (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 100));
      setUnreadCount((c) => c + 1);
      if (n.alarm) {
        const audio = new Audio('/sounds/waiter-alert.mp3');
        audio.play().catch(() => {});
      }
    });
    return () => socket.off('notification');
  }, [socket]);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, fetchNotifs }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() { return useContext(NotificationContext); }