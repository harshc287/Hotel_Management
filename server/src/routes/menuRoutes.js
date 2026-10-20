import { Router } from 'express';
import * as ctrl from '../controllers/menuController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole, requireRestaurantAccess } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { categorySchema, menuItemSchema, updateItemSchema } from '../validators/menuValidator.js';

const router = Router();
router.use(requireAuth, requireRole('manager', 'admin'), requireRestaurantAccess);

router.get('/', ctrl.listMenu);
router.post('/', validateBody(menuItemSchema), ctrl.createItem);
router.patch('/:id', validateBody(updateItemSchema), ctrl.updateItem);
router.delete('/:id', ctrl.deleteItem);

router.get('/categories', ctrl.listCategories);
router.post('/categories', validateBody(categorySchema), ctrl.createCategory);
router.patch('/categories/:id', validateBody(categorySchema.partial()), ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

export default router;