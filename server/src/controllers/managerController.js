import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { AuditLog } from '../models/AuditLog.js';
import { DeliveryAssignment } from '../models/DeliveryAssignment.js';
import { ok } from '../utils/apiResponse.js';

export async function dashboard(req, res, next) {
  try {
    const restaurantId = req.user.restaurant;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalToday, active, pendingPayments, revenueAgg, cancelledToday, refundsToday] =
      await Promise.all([
        Order.countDocuments({ restaurant: restaurantId, createdAt: { $gte: startOfDay } }),
        Order.countDocuments({
          restaurant: restaurantId,
          status: { $in: ['PAID', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] },
        }),
        Order.countDocuments({ restaurant: restaurantId, paymentStatus: 'PENDING' }),
        Order.aggregate([
          { $match: { restaurant: restaurantId, paymentStatus: 'SUCCESS', createdAt: { $gte: startOfDay } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.countDocuments({ restaurant: restaurantId, status: 'CANCELLED', createdAt: { $gte: startOfDay } }),
        Payment.aggregate([
          { $match: { restaurant: restaurantId, status: { $in: ['REFUNDED', 'PARTIAL_REFUND'] } } },
          { $group: { _id: null, total: { $sum: { $sum: '$refunds.amount' } } } },
        ]),
      ]);

    const popular = await Order.aggregate([
      { $match: { restaurant: restaurantId, status: { $in: ['PAID', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'DELIVERED', 'COMPLETED'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' } } },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]);

    const activeDeliveries = await DeliveryAssignment.countDocuments({
      restaurant: restaurantId,
      status: { $in: ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
    });

    return ok(res, {
      ordersToday: totalToday,
      activeOrders: active,
      pendingPayments,
      revenueToday: revenueAgg[0]?.total || 0,
      cancelledToday,
      refundsTotal: refundsToday[0]?.total || 0,
      popularItems: popular,
      activeDeliveries,
    });
  } catch (e) {
    next(e);
  }
}

export async function reports(req, res, next) {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const data = await Order.aggregate([
      {
        $match: {
          restaurant: req.user.restaurant,
          createdAt: { $gte: fromDate, $lte: toDate },
          paymentStatus: 'SUCCESS',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
}

export async function auditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find({ restaurant: req.user.restaurant })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('user', 'name email role')
      .lean();
    return ok(res, logs);
  } catch (e) {
    next(e);
  }
}

export async function allOrders(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '25', 10), 100);
    const filter = { restaurant: req.user.restaurant };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { orderNumber: new RegExp(req.query.search, 'i') },
        { customerName: new RegExp(req.query.search, 'i') },
      ];
    }
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);
    return ok(res, { items, total, page, limit });
  } catch (e) {
    next(e);
  }
}