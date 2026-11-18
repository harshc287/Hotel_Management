
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