import * as orderService from "../services/orderService.js";
import { ok, fail } from "../utils/apiResponse.js";
import { Order } from "../models/Order.js";
import { dispatchNotification } from "../services/notificationService.js";

export async function createOrder(req, res, next) {
  try {
    const {
      restaurantId,
      tableId,
      orderType,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLocation,
      items,
      specialInstructions,
    } = req.body;

    const order = await orderService.createOrder({
      restaurantId,
      tableId,
      orderType,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLocation,
      items,
      specialInstructions,
      user: req.user || null,
    });
    return ok(res, order, "Created", 201);
  } catch (e) {
    next(e);
  }
}

export async function getOrder(req, res, next) {
  try {
    const filter = {};
    if (req.user.role !== "admin") {
      if (!["manager", "waiter", "cook"].includes(req.user.role)) {
        filter.customer = req.user._id;
      }
    }
    const order = await orderService.getOrderById(req.params.id, filter);
    return ok(res, order);
  } catch (e) {
    next(e);
  }
}

export async function listKitchenOrders(req, res, next) {
  try {
    const statuses = ["PAID", "CONFIRMED", "PREPARING", "READY"];
    const orders = await Order.find({
      restaurant: req.restaurantId,
      status: { $in: statuses },
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function listWaiterOrders(req, res, next) {
  try {
    const statuses = ["PAID", "CONFIRMED", "PREPARING", "READY", "SERVED"];
    const orders = await Order.find({
      restaurant: req.restaurantId,
      status: { $in: statuses },
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return ok(res, orders);
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return fail(res, "Order not found", 404);
    if (
      req.user.role !== "admin" &&
      String(order.restaurant) !== String(req.user.restaurant)
    ) {
      return fail(res, "Forbidden", 403);
    }
    const updated = await orderService.transitionOrder(
      order._id,
      status,
      req.user._id,
      note || "",
    );
    const notifMap = {
      PREPARING: {
        type: "ORDER_PREPARING",
        title: "Order preparing",
        roles: ["waiter", "manager"],
      },
      READY: {
        type: "ORDER_READY",
        title: "Order ready",
        roles: ["waiter", "manager"],
      },
      OUT_FOR_DELIVERY: {
        type: "DELIVERY_PICKED_UP",
        title: "Out for delivery",
        roles: ["manager"],
      },
      DELIVERED: {
        type: "ORDER_DELIVERED",
        title: "Delivered",
        roles: ["manager"],
      },
      CANCELLED: {
        type: "ORDER_CANCELLED",
        title: "Order cancelled",
        roles: ["cook", "waiter", "manager"],
      },
    };
    if (notifMap[status]) {
      const n = notifMap[status];
      dispatchNotification({
        restaurantId: updated.restaurant,
        orderId: updated._id,
        type: n.type,
        title: `${n.title} — ${updated.orderNumber}`,
        targetRoles: n.roles,
      });
    }
    return ok(res, updated, "Updated");
  } catch (e) {
    next(e);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return fail(res, "Order not found", 404);
    const isOwner = String(order.customer) === String(req.user._id);
    const isStaff = ["manager", "admin"].includes(req.user.role);
    if (!isOwner && !isStaff) return fail(res, "Forbidden", 403);
    if (!["PENDING_PAYMENT", "PAID", "CONFIRMED"].includes(order.status)) {
      return fail(res, "Cannot cancel at this stage", 400);
    }
    const updated = await orderService.transitionOrder(
      order._id,
      "CANCELLED",
      req.user._id,
      req.body.reason || "",
    );
    return ok(res, updated, "Cancelled");
  } catch (e) {
    next(e);
  }
}
