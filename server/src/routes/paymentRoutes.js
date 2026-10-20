
import { Router } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler, httpError } from '../utils/apiResponse.js';
import { createNotification } from '../services/notificationService.js';
const router = Router();

router.post('/create-order', requireAuth, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order || order.customerId?.toString() !== req.user._id.toString()) throw httpError(404, 'Order not found');
  if (order.paymentStatus === 'PAID') throw httpError(409, 'Order is already paid');
  const idempotencyKey = `order:${order._id}:attempt:${Date.now()}`;
  let providerOrderId = '';
  if (process.env.PAYMENT_MODE === 'razorpay') {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw httpError(503, 'Razorpay is not configured');
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const created = await razorpay.orders.create({ amount: Math.round(order.total * 100), currency: 'INR', receipt: order.orderNumber });
    providerOrderId = created.id;
  } else {
    return res.status(503).json({ message: 'Payment gateway is in manual/test setup mode. Configure Razorpay Test Mode before checkout.' });
  }
  const payment = await Payment.create({ orderId: order._id, restaurantId: order.restaurantId, provider: 'razorpay', providerOrderId, amount: order.total, idempotencyKey });
  res.status(201).json({ paymentId: payment._id, providerOrderId, amount: Math.round(order.total * 100), currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
}));

router.post('/verify', requireAuth, asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findById(orderId);
  if (!order || order.customerId?.toString() !== req.user._id.toString()) throw httpError(404, 'Order not found');
  const payment = await Payment.findOne({ orderId: order._id, providerOrderId: razorpay_order_id });
  if (!payment) throw httpError(400, 'Payment attempt not found');
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (!process.env.RAZORPAY_KEY_SECRET || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(razorpay_signature || '')))) throw httpError(400, 'Payment signature verification failed');
  if (payment.status !== 'SUCCESS') {
    payment.status = 'SUCCESS'; payment.providerPaymentId = razorpay_payment_id; await payment.save();
    order.paymentStatus = 'PAID'; order.status = 'PAID'; order.statusHistory.push({ status: 'PAID', by: req.user._id }); await order.save();
    await createNotification({ restaurantId: order.restaurantId, type: 'PAYMENT_SUCCESS', title: 'Payment received', message: `${order.orderNumber} payment verified`, orderId: order._id });
  }
  res.json({ message: 'Payment signature verified', order });
}));

router.post('/webhook', asyncHandler(async (req, res) => {
  // Raw-body signature verification must be configured before enabling production webhooks.
  // This endpoint intentionally refuses to mutate payment state without verified raw-body handling.
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) throw httpError(503, 'Webhook secret is not configured');
  res.status(501).json({ message: 'Configure express.raw() and verify the Razorpay webhook signature before enabling webhooks.' });
}));
export default router;
