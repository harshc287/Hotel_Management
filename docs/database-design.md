
# Database design
- User: hashed password, role, restaurant scope.
- Restaurant: owner, slug, name, currency/tax settings.
- Table: restaurant, table number, unpredictable QR token, enabled flag.
- MenuCategory/MenuItem: restaurant-scoped catalog and price.
- Order: immutable item/price snapshots, totals, order status, payment status, order type.
- Payment: gateway reference, amount/currency/status, idempotency key.
- Notification: restaurant/role/recipient scope, stable event ID, acknowledged timestamp.
- ServiceRequest, DeliveryAssignment, LocationConsent, LocationUpdate, AuditLog: supporting schemas for waiter service, delivery tracking and audit trail.
