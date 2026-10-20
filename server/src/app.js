
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import apiRoutes from './routes/index.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// const app = express();
// app.use(helmet());
// app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'], credentials: true }));
// app.use(express.json({ limit: '1mb' }));
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
// app.use('/api', apiRoutes);
// app.use(notFound);
// app.use(errorHandler);
// export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL?.split(',') ?? 'http://localhost:5173',
      credentials: true,
    })
  );

  // Raw body for webhook signature verification (must come before express.json)
  app.use(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res, next) => {
      const mod = await import('./controllers/paymentController.js');
      return mod.webhook(req, res, next);
    }
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/tables', tableRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/delivery', deliveryRoutes);
  app.use('/api/location', locationRoutes);
  app.use('/api/manager', managerRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}