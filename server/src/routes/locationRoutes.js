import { Router } from 'express';
import * as ctrl from '../controllers/locationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { calculateRoute } from '../services/routeService.js';
import { ok } from '../utils/apiResponse.js';

const router = Router();
router.use(requireAuth);

router.post('/sessions/:orderId/start', ctrl.startSession);
router.post('/sessions/:orderId/stop', ctrl.stopSession);
router.post('/sessions/:orderId/update', ctrl.update);
router.get('/sessions/:orderId/latest', ctrl.latest);
router.get('/sessions/:orderId/history', ctrl.history);
router.post('/route', async (req, res, next) => {
  try {
    const { origin, destination, mode } = req.body;
    const result = await calculateRoute({ origin, destination, mode });
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

export default router;