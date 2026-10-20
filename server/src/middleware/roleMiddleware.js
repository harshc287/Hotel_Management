import { fail } from '../utils/apiResponse.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) {
      return fail(res, 'Forbidden: insufficient role', 403);
    }
    next();
  };
}

export function requireRestaurantAccess(req, res, next) {
  if (!req.user) return fail(res, 'Authentication required', 401);
  const restaurantId = String(req.user.restaurant || '');
  const requested = String(req.params.restaurantId || req.body.restaurant || req.query.restaurant || '');
  if (req.user.role === 'admin') return next();
  if (!restaurantId) return fail(res, 'User has no restaurant assigned', 403);
  if (requested && requested !== restaurantId) {
    return fail(res, 'Forbidden: different restaurant', 403);
  }
  req.restaurantId = restaurantId;
  next();
}