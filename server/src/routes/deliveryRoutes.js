import { Router } from 'express';
import * as ctrl from '../controllers/deliveryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole, requireRestaurantAccess } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/assignments', ctrl.listAssignments);
router.post(
  '/assignments',
  requireRole('manager', 'admin'),
  requireRestaurantAccess,
  ctrl.createAssignment
);
router.patch('/assignments/:id/status', requireRole('delivery'), ctrl.updateStatus);
router.get('/active', requireRole('manager', 'admin'), requireRestaurantAccess, ctrl.listActive);
router.get('/partners', requireRole('manager', 'admin'), requireRestaurantAccess, ctrl.listPartners);

export default router;