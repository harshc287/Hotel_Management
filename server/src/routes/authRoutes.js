import { Router } from 'express';
import cookieParser from 'cookie-parser';
import * as ctrl from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();
router.use(cookieParser());

router.post('/register', authLimiter, validateBody(registerSchema), ctrl.register);
router.post('/login', authLimiter, validateBody(loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

export default router;