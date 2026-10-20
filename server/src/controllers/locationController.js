import * as loc from '../services/locationTrackingService.js';
import { ok } from '../utils/apiResponse.js';

export async function startSession(req, res, next) {
  try {
    const role = req.user.role === 'delivery' ? 'delivery' : 'customer';
    const consent = await loc.recordConsent({ orderId: req.params.orderId, user: req.user, role, granted: true });
    return ok(res, consent, 'Consent recorded');
  } catch (e) {
    next(e);
  }
}

export async function stopSession(req, res, next) {
  try {
    const role = req.user.role === 'delivery' ? 'delivery' : 'customer';
    const consent = await loc.recordConsent({ orderId: req.params.orderId, user: req.user, role, granted: false });
    return ok(res, consent, 'Consent revoked');
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const role = req.user.role === 'delivery' ? 'delivery' : 'customer';
    const update = await loc.recordUpdate({
      orderId: req.params.orderId,
      user: req.user,
      role,
      lat: req.body.lat,
      lng: req.body.lng,
      accuracy: req.body.accuracy,
      recordedAt: req.body.recordedAt,
    });
    return ok(res, update, 'Recorded');
  } catch (e) {
    next(e);
  }
}

export async function latest(req, res, next) {
  try {
    const role = req.query.role || 'delivery';
    const update = await loc.getLatest(req.params.orderId, role);
    return ok(res, update);
  } catch (e) {
    next(e);
  }
}

export async function history(req, res, next) {
  try {
    const role = req.query.role || 'delivery';
    const items = await loc.getHistory(req.params.orderId, role);
    return ok(res, items);
  } catch (e) {
    next(e);
  }
}