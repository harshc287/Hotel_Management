
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export let io;
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL?.split(',') || [], credentials: true }
  });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(payload.sub).select('-passwordHash');
      if (!user) return next(new Error('Invalid user'));
      socket.user = user;
      next();
    } catch { next(new Error('Invalid socket token')); }
  });
  io.on('connection', (socket) => {
    const u = socket.user;
    if (u.restaurantId) socket.join(`restaurant:${u.restaurantId}`);
    socket.join(`role:${u.role}`);
    socket.on('join-order', async (orderId) => {
      // Order-specific rooms should be joined only after an order ownership check.
      // This starter intentionally does not accept arbitrary order room subscriptions.
      socket.emit('order-room-denied', { orderId, message: 'Use authorized order APIs for now.' });
    });
  });
  return io;
}
