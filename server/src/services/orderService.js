import { Order } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { Table } from '../models/Table.js';
import { Restaurant } from '../models/Restaurant.js';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';
import { calculateOrderTotal } from '../utils/calculateOrderTotal.js';
import { HttpError } from '../utils/apiResponse.js';

export async function createOrder({
  restaurantId,
  tableId,
  orderType,
  customerName,
  customerPhone,
  deliveryAddress,
  deliveryLocation,
  items,
  specialInstructions,
  user,
}) {
  if (!items?.length) throw new HttpError('Cart empty', 400);

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive) throw new HttpError('Restaurant unavailable', 404);

  let table = null;
  if (orderType === 'DINE_IN') {
    if (!tableId) throw new HttpError('Dine-in requires table', 400);
    table = await Table.findOne({ _id: tableId, restaurant: restaurantId, isActive: true });
    if (!table) throw new HttpError('Invalid table', 400);
  } else if (orderType === 'DELIVERY') {
    if (!deliveryAddress || deliveryAddress.length < 5) {
      throw new HttpError('Delivery address required', 400);
    }
  } else {
    throw new HttpError('Invalid order type', 400);
  }

  const menuIds = items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: menuIds }, restaurant: restaurantId });
  const menuById = Object.fromEntries(menuItems.map((m) => [String(m._id), m]));

  const totals = calculateOrderTotal({
    items,
    restaurant,
    orderType,
    menuById,
  });

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    restaurant: restaurantId,
    orderType,
    table: table?._id || null,
    customer: user?._id || null,
    customerName,
    customerPhone: customerPhone || '',
    deliveryAddress: deliveryAddress || '',
    deliveryLocation: deliveryLocation || { lat: null, lng: null },
    items: totals.items,
    subtotal: totals.subtotal,
    taxPercent: totals.taxPercent,
    taxAmount: totals.taxAmount,
    serviceChargePercent: totals.serviceChargePercent,
    serviceCharge: totals.serviceCharge,
    deliveryFee: totals.deliveryFee,
    discount: totals.discount,
    total: totals.total,
    status: 'PENDING_PAYMENT',
    paymentStatus: 'PENDING',
    specialInstructions: specialInstructions || '',
    statusHistory: [{ status: 'PENDING_PAYMENT', by: user?._id || null }],
  });

  return order;
}

export async function getOrderById(id, filter = {}) {
  const order = await Order.findOne({ _id: id, ...filter })
    .populate('table', 'number')
    .populate('customer', 'name email')
    .populate('deliveryPartner', 'name phone')
    .lean();
  if (!order) throw new HttpError('Order not found', 404);
  return order;
}

export async function transitionOrder(orderId, nextStatus, userId, note = '') {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError('Order not found', 404);
  order.applyStatus(nextStatus, userId, note);
  await order.save();
  return order;
}