
import Notification from '../models/Notification.js';
import { httpError } from '../utils/apiResponse.js';
export async function listNotifications(req, res) {
  if (!req.user.restaurantId && req.user.role !== 'admin') return res.json({ notifications: [] });
  const filter = req.user.role === 'admin' ? {} : { restaurantId: req.user.restaurantId };
  res.json({ notifications: await Notification.find(filter).sort({ createdAt: -1 }).limit(100).lean() });
}
export async function acknowledge(req, res) {
  const note = await Notification.findById(req.params.id);
  if (!note) throw httpError(404, 'Notification not found');
  if (req.user.role !== 'admin' && note.restaurantId.toString() !== req.user.restaurantId?.toString()) throw httpError(403, 'Access denied');
  if (!note.acknowledgedBy.some(x => x.userId.toString() === req.user._id.toString())) note.acknowledgedBy.push({ userId: req.user._id, at: new Date() });
  await note.save(); res.json({ notification: note });
}
