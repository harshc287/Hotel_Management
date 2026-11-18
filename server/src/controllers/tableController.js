import { Table } from '../models/Table.js';
import { Restaurant } from '../models/Restaurant.js';
import { ok, fail } from '../utils/apiResponse.js';
import { generateQrDataUrl } from '../services/qrCodeService.js';

export async function createTable(req, res, next) {
  try {
    const table = await Table.create({ restaurant: req.restaurantId, number: req.body.number });
    return ok(res, table, 'Created', 201);
  } catch (e) {
    if (e.code === 11000) return fail(res, 'Table number already exists', 409);
    next(e);
  }
}

export async function listTables(req, res, next) {
  try {
    const tables = await Table.find({ restaurant: req.restaurantId }).sort({ number: 1 });
    return ok(res, tables);
  } catch (e) {
    next(e);
  }
}


export async function updateTable(req, res, next) {
  try {
    const allowedFields = ['number', 'isActive'];

    const patch = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        patch[field] = req.body[field];
      }
    }

    if (Object.keys(patch).length === 0) {
      return fail(res, 'No valid fields provided', 400);
    }

    const table = await Table.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurant: req.restaurantId,
      },
      { $set: patch },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!table) {
      return fail(res, 'Table not found', 404);
    }

    return ok(res, table, 'Table updated');
  } catch (e) {
    next(e);
  }
}


export async function getTableQr(req, res, next) {
  try {
    const t = await Table.findOne({ _id: req.params.id, restaurant: req.restaurantId });
    if (!t) return fail(res, 'Table not found', 404);
    const baseUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
    const qr = await generateQrDataUrl({ baseUrl, token: t.qrToken });
    return ok(res, qr);
  } catch (e) {
    next(e);
  }
}

export async function regenerateTableQr(req, res, next) {
  try {
    const t = await Table.findOne({ _id: req.params.id, restaurant: req.restaurantId });
    if (!t) return fail(res, 'Table not found', 404);
    const crypto = await import('crypto');
    t.qrToken = crypto.randomBytes(16).toString('hex');
    await t.save();
    const baseUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
    const qr = await generateQrDataUrl({ baseUrl, token: t.qrToken });
    return ok(res, qr, 'Regenerated');
  } catch (e) {
    next(e);
  }
}

// PUBLIC — used by QR landing page
export async function resolveTableByQr(req, res, next) {
  try {
    const t = await Table.findOne({ qrToken: req.params.qrToken, isActive: true });
    if (!t) return fail(res, 'Invalid or expired QR', 404);
    const restaurant = await Restaurant.findById(t.restaurant);
    return ok(res, {
      tableId: t._id,
      tableNumber: t.number,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        taxPercent: restaurant.taxPercent,
        serviceChargePercent: restaurant.serviceChargePercent,
      },
    });
  } catch (e) {
    next(e);
  }
}