
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import { createOrder, transitionOrder } from '../services/orderService.js';
import { httpError } from '../utils/apiResponse.js';
import { createNotification } from '../services/notificationService.js';
export async function placeOrder(req, res) {
  const order = await createOrder(req.body, req.user);
  res.status(201).json({ order, message: 'Order created. Complete payment before the kitchen begins.' });
}
export async function myOrders(req, res) {
  res.json({ orders: await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 }).limit(100).lean() });
}
export async function listOrders(req, res) {
  const restaurantId = req.user.role === 'admin' ? req.query.restaurantId : req.user.restaurantId?.toString();
  if (!restaurantId) throw httpError(400, 'Restaurant scope is required');
  res.json({ orders: await Order.find({ restaurantId }).sort({ createdAt: -1 }).limit(200).lean() });
}
export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  const staff = ['manager','admin','waiter','kitchen','delivery'].includes(req.user.role) && (req.user.role === 'admin' || order.restaurantId.toString() === req.user.restaurantId?.toString());
  if (!staff && order.customerId?.toString() !== req.user._id.toString()) throw httpError(403, 'Order access denied');
  res.json({ order });
}
export async function updateStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (req.user.role !== 'admin' && order.restaurantId.toString() !== req.user.restaurantId?.toString()) throw httpError(403, 'Restaurant access denied');
  if (!['manager','admin','kitchen','waiter','delivery'].includes(req.user.role)) throw httpError(403, 'Insufficient permissions');
  if (req.body.status === 'CANCELLED' && req.user.role !== 'manager' && req.user.role !== 'admin') throw httpError(403, 'Only a manager can cancel this order');
  const updated = await transitionOrder(order, req.body.status, req.user);
  res.json({ order: updated });
}
export async function cancelOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (order.customerId?.toString() !== req.user._id.toString()) throw httpError(403, 'Order access denied');
  if (!['PENDING_PAYMENT','PAID'].includes(order.status)) throw httpError(400, 'This order can no longer be cancelled online');
  order.status = 'CANCELLED'; order.statusHistory.push({ status: 'CANCELLED', by: req.user._id }); await order.save();
  await createNotification({ restaurantId: order.restaurantId, type: 'ORDER_CANCELLED', title: 'Order cancelled', message: `${order.orderNumber} was cancelled`, orderId: order._id });
  res.json({ order });
}
