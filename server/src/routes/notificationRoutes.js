// import { Router } from 'express';
// import { Notification } from '../models/Notification.js';
// import { requireAuth } from '../middleware/authMiddleware.js';
// import { requireRestaurantAccess, requireRole } from '../middleware/roleMiddleware.js';
// import { ok } from '../utils/apiResponse.js';

// const router = Router();
// router.use(requireAuth);

// router.get(
//   '/',
//   requireRestaurantAccess,
//   async (req, res, next) => {
//     try {
//       const role = req.user.role;
//       const filter = {
//         restaurant: req.restaurantId,
//         $or: [
//           { targetRoles: { $in: [role] } },
//           { targetRoles: { $size: 0 } },
//           { targetUser: req.user._id },
//         ],
//       };
//       const items = await Notification.find(filter).sort({ createdAt: -1 }).limit(100).lean();
//       return ok(res, items);
//     } catch (e) {
//       next(e);
//     }
//   }
// );

// router.patch('/:id/acknowledge', async (req, res, next) => {
//   try {
//     const n = await Notification.findByIdAndUpdate(
//       req.params.id,
//       { $addToSet: { acknowledgedBy: req.user._id, readBy: req.user._id } },
//       { new: true }
//     );
//     return ok(res, n);
//   } catch (e) {
//     next(e);
//   }
// });

// router.patch('/:id/read', async (req, res, next) => {
//   try {
//     const n = await Notification.findByIdAndUpdate(
//       req.params.id,
//       { $addToSet: { readBy: req.user._id } },
//       { new: true }
//     );
//     return ok(res, n);
//   } catch (e) {
//     next(e);
//   }
// });

// export default router;
import { Router } from 'express';
import * as ctrl from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRestaurantAccess } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(requireAuth, requireRestaurantAccess);

router.get('/', ctrl.listNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/acknowledge', ctrl.acknowledgeNotification);
router.patch('/:id/read', ctrl.markRead);

export default router;