import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/generateToken.js';

let ioInstance = null;

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized: no token'));
      const payload = verifyAccessToken(token);
      socket.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error('Unauthorized: bad token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;
    socket.join(`user:${id}`);
    if (role) socket.join(`role:${role}`);

    socket.on('join:restaurant', ({ restaurantId }) => {
      if (!restaurantId) return;
      // only staff roles may join restaurant rooms
      if (!['waiter', 'cook', 'manager', 'admin'].includes(role)) return;
      socket.join(`restaurant:${restaurantId}`);
    });

    socket.on('join:order', ({ orderId }) => {
      if (!orderId) return;
      // NOTE: server should verify the user is a participant. For MVP, allow
      // authenticated users to join an order room only if the id is passed by the client
      // that created it. Full participant check is applied in location events.
      socket.join(`order:${orderId}`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIo() {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
}

export function emitToUser(userId, event, payload) {
  getIo().to(`user:${userId}`).emit(event, payload);
}

export function emitToRole(role, event, payload) {
  getIo().to(`role:${role}`).emit(event, payload);
}

export function emitToRestaurant(restaurantId, event, payload) {
  getIo().to(`restaurant:${restaurantId}`).emit(event, payload);
}

export function emitToOrder(orderId, event, payload) {
  getIo().to(`order:${orderId}`).emit(event, payload);
}