import { Order } from '../models/Order.js';

const MAX_PENDING_MS = 30 * 60 * 1000; // 30 min

export async function runCleanup() {
  const cutoff = new Date(Date.now() - MAX_PENDING_MS);
  const stale = await Order.find({
    status: 'PENDING_PAYMENT',
    createdAt: { $lt: cutoff },
  });
  for (const order of stale) {
    try {
      order.applyStatus('CANCELLED', null, 'Auto-cancel: unpaid');
      await order.save();
      console.log(`[job] auto-cancelled ${order.orderNumber}`);
    } catch (e) {
      console.warn('[job] cancel failed:', e.message);
    }
  }
  return { scanned: stale.length };
}

export function startPendingPaymentCleanup(intervalMs = 10 * 60 * 1000) {
  setInterval(() => {
    runCleanup().catch((e) => console.warn('[job] cleanup error', e.message));
  }, intervalMs);
}