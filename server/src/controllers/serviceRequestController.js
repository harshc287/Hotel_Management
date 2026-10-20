import { ServiceRequest } from '../models/ServiceRequest.js';
import { Table } from '../models/Table.js';
import { dispatchNotification } from '../services/notificationService.js';
import { ok, fail } from '../utils/apiResponse.js';

export async function createRequest(req, res, next) {
  try {
    const { tableId, type, note, orderId } = req.body;
    const table = await Table.findById(tableId);
    if (!table || !table.isActive) return fail(res, 'Invalid table', 400);

    const request = await ServiceRequest.create({
      restaurant: table.restaurant,
      table: table._id,
      order: orderId || null,
      type,
      note: note || '',
    });

    const notifType = type === 'BILL_REQUEST' ? 'BILL_REQUEST' : 'WAITER_CALL';
    await dispatchNotification({
      restaurantId: table.restaurant,
      orderId: orderId || null,
      type: notifType,
      title: `${type === 'BILL_REQUEST' ? 'Bill' : 'Waiter'} requested at table ${table.number}`,
      message: note || '',
      payload: { serviceRequestId: request._id, tableNumber: table.number, type },
      targetRoles: ['waiter', 'manager'],
    });

    return ok(res, request, 'Requested', 201);
  } catch (e) {
    next(e);
  }
}

export async function listOpenRequests(req, res, next) {
  try {
    const items = await ServiceRequest.find({
      restaurant: req.user.restaurant,
      status: { $in: ['OPEN', 'ACKNOWLEDGED'] },
    })
      .sort({ createdAt: -1 })
      .populate('table', 'number')
      .lean();
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function acknowledgeRequest(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return fail(res, 'Not found', 404);
    if (String(request.restaurant) !== String(req.user.restaurant) && req.user.role !== 'admin') {
      return fail(res, 'Forbidden', 403);
    }
    if (request.status !== 'OPEN') {
      return ok(res, request, 'Already handled');
    }
    request.status = 'ACKNOWLEDGED';
    request.acknowledgedBy = req.user._id;
    await request.save();
    return ok(res, request, 'Acknowledged');
  } catch (e) {
    next(e);
  }
}

export async function resolveRequest(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return fail(res, 'Not found', 404);
    if (String(request.restaurant) !== String(req.user.restaurant) && req.user.role !== 'admin') {
      return fail(res, 'Forbidden', 403);
    }
    request.status = 'RESOLVED';
    if (!request.acknowledgedBy) request.acknowledgedBy = req.user._id;
    await request.save();
    return ok(res, request, 'Resolved');
  } catch (e) {
    next(e);
  }
}