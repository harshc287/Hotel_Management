import { Restaurant } from '../models/Restaurant.js';
import { AuditLog } from '../models/AuditLog.js';
import { ok, fail } from '../utils/apiResponse.js';

// Public: basic restaurant info for QR landing pages
export async function getPublicInfo(req, res, next) {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true }).select(
      'name address phone taxPercent serviceChargePercent deliveryFee currency'
    );
    if (!restaurant) return fail(res, 'Not found', 404);
    return ok(res, restaurant);
  } catch (e) {
    next(e);
  }
}

// Manager: view/update own restaurant settings
export async function getSettings(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurant);
    if (!restaurant) return fail(res, 'Not found', 404);
    return ok(res, restaurant);
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const allowed = ['name', 'address', 'phone', 'taxPercent', 'serviceChargePercent', 'deliveryFee', 'currency', 'location'];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    const restaurant = await Restaurant.findByIdAndUpdate(req.user.restaurant, patch, {
      new: true,
      runValidators: true,
    });
    if (!restaurant) return fail(res, 'Not found', 404);

    await AuditLog.create({
      restaurant: restaurant._id,
      user: req.user._id,
      action: 'RESTAURANT_UPDATE',
      targetType: 'Restaurant',
      targetId: String(restaurant._id),
      details: patch,
    });
    return ok(res, restaurant, 'Updated');
  } catch (e) {
    next(e);
  }
}

// Admin only: create a new restaurant
export async function createRestaurant(req, res, next) {
  try {
    const restaurant = await Restaurant.create({
      name: req.body.name,
      address: req.body.address || '',
      phone: req.body.phone || '',
      taxPercent: req.body.taxPercent ?? 5,
      serviceChargePercent: req.body.serviceChargePercent ?? 0,
      deliveryFee: req.body.deliveryFee ?? 0,
    });
    await AuditLog.create({
      user: req.user._id,
      action: 'RESTAURANT_CREATE',
      targetType: 'Restaurant',
      targetId: String(restaurant._id),
    });
    return ok(res, restaurant, 'Created', 201);
  } catch (e) {
    next(e);
  }
}