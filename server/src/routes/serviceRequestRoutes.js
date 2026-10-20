import { Router } from 'express';
import * as ctrl from '../controllers/serviceRequestController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole, requireRestaurantAccess } from '../middleware/roleMiddleware.js';

const router = Router();

// Customer (via QR / public) can create a request — validated by tableId.
router.post('/', optionalAuth, ctrl.createRequest);

// Staff routes
router.get(
  '/',
  requireAuth,
  requireRole('waiter', 'manager', 'admin'),
  requireRestaurantAccess,
  ctrl.listOpenRequests
);
router.patch(
  '/:id/acknowledge',
  requireAuth,
  requireRole('waiter', 'manager', 'admin'),
  requireRestaurantAccess,
  ctrl.acknowledgeRequest
);
router.patch(
  '/:id/resolve',
  requireAuth,
  requireRole('waiter', 'manager', 'admin'),
  requireRestaurantAccess,
  ctrl.resolveRequest
);

export default router;