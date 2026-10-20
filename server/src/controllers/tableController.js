
import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';
import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import { httpError } from '../utils/apiResponse.js';
const frontend = () => process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
export async function createTable(req, res) {
  const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, owner: req.user._id });
  if (!restaurant && req.user.role !== 'admin') throw httpError(403, 'Restaurant access denied');
  const table = await Table.create({ restaurantId: req.body.restaurantId, tableNumber: String(req.body.tableNumber), seats: Number(req.body.seats || 2), qrToken: randomBytes(24).toString('hex') });
  const url = `${frontend()}/qr/${table.qrToken}`;
  res.status(201).json({ table, qrUrl: url, qrDataUrl: await QRCode.toDataURL(url) });
}
export async function lookupQR(req, res) {
  const table = await Table.findOne({ qrToken: req.params.token, enabled: true }).populate('restaurantId', 'name slug address taxRate');
  if (!table || !table.restaurantId?.active) throw httpError(404, 'This table QR code is invalid or disabled');
  res.json({ table: { id: table._id, tableNumber: table.tableNumber, restaurantId: table.restaurantId._id }, restaurant: table.restaurantId });
}
export async function regenerateQR(req, res) {
  const table = await Table.findById(req.params.id);
  if (!table) throw httpError(404, 'Table not found');
  if (req.user.role !== 'admin' && table.restaurantId.toString() !== req.user.restaurantId?.toString()) throw httpError(403, 'Restaurant access denied');
  table.qrToken = randomBytes(24).toString('hex'); await table.save();
  const url = `${frontend()}/qr/${table.qrToken}`;
  res.json({ table, qrUrl: url, qrDataUrl: await QRCode.toDataURL(url) });
}
export async function listTables(req, res) {
  if (req.user.role !== 'admin' && req.user.restaurantId?.toString() !== req.query.restaurantId) throw httpError(403, 'Restaurant access denied');
  res.json({ tables: await Table.find({ restaurantId: req.query.restaurantId }).sort({ tableNumber: 1 }) });
}
