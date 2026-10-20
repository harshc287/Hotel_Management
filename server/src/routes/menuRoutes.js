
import { Router } from 'express';
import { listMenu, createMenu, updateMenu, deleteMenu } from '../controllers/menuController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { menuSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/apiResponse.js';
const router = Router();
router.get('/', asyncHandler(listMenu));
router.post('/', requireAuth, allowRoles('manager','admin'), validate(menuSchema), asyncHandler(createMenu));
router.patch('/:id', requireAuth, allowRoles('manager','admin'), asyncHandler(updateMenu));
router.delete('/:id', requireAuth, allowRoles('manager','admin'), asyncHandler(deleteMenu));
export default router;
