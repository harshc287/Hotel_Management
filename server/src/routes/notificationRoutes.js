
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listNotifications, acknowledge } from '../controllers/notificationController.js';
import { asyncHandler } from '../utils/apiResponse.js';
const router = Router();
router.get('/', requireAuth, asyncHandler(listNotifications));
router.patch('/:id/acknowledge', requireAuth, asyncHandler(acknowledge));
export default router;
