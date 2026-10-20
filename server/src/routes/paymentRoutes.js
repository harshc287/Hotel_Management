import { Router } from 'express';
import express from 'express';
import * as ctrl from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Webhook must use raw body for signature verification
// router.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   ctrl.webhook
// );

router.post('/create-order', requireAuth, ctrl.createOrder);
router.post('/verify', requireAuth, ctrl.verify);
router.get('/:id', requireAuth, ctrl.getById);
router.post('/:id/refund', requireAuth, requireRole('manager', 'admin'), ctrl.refund);

export default router;