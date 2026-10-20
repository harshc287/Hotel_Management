import { verifyAccessToken } from '../utils/generateToken.js';
import { User } from '../models/User.js';

// Socket.IO middleware — attaches socket.user = { id, role, restaurant }
export async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/, '');

    if (!token) return next(new Error('Unauthorized: token required'));

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('name role restaurant isActive');
    if (!user || !user.isActive) return next(new Error('Unauthorized: user inactive'));

    socket.user = {
      id: String(user._id),
      role: user.role,
      restaurant: user.restaurant ? String(user.restaurant) : null,
    };
    next();
  } catch {
    next(new Error('Unauthorized: invalid token'));
  }
}