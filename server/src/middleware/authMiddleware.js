import { verifyAccessToken } from '../utils/generateToken.js';
import { User } from '../models/User.js';
import { fail } from '../utils/apiResponse.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return fail(res, 'Authentication required', 401);
    }
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return fail(res, 'User inactive or missing', 401);
    req.user = user;
    next();
  } catch (err) {
    return fail(res, 'Invalid or expired token', 401);
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyAccessToken(token);
      req.authPayload = payload;
    } catch {
      /* ignore */
    }
  }
  next();
}