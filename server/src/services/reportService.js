import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';

const PAID_OR_LATER = [
  'PAID',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'SERVED',
  'DELIVERED',
  'COMPLETED',
];

export async function getSalesSeries({ restaurantId, from, to }) {
  const match = {
    restaurant: restaurantId,
    paymentStatus: 'SUCCESS',
    createdAt: { $gte: from, $lte: to },
  };

  const rows = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders }));
}

export async function getSummary({ restaurantId, from, to }) {
  const orders = await Order.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        createdAt: { $gte: from, $lte: to },
        status: { $in: PAID_OR_LATER },
      },
    },
    {
      $group: {
        _id: null,
        orderCount: { $sum: 1 },
        revenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' },
      },
    },
  ]);

  const cancelled = await Order.countDocuments({
    restaurant: restaurantId,
    status: 'CANCELLED',
    createdAt: { $gte: from, $lte: to },
  });

  const refunds = await Payment.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        createdAt: { $gte: from, $lte: to },
        status: { $in: ['REFUNDED', 'PARTIAL_REFUND'] },
      },
    },
    { $unwind: '$refunds' },
    { $group: { _id: null, total: { $sum: '$refunds.amount' } } },
  ]);

  const popular = await Order.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        createdAt: { $gte: from, $lte: to },
        status: { $in: PAID_OR_LATER },
      },
    },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' } } },
    { $sort: { qty: -1 } },
    { $limit: 10 },
  ]);

  return {
    orderCount: orders[0]?.orderCount || 0,
    revenue: orders[0]?.revenue || 0,
    avgOrderValue: orders[0]?.avgOrderValue || 0,
    cancelled,
    refundsTotal: refunds[0]?.total || 0,
    popularItems: popular.map((p) => ({ name: p._id, quantity: p.qty })),
  };
}

export function toCsv(rows, headers = ['date', 'orders', 'revenue']) {
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}