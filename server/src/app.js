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
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { webhook as paymentWebhook } from './controllers/paymentController.js';

export function createApp() {
  const app = express();

  // Trust proxy so client IPs behind Render/Heroku/Nginx are correct for rate limiters
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map((s) => s.trim()),
      credentials: true,
    })
  );

  // Webhook must use raw body for signature verification, so register it
  // BEFORE express.json() and never let json parsing touch it.
  app.use(
    '/api/payments/webhook',
    express.raw({ type: 'application/json', limit: '512kb' }),
    paymentWebhook
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Routes
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
  app.use('/api/service-requests', serviceRequestRoutes);
  app.use('/api/restaurants', restaurantRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}