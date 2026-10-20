
import { Router } from 'express';
import { createTable, lookupQR, regenerateQR, listTables } from '../controllers/tableController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../utils/apiResponse.js';
const router = Router();
router.get('/qr/:token', asyncHandler(lookupQR));
router.get('/', requireAuth, allowRoles('manager','admin'), asyncHandler(listTables));
router.post('/', requireAuth, allowRoles('manager','admin'), asyncHandler(createTable));
router.post('/:id/regenerate-qr', requireAuth, allowRoles('manager','admin'), asyncHandler(regenerateQR));
export default router;
