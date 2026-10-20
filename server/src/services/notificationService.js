import crypto from 'crypto';
import { Notification } from '../models/Notification.js';
import { emitToRole, emitToRestaurant, emitToUser } from '../config/socket.js';

const ALERT_EVENTS = new Set([
  'NEW_ORDER',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'ORDER_ACCEPTED',
  'ORDER_PREPARING',
  'ORDER_READY',
  'WAITER_CALL',
  'BILL_REQUEST',
  'DELIVERY_ASSIGNED',
  'DELIVERY_PICKED_UP',
  'DELIVERY_NEARBY',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'REFUND_UPDATED',
]);

export async function dispatchNotification({
  restaurantId,
  orderId = null,
  type,
  title,
  message = '',
  payload = {},
  targetRoles = [],
  targetUser = null,
}) {
  const eventId = crypto.randomUUID();
  const notif = await Notification.create({
    restaurant: restaurantId,
    order: orderId,
    type,
    eventId,
    title,
    message,
    payload,
    targetRoles,
    targetUser,
  });

  const outgoing = {
    id: String(notif._id),
    eventId,
    type,
    title,
    message,
    payload,
    orderId,
    at: notif.createdAt,
    alarm: ALERT_EVENTS.has(type),
  };

  if (targetUser) emitToUser(String(targetUser), 'notification', outgoing);
  if (targetRoles.length) {
    targetRoles.forEach((r) => emitToRole(r, 'notification', outgoing));
  }
  if (restaurantId) emitToRestaurant(String(restaurantId), 'notification', outgoing);

  return notif;
}