import * as reportService from '../services/reportService.js';
import { ok, fail } from '../utils/apiResponse.js';

function parseRange(query) {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw Object.assign(new Error('Invalid date range'), { status: 400 });
  }
  if (from > to) {
    throw Object.assign(new Error('from must be before to'), { status: 400 });
  }
  return { from, to };
}

export async function getSalesReport(req, res, next) {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await reportService.getSalesSeries({
      restaurantId: req.user.restaurant,
      from,
      to,
    });
    return ok(res, rows);
  } catch (e) {
    next(e);
  }
}

export async function getSummaryReport(req, res, next) {
  try {
    const { from, to } = parseRange(req.query);
    const summary = await reportService.getSummary({
      restaurantId: req.user.restaurant,
      from,
      to,
    });
    return ok(res, summary);
  } catch (e) {
    next(e);
  }
}

export async function exportSalesCsv(req, res, next) {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await reportService.getSalesSeries({
      restaurantId: req.user.restaurant,
      from,
      to,
    });
    const csv = reportService.toCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv"`
    );
    res.send(csv);
  } catch (e) {
    next(e);
  }
}