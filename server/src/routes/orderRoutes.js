
import { Router } from 'express';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { orderSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/apiResponse.js';
import { placeOrder, myOrders, listOrders, getOrder, updateStatus, cancelOrder } from '../controllers/orderController.js';
const router = Router();
router.post('/', requireAuth, validate(orderSchema), asyncHandler(placeOrder));
router.get('/mine', requireAuth, asyncHandler(myOrders));
router.get('/', requireAuth, allowRoles('manager','admin','waiter','kitchen','delivery'), asyncHandler(listOrders));
router.get('/:id', requireAuth, asyncHandler(getOrder));
router.patch('/:id/status', requireAuth, allowRoles('manager','admin','kitchen','waiter','delivery'), asyncHandler(updateStatus));
router.post('/:id/cancel', requireAuth, asyncHandler(cancelOrder));
export default router;
