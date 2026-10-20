import { Notification } from '../models/Notification.js';
import { ok, fail } from '../utils/apiResponse.js';

export async function listNotifications(req, res, next) {
  try {
    const role = req.user.role;
    const restaurantId = req.user.restaurant;

    const filter = {
      restaurant: restaurantId,
      $or: [
        { targetRoles: { $in: [role] } },
        { targetRoles: { $size: 0 } },
        { targetUser: req.user._id },
      ],
    };
    if (req.query.unreadOnly === 'true') {
      filter.readBy = { $ne: req.user._id };
    }

    const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      ...filter,
      readBy: { $ne: req.user._id },
    });

    return ok(res, { items, unreadCount });
  } catch (e) {
    next(e);
  }
}

export async function acknowledgeNotification(req, res, next) {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return fail(res, 'Not found', 404);
    if (String(notif.restaurant) !== String(req.user.restaurant) && req.user.role !== 'admin') {
      return fail(res, 'Forbidden', 403);
    }
    await Notification.updateOne(
      { _id: notif._id },
      { $addToSet: { acknowledgedBy: req.user._id, readBy: req.user._id } }
    );
    const updated = await Notification.findById(notif._id).lean();
    return ok(res, updated, 'Acknowledged');
  } catch (e) {
    next(e);
  }
}

export async function markRead(req, res, next) {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    ).lean();
    if (!notif) return fail(res, 'Not found', 404);
    return ok(res, notif, 'Marked read');
  } catch (e) {
    next(e);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      {
        restaurant: req.user.restaurant,
        $or: [
          { targetRoles: { $in: [req.user.role] } },
          { targetRoles: { $size: 0 } },
          { targetUser: req.user._id },
        ],
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );
    return ok(res, null, 'All marked read');
  } catch (e) {
    next(e);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const count = await Notification.countDocuments({
      restaurant: req.user.restaurant,
      $or: [
        { targetRoles: { $in: [req.user.role] } },
        { targetRoles: { $size: 0 } },
        { targetUser: req.user._id },
      ],
      readBy: { $ne: req.user._id },
    });
    return ok(res, { unreadCount: count });
  } catch (e) {
    next(e);
  }
}