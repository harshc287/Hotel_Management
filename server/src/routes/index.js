
import { Router } from 'express';
import auth from './authRoutes.js';
import menu from './menuRoutes.js';
import tables from './tableRoutes.js';
import orders from './orderRoutes.js';
import notifications from './notificationRoutes.js';
import restaurants from './restaurantRoutes.js';
import payments from './paymentRoutes.js';
const router = Router();
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'restaurant-management-api' }));
router.use('/auth', auth);
router.use('/menu', menu);
router.use('/tables', tables);
router.use('/orders', orders);
router.use('/notifications', notifications);
router.use('/restaurants', restaurants);
router.use('/payments', payments);
export default router;
