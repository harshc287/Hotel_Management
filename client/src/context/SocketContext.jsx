
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const SocketContext = createContext({ socket: null, latest: null });
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [latest, setLatest] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('rms_token');
    if (!token) return;
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { auth: { token }, transports: ['websocket','polling'] });
    s.on('notification:new', setLatest);
    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, []);
  return <SocketContext.Provider value={{ socket, latest }}>{children}</SocketContext.Provider>;
}
export const useSocket = () => useContext(SocketContext);
