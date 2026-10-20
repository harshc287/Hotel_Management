import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

import { validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';
import { socketAuth } from './sockets/socketAuth.js';
import { registerNotificationSocket } from './sockets/notificationSocket.js';
import { registerOrderSocket } from './sockets/orderSocket.js';
import { startPendingPaymentCleanup } from './jobs/pendingPaymentCleanup.js';

let httpServer;
let io;

async function start() {
  try {
    // 1. Validate env & connect to MongoDB
    const config = validateEnv();
    await connectDB(config.mongoUri);

    // 2. Build HTTP app
    const app = createApp();
    httpServer = http.createServer(app);

    // 3. Socket.IO with auth middleware
    io = new Server(httpServer, {
      cors: {
        origin: config.clientUrls,
        credentials: true,
      },
      pingTimeout: 25000,
    });
    io.use(socketAuth);

    io.on('connection', (socket) => {
      console.log(`[socket] connected ${socket.id} user=${socket.user.id} role=${socket.user.role}`);
      registerNotificationSocket(io, socket);
      registerOrderSocket(io, socket);

      socket.on('disconnect', (reason) => {
        console.log(`[socket] disconnected ${socket.id} (${reason})`);
      });
    });

    // 4. Start listening
    httpServer.listen(config.port, () => {
      console.log(`[server] listening on http://localhost:${config.port} (${config.env})`);
      console.log(`[server] CORS origins: ${config.clientUrls.join(', ')}`);
    });

    // 5. Background jobs (skip in tests)
    if (config.env !== 'test') {
      startPendingPaymentCleanup();
    }

    // 6. Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`[server] ${signal} received, shutting down`);
      try {
        io.close();
        httpServer.close(async () => {
          await disconnectDB();
          process.exit(0);
        });
        // Force exit if close hangs
        setTimeout(() => process.exit(1), 10000).unref();
      } catch (err) {
        console.error('[server] shutdown error', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => {
      console.error('[server] unhandledRejection', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('[server] uncaughtException', err);
      // Let the process manager restart us
      process.exit(1);
    });
  } catch (err) {
    console.error('[server] startup failed:', err.message);
    process.exit(1);
  }
}

start();

// Export for tests (supertest against app without listening)
export { httpServer, io };