import crypto from 'crypto';
import { getRazorpay } from '../config/razorpay.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { HttpError } from '../utils/apiResponse.js';
import { dispatchNotification } from './notificationService.js';
import { getIo } from '../config/socket.js';

export async function createRazorpayOrder({ orderId, userId }) {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError('Order not found', 404);
  if (order.status !== 'PENDING_PAYMENT') throw new HttpError('Order not payable', 400);
  if (order.customer && String(order.customer) !== String(userId)) {
    throw new HttpError('Forbidden', 403);
  }

  const razorpay = getRazorpay();
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100), // paise
    currency: 'INR',
    receipt: order.orderNumber,
    notes: { internalOrderId: String(order._id) },
  });

  const payment = await Payment.create({
    order: order._id,
    restaurant: order.restaurant,
    user: userId,
    razorpayOrderId: rzpOrder.id,
    amount: order.total,
    currency: 'INR',
    status: 'PENDING',
  });

  return { razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, paymentId: payment._id, keyId: process.env.RAZORPAY_KEY_ID };
}

export async function verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpaySignature) throw new HttpError('Invalid payment signature', 400);

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) throw new HttpError('Payment record not found', 404);
  if (payment.status === 'SUCCESS') {
    return { alreadyProcessed: true, orderId: payment.order };
  }

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'SUCCESS';
  await payment.save();

  const order = await Order.findById(payment.order);
  if (!order) throw new HttpError('Order missing', 500);
  order.paymentStatus = 'SUCCESS';
  order.applyStatus('PAID', null, 'Razorpay verified');
  await order.save();

  await notifyPaidOrder(order);

  return { alreadyProcessed: false, orderId: order._id };
}

export async function handleWebhook(rawBody, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expected !== signature) throw new HttpError('Invalid webhook signature', 400);

  const payload = JSON.parse(rawBody.toString());
  const eventId = payload?.payload?.payment?.entity?.id || payload?.id;
  const eventType = payload?.event;

  const razorpayOrderId = payload?.payload?.payment?.entity?.order_id;
  if (!razorpayOrderId) return { ignored: true };

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) return { ignored: true };

  // idempotency
  if (payment.webhookEvents.some((e) => e.eventId === eventId)) {
    return { duplicate: true };
  }
  payment.webhookEvents.push({ eventId, eventType, receivedAt: new Date() });

  if (eventType === 'payment.captured' && payment.status !== 'SUCCESS') {
    payment.status = 'SUCCESS';
    payment.razorpayPaymentId = payload.payload.payment.entity.id;
    const order = await Order.findById(payment.order);
    if (order && order.paymentStatus !== 'SUCCESS') {
      order.paymentStatus = 'SUCCESS';
      order.applyStatus('PAID', null, 'Webhook');
      await order.save();
      await notifyPaidOrder(order);
    }
  } else if (eventType === 'payment.failed' && payment.status !== 'SUCCESS') {
    payment.status = 'FAILED';
    payment.failureReason = payload.payload.payment.entity.error_description || '';
  }

  await payment.save();
  return { processed: true };
}

async function notifyPaidOrder(order) {
  await Promise.all([
    dispatchNotification({
      restaurantId: order.restaurant,
      orderId: order._id,
      type: 'NEW_ORDER',
      title: `New paid order ${order.orderNumber}`,
      message: order.customerName,
      payload: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        itemSummary: order.items.map((i) => `${i.quantity}× ${i.name}`).join(', '),
      },
      targetRoles: ['cook', 'waiter', 'manager'],
    }),
    dispatchNotification({
      restaurantId: order.restaurant,
      orderId: order._id,
      type: 'PAYMENT_SUCCESS',
      title: `Payment success ${order.orderNumber}`,
      payload: { amount: order.total },
      targetRoles: ['manager'],
    }),
  ]);
  try {
    getIo().to(`order:${order._id}`).emit('order:paid', { orderId: order._id });
  } catch {
    /* socket not ready in tests */
  }
}

export async function initiateRefund({ paymentId, amount, userId }) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new HttpError('Payment not found', 404);
  if (payment.status !== 'SUCCESS') throw new HttpError('Only successful payments can be refunded', 400);

  const razorpay = getRazorpay();
  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    amount: Math.round((amount || payment.amount) * 100),
  });

  payment.refunds.push({
    refundId: refund.id,
    amount: amount || payment.amount,
    status: refund.status,
    at: new Date(),
    by: userId,
  });
  payment.status = (amount && amount < payment.amount) ? 'PARTIAL_REFUND' : 'REFUNDED';
  await payment.save();

  const order = await Order.findById(payment.order);
  if (order) {
    order.paymentStatus = payment.status === 'REFUNDED' ? 'REFUNDED' : 'PARTIAL_REFUND';
    if (order.status === 'REFUND_PENDING') order.applyStatus('REFUNDED', userId, 'Refunded');
    await order.save();
  }

  await dispatchNotification({
    restaurantId: payment.restaurant,
    orderId: payment.order,
    type: 'REFUND_UPDATED',
    title: `Refund ${refund.status}`,
    payload: { amount: refund.amount / 100, refundId: refund.id },
    targetRoles: ['manager', 'admin'],
  });

  return refund;
}