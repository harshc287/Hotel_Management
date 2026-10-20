import { Router } from 'express';
import * as ctrl from '../controllers/locationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.post('/sessions/:orderId/start', ctrl.startSession);
router.post('/sessions/:orderId/stop', ctrl.stopSession);
router.post('/sessions/:orderId/update', ctrl.update);
router.get('/sessions/:orderId/latest', ctrl.latest);
router.get('/sessions/:orderId/history', ctrl.history);

export default router;