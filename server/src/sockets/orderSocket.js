// Order room management. Server-side authorization before joining.
import { Order } from '../models/Order.js';

const STAFF = ['waiter', 'cook', 'manager', 'admin'];

export function registerOrderSocket(io, socket) {
  socket.on('order:subscribe', async ({ orderId }, ack) => {
    try {
      const order = await Order.findById(orderId).select('customer restaurant deliveryPartner');
      if (!order) return ack?.({ ok: false, error: 'Order not found' });

      const isCustomer = order.customer && String(order.customer) === socket.user.id;
      const isDelivery =
        order.deliveryPartner && String(order.deliveryPartner) === socket.user.id;
      const isStaff =
        STAFF.includes(socket.user.role) &&
        String(order.restaurant) === String(socket.user.restaurant);

      if (!isCustomer && !isDelivery && !isStaff) {
        return ack?.({ ok: false, error: 'Forbidden' });
      }
      socket.join(`order:${orderId}`);
      return ack?.({ ok: true });
    } catch (e) {
      return ack?.({ ok: false, error: e.message });
    }
  });

  socket.on('order:unsubscribe', ({ orderId }) => {
    socket.leave(`order:${orderId}`);
  });
}