
import { randomBytes } from 'node:crypto';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import Table from '../models/Table.js';
import { createNotification } from './notificationService.js';
import { httpError } from '../utils/apiResponse.js';

export async function createOrder(input, user) {
  const restaurant = await Restaurant.findById(input.restaurantId);
  if (!restaurant || !restaurant.active) throw httpError(404, 'Restaurant not found');
  let table = null;
  if (input.orderType === 'DINE_IN') {
    if (!input.tableToken) throw httpError(400, 'A valid table QR token is required for dine-in');
    table = await Table.findOne({ qrToken: input.tableToken, restaurantId: restaurant._id, enabled: true });
    if (!table) throw httpError(400, 'Invalid or disabled table QR code');
  } else if (!input.deliveryAddress?.trim()) throw httpError(400, 'Delivery address is required');
  const ids = input.items.map(x => x.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: ids }, restaurantId: restaurant._id, available: true });
  const byId = new Map(menuItems.map(item => [item._id.toString(), item]));
  const items = input.items.map(row => {
    const item = byId.get(row.menuItemId);
    if (!item) throw httpError(400, 'One or more menu items are unavailable');
    return { menuItemId: item._id, name: item.name, unitPrice: item.price, quantity: row.quantity, notes: row.notes || '', lineTotal: Math.round(item.price * row.quantity * 100) / 100 };
  });
  const subtotal = Math.round(items.reduce((sum, row) => sum + row.lineTotal, 0) * 100) / 100;
  const tax = Math.round(subtotal * restaurant.taxRate * 100) / 100;
  const deliveryFee = input.orderType === 'DELIVERY' ? 40 : 0;
  const order = await Order.create({
    orderNumber: `RS-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`,
    restaurantId: restaurant._id, customerId: user?._id || null, customerName: input.customerName,
    orderType: input.orderType, tableId: table?._id || null, deliveryAddress: input.deliveryAddress || '',
    items, subtotal, tax, deliveryFee, total: subtotal + tax + deliveryFee,
    status: 'PENDING_PAYMENT', paymentStatus: 'PENDING', statusHistory: [{ status: 'PENDING_PAYMENT', by: user?._id }]
  });
  return order;
}
export async function transitionOrder(order, nextStatus, actor) {
  const transitions = {
    PENDING_PAYMENT: ['PAID','CANCELLED'], PAID: ['CONFIRMED','CANCELLED'],
    CONFIRMED: ['PREPARING','CANCELLED'], PREPARING: ['READY'],
    READY: ['SERVED','OUT_FOR_DELIVERY'], OUT_FOR_DELIVERY: ['DELIVERED'],
    SERVED: ['COMPLETED'], DELIVERED: ['COMPLETED'], CANCELLED: []
  };
  if (!transitions[order.status]?.includes(nextStatus)) throw httpError(400, `Invalid order transition: ${order.status} → ${nextStatus}`);
  if (['CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','SERVED','DELIVERED','COMPLETED'].includes(nextStatus) && order.paymentStatus !== 'PAID') {
    throw httpError(400, 'Order must be paid before preparation or fulfilment');
  }
  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus, by: actor._id, at: new Date() });
  await order.save();
  await createNotification({ restaurantId: order.restaurantId, type: `ORDER_${nextStatus}`, title: `Order ${nextStatus.replaceAll('_',' ').toLowerCase()}`, message: `${order.orderNumber} is now ${nextStatus}`, orderId: order._id });
  return order;
}
