import { Router } from 'express';
import * as ctrl from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole, requireRestaurantAccess } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', optionalAuth, ctrl.createOrder);
router.get('/mine', requireAuth, ctrl.listMyOrders);
router.get('/kitchen', requireAuth, requireRole('cook', 'manager', 'admin'), requireRestaurantAccess, ctrl.listKitchenOrders);
router.get('/waiter', requireAuth, requireRole('waiter', 'manager', 'admin'), requireRestaurantAccess, ctrl.listWaiterOrders);
router.get('/:id', requireAuth, ctrl.getOrder);
router.patch('/:id/status', requireAuth, requireRole('cook', 'waiter', 'manager', 'admin', 'delivery'), ctrl.updateStatus);
router.post('/:id/cancel', requireAuth, ctrl.cancelOrder);

export default router;