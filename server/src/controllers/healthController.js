import mongoose from 'mongoose';

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export function getHealth(req, res) {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    db: STATES[mongoose.connection.readyState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
}