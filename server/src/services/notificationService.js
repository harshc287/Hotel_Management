
import { randomUUID } from 'node:crypto';
import Notification from '../models/Notification.js';
import { io } from '../config/socket.js';
export async function createNotification({ restaurantId, type, title, message, orderId = null, targetRoles = ['manager','kitchen','waiter'] }) {
  const notification = await Notification.create({ eventId: randomUUID(), restaurantId, type, title, message, orderId, targetRoles });
  io?.to(`restaurant:${restaurantId}`).emit('notification:new', notification);
  for (const role of targetRoles) io?.to(`role:${role}`).emit('notification:new', notification);
  return notification;
}
