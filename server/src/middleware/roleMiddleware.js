
import { fail } from '../utils/apiResponse.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return fail(res, 'Forbidden: insufficient role', 403);
    }

    next();
  };
}

export function requireRestaurantAccess(req, res, next) {
  if (!req.user) {
    return fail(res, 'Authentication required', 401);
  }

  const userRestaurant = req.user.restaurant
    ? String(req.user.restaurant._id || req.user.restaurant)
    : '';

  const requestedRestaurant = String(
    req.params.restaurantId ||
    req.body?.restaurantId ||
    req.body?.restaurant ||
    req.query?.restaurantId ||
    req.query?.restaurant ||
    ''
  );

  const isAdmin = req.user.role === 'admin';

  // Non-admin users cannot access another restaurant.
  if (
    !isAdmin &&
    requestedRestaurant &&
    requestedRestaurant !== userRestaurant
  ) {
    return fail(res, 'Forbidden: different restaurant', 403);
  }

  // Admin must select a restaurant if none is assigned.
  const restaurantId = requestedRestaurant || userRestaurant;

  if (!restaurantId) {
    return fail(res, 'Restaurant selection required', 403);
  }

  req.restaurantId = restaurantId;

  next();
}
