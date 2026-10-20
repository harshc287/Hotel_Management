import { LocationConsent } from '../models/LocationConsent.js';
import { LocationUpdate } from '../models/LocationUpdate.js';
import { Order } from '../models/Order.js';
import { HttpError } from '../utils/apiResponse.js';
import { emitToOrder } from '../config/socket.js';

const MIN_INTERVAL_MS = 2000;
const MAX_ACCURACY_M = 200;

export async function recordConsent({ orderId, user, role, granted }) {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError('Order not found', 404);

  if (role === 'customer') {
    if (String(order.customer) !== String(user._id)) throw new HttpError('Forbidden', 403);
  } else if (role === 'delivery') {
    if (String(order.deliveryPartner) !== String(user._id)) throw new HttpError('Forbidden', 403);
  } else {
    throw new HttpError('Invalid role', 400);
  }
  if (order.orderType !== 'DELIVERY') throw new HttpError('Not a delivery order', 400);

  const consent = await LocationConsent.findOneAndUpdate(
    { order: order._id, role },
    {
      $set: {
        user: user._id,
        granted,
        grantedAt: granted ? new Date() : null,
        revokedAt: granted ? null : new Date(),
      },
    },
    { upsert: true, new: true }
  );
  return consent;
}

export async function hasConsent(orderId, role) {
  const c = await LocationConsent.findOne({ order: orderId, role, granted: true });
  return !!c;
}

export async function recordUpdate({ orderId, user, role, lat, lng, accuracy, recordedAt }) {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError('Order not found', 404);
  if (!order.deliveryPartner) throw new HttpError('No delivery in progress', 400);

  if (role === 'delivery' && String(order.deliveryPartner) !== String(user._id)) {
    throw new HttpError('Forbidden', 403);
  }
  if (role === 'customer' && String(order.customer) !== String(user._id)) {
    throw new HttpError('Forbidden', 403);
  }
  if (!(await hasConsent(order._id, role))) throw new HttpError('No consent on file', 403);

  if (typeof lat !== 'number' || typeof lng !== 'number') throw new HttpError('Invalid coords', 400);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) throw new HttpError('Out of range', 400);
  if (accuracy != null && accuracy > MAX_ACCURACY_M) throw new HttpError('Accuracy too low', 400);

  const last = await LocationUpdate.findOne({ order: order._id, user: user._id, role }).sort({ recordedAt: -1 });
  if (last && new Date(recordedAt).getTime() - last.recordedAt.getTime() < MIN_INTERVAL_MS) {
    throw new HttpError('Too frequent', 429);
  }

  const update = await LocationUpdate.create({
    order: order._id,
    user: user._id,
    role,
    lat,
    lng,
    accuracy: accuracy ?? null,
    recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
  });

  emitToOrder(String(order._id), 'location:update', {
    orderId: order._id,
    role,
    lat,
    lng,
    accuracy,
    at: update.recordedAt,
  });

  return update;
}

export async function getLatest(orderId, role) {
  return LocationUpdate.findOne({ order: orderId, role }).sort({ recordedAt: -1 }).lean();
}

export async function getHistory(orderId, role, limit = 100) {
  return LocationUpdate.find({ order: orderId, role }).sort({ recordedAt: -1 }).limit(limit).lean();
}