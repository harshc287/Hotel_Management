import * as deliveryService from '../services/deliveryAssignmentService.js';
import { DeliveryAssignment } from '../models/DeliveryAssignment.js';
import { Order } from '../models/Order.js';
import { ok, fail } from '../utils/apiResponse.js';

export async function listAssignments(req, res, next) {
  try {
    const filter =
      req.user.role === 'delivery' ? { partner: req.user._id } : { restaurant: req.user.restaurant };
    const items = await DeliveryAssignment.find(filter)
      .populate('order', 'orderNumber customerName deliveryAddress status')
      .sort({ createdAt: -1 })
      .lean();
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}

export async function createAssignment(req, res, next) {
  try {
    const a = await deliveryService.assignDelivery({
      orderId: req.body.orderId,
      partnerId: req.body.partnerId,
      manager: req.user,
    });
    return ok(res, a, 'Assigned', 201);
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const a = await deliveryService.updateAssignmentStatus({
      assignmentId: req.params.id,
      status: req.body.status,
      partner: req.user,
    });
    return ok(res, a, 'Updated');
  } catch (e) {
    next(e);
  }
}

export async function listActive(req, res, next) {
  try {
    const orders = await Order.find({
      restaurant: req.user.restaurant,
      orderType: 'DELIVERY',
      status: { $in: ['PAID', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] },
    })
      .populate('deliveryPartner', 'name phone')
      .lean();
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function listPartners(req, res, next) {
  try {
    const { User } = await import('../models/User.js');
    const partners = await User.find({
      role: 'delivery',
      restaurant: req.user.restaurant,
      isActive: true,
    }).select('name email phone').lean();
    return ok(res, partners);
  } catch (e) {
    next(e);
  }
}