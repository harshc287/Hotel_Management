import { Router } from 'express';
import * as ctrl from '../controllers/managerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole, requireRestaurantAccess } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(requireAuth, requireRole('manager', 'admin'), requireRestaurantAccess);

router.get('/dashboard', ctrl.dashboard);
router.get('/reports', ctrl.reports);
router.get('/audit-logs', ctrl.auditLogs);
router.get('/orders', ctrl.allOrders);

export default router;