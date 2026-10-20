
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import { httpError } from '../utils/apiResponse.js';
export async function listMenu(req, res) {
  const filter = { restaurantId: req.query.restaurantId, available: true };
  if (!filter.restaurantId) return res.status(400).json({ message: 'restaurantId is required' });
  res.json({ items: await MenuItem.find(filter).sort({ name: 1 }).lean() });
}
export async function createMenu(req, res) {
  const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, owner: req.user._id });
  if (!restaurant && req.user.role !== 'admin') throw httpError(403, 'Restaurant access denied');
  const item = await MenuItem.create({ ...req.body, restaurantId: req.body.restaurantId });
  res.status(201).json({ item });
}
export async function updateMenu(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw httpError(404, 'Menu item not found');
  if (req.user.role !== 'admin' && (!req.user.restaurantId || item.restaurantId.toString() !== req.user.restaurantId.toString())) throw httpError(403, 'Restaurant access denied');
  Object.assign(item, req.body, { restaurantId: item.restaurantId });
  await item.save(); res.json({ item });
}
export async function deleteMenu(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw httpError(404, 'Menu item not found');
  if (req.user.role !== 'admin' && item.restaurantId.toString() !== req.user.restaurantId?.toString()) throw httpError(403, 'Restaurant access denied');
  await item.deleteOne(); res.json({ message: 'Menu item deleted' });
}
