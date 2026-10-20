
# Order flow
1. Customer opens a restaurant menu or scans a table QR.
2. Frontend sends item IDs and quantities; server loads current available menu prices.
3. Server snapshots names/prices and calculates subtotal/tax/total.
4. Order is stored with separate order and payment statuses.
5. After a verified payment event (not a browser-only success callback), the payment service should mark it paid and emit persisted notifications.
6. Kitchen/waiter/manager advance only permitted status transitions.
7. Delivery assignment and GPS tracking are available only for active delivery orders and authorized participants.
