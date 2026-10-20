import { DeliveryAssignment } from '../models/DeliveryAssignment.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/apiResponse.js';
import { dispatchNotification } from './notificationService.js';

export async function assignDelivery({ orderId, partnerId, manager }) {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError('Order not found', 404);
  if (order.orderType !== 'DELIVERY') throw new HttpError('Not a delivery order', 400);
  if (String(order.restaurant) !== String(manager.restaurant) && manager.role !== 'admin') {
    throw new HttpError('Forbidden', 403);
  }
  if (order.deliveryPartner) throw new HttpError('Already assigned', 409);

  const partner = await User.findOne({ _id: partnerId, role: 'delivery', isActive: true });
  if (!partner) throw new HttpError('Invalid partner', 400);

  const assignment = await DeliveryAssignment.create({
    restaurant: order.restaurant,
    order: order._id,
    partner: partner._id,
    assignedBy: manager._id,
  });

  order.deliveryPartner = partner._id;
  await order.save();

  await dispatchNotification({
    restaurantId: order.restaurant,
    orderId: order._id,
    type: 'DELIVERY_ASSIGNED',
    title: `Delivery assigned: ${order.orderNumber}`,
    payload: { partnerId: partner._id, partnerName: partner.name },
    targetRoles: ['manager'],
    targetUser: partner._id,
  });

  return assignment;
}

export async function updateAssignmentStatus({ assignmentId, status, partner }) {
  const assignment = await DeliveryAssignment.findById(assignmentId);
  if (!assignment) throw new HttpError('Assignment not found', 404);
  if (String(assignment.partner) !== String(partner._id)) throw new HttpError('Forbidden', 403);
  assignment.status = status;
  if (status === 'PICKED_UP') assignment.pickedUpAt = new Date();
  if (status === 'DELIVERED') assignment.deliveredAt = new Date();
  await assignment.save();

  const order = await Order.findById(assignment.order);
  if (order) {
    const statusMap = {
      PICKED_UP: 'OUT_FOR_DELIVERY',
      DELIVERED: 'DELIVERED',
      CANCELLED: 'CANCELLED',
    };
    if (statusMap[status] && order.status !== statusMap[status]) {
      try {
        order.applyStatus(statusMap[status], partner._id, 'Delivery update');
        await order.save();
      } catch {
        /* transition not allowed — ignore */
      }
    }
  }

  return assignment;
}