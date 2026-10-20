import { Router } from 'express';
import * as ctrl from '../controllers/tableController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole, requireRestaurantAccess } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { tableSchema } from '../validators/menuValidator.js';

const router = Router();

// Public QR resolve
router.get('/:qrToken', ctrl.resolveTableByQr);

// Manager routes
router.post('/', requireAuth, requireRole('manager', 'admin'), requireRestaurantAccess, validateBody(tableSchema), ctrl.createTable);
router.get('/', requireAuth, requireRole('manager', 'admin', 'waiter'), requireRestaurantAccess, ctrl.listTables);
router.patch('/:id', requireAuth, requireRole('manager', 'admin'), requireRestaurantAccess, ctrl.updateTable);
router.post('/:id/qr', requireAuth, requireRole('manager', 'admin'), requireRestaurantAccess, ctrl.getTableQr);
router.post('/:id/qr/regenerate', requireAuth, requireRole('manager', 'admin'), requireRestaurantAccess, ctrl.regenerateTableQr);

export default router;