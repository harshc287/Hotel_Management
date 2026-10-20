import { Router } from 'express';
import * as ctrl from '../controllers/restaurantController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole, requireRestaurantAccess } from '../middleware/roleMiddleware.js';

const router = Router();

// Public
router.get('/:id/public', ctrl.getPublicInfo);

// Manager settings
router.get(
  '/settings',
  requireAuth,
  requireRole('manager', 'admin'),
  requireRestaurantAccess,
  ctrl.getSettings
);
router.patch(
  '/settings',
  requireAuth,
  requireRole('manager', 'admin'),
  requireRestaurantAccess,
  ctrl.updateSettings
);

// Admin create
router.post('/', requireAuth, requireRole('admin'), ctrl.createRestaurant);

export default router;