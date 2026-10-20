import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext.jsx';
export function useNotifications() { return useContext(NotificationContext); }