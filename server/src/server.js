
// import 'dotenv/config';
// import http from 'node:http';
// import app from './app.js';
// import { connectDB } from './config/db.js';
// import { initSocket } from './config/socket.js';

// const port = Number(process.env.PORT || 5000);
// if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
//   throw new Error('JWT_ACCESS_SECRET must be at least 32 characters. Set it in server/.env');
// }
// await connectDB();
// const server = http.createServer(app);
// initSocket(server);
// server.listen(port, () => console.log(`API listening on http://localhost:${port}`));

import 'dotenv/config';
import { validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

async function start() {
  try {
    validateEnv();
    await connectDB();

    const app = createApp();
    const port = Number(process.env.PORT || 5000);

    const server = app.listen(port, () => {
      console.log(`[server] listening on http://localhost:${port}`);
    });

    const shutdown = async (signal) => {
      console.log(`[server] ${signal} received, shutting down`);
      server.close(async () => {
        const { disconnectDB } = await import('./config/db.js');
        await disconnectDB();
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[server] startup failed:', err.message);
    process.exit(1);
  }
}

start();