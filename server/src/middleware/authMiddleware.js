
import { verifyAccessToken } from '../utils/generateToken.js';
import { User } from '../models/User.js';
import { fail } from '../utils/apiResponse.js';

async function authenticateToken(token) {
  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    return null;
  }

  if ((payload.v ?? 0) !== (user.refreshTokenVersion ?? 0)) {
    return null;
  }

  return user;
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return fail(res, 'Authentication required', 401);
    }

    const user = await authenticateToken(token);

    if (!user) {
      return fail(res, 'Invalid, expired, or revoked token', 401);
    }

    req.user = user;

    return next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next();
    }

    const user = await authenticateToken(token);

    if (user) {
      req.user = user;
    }
  } catch {
    // Invalid optional credentials are treated as guest access.
  }

  return next();
}
