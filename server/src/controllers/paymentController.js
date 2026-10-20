import * as paymentService from '../services/paymentService.js';
import { Payment } from '../models/Payment.js';
import { ok, fail } from '../utils/apiResponse.js';

export async function createOrder(req, res, next) {
  try {
    const result = await paymentService.createRazorpayOrder({
      orderId: req.body.orderId,
      userId: req.user._id,
    });
    return ok(res, result);
  } catch (e) {
    next(e);
  }
}

export async function verify(req, res, next) {
  try {
    const result = await paymentService.verifyPayment(req.body);
    return ok(res, result, 'Verified');
  } catch (e) {
    next(e);
  }
}

export async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);
    return res.status(200).json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}

export async function getById(req, res, next) {
  try {
    const p = await Payment.findById(req.params.id).lean();
    if (!p) return fail(res, 'Not found', 404);
    if (req.user.role !== 'admin' && String(p.restaurant) !== String(req.user.restaurant)) {
      return fail(res, 'Forbidden', 403);
    }
    return ok(res, p);
  } catch (e) {
    next(e);
  }
}

export async function refund(req, res, next) {
  try {
    const r = await paymentService.initiateRefund({
      paymentId: req.params.id,
      amount: req.body.amount,
      userId: req.user._id,
    });
    return ok(res, r, 'Refund initiated');
  } catch (e) {
    next(e);
  }
}