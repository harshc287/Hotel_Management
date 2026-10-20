import { MenuCategory } from '../models/MenuCategory.js';
import { MenuItem } from '../models/MenuItem.js';
import { ok, fail } from '../utils/apiResponse.js';
import { AuditLog } from '../models/AuditLog.js';

// ---- Categories ----
export async function listCategories(req, res, next) {
  try {
    const items = await MenuCategory.find({ restaurant: req.restaurantId, isActive: true }).sort({
      sortOrder: 1,
      name: 1,
    });
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function createCategory(req, res, next) {
  try {
    const cat = await MenuCategory.create({ ...req.body, restaurant: req.restaurantId });
    await AuditLog.create({
      restaurant: req.restaurantId,
      user: req.user._id,
      action: 'CATEGORY_CREATE',
      targetType: 'MenuCategory',
      targetId: String(cat._id),
    });
    return ok(res, cat, 'Created', 201);
  } catch (e) {
    next(e);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const cat = await MenuCategory.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.restaurantId },
      req.body,
      { new: true }
    );
    if (!cat) return fail(res, 'Category not found', 404);
    return ok(res, cat);
  } catch (e) {
    next(e);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const cat = await MenuCategory.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.restaurantId },
      { isActive: false },
      { new: true }
    );
    if (!cat) return fail(res, 'Category not found', 404);
    return ok(res, null, 'Deleted');
  } catch (e) {
    next(e);
  }
}

// ---- Menu items ----
export async function listMenu(req, res, next) {
  try {
    const filter = { restaurant: req.restaurantId, isAvailable: true };
    if (req.query.category) filter.category = req.query.category;
    const items = await MenuItem.find(filter).sort({ name: 1 });
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function createItem(req, res, next) {
  try {
    const item = await MenuItem.create({ ...req.body, restaurant: req.restaurantId });
    await AuditLog.create({
      restaurant: req.restaurantId,
      user: req.user._id,
      action: 'MENU_ITEM_CREATE',
      targetType: 'MenuItem',
      targetId: String(item._id),
    });
    return ok(res, item, 'Created', 201);
  } catch (e) {
    next(e);
  }
}

export async function updateItem(req, res, next) {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.restaurantId },
      req.body,
      { new: true }
    );
    if (!item) return fail(res, 'Item not found', 404);
    return ok(res, item);
  } catch (e) {
    next(e);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.restaurantId },
      { isAvailable: false },
      { new: true }
    );
    if (!item) return fail(res, 'Item not found', 404);
    return ok(res, null, 'Removed');
  } catch (e) {
    next(e);
  }
}