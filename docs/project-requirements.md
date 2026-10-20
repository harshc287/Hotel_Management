
# Requirements and delivery plan
This repository maps to the supplied requirements for QR dine-in, delivery, role dashboards, online payments, realtime notifications and consent-based delivery tracking.

## Implemented in this starter
- React/Vite responsive shell and route protection.
- Express/Mongoose setup, env validation, password hashing and JWT auth.
- Restaurant-scoped menu and tables.
- Unpredictable QR tokens and QR image data URL generation.
- Server-side menu price snapshots when creating orders.
- Validated order status transitions and persistent notifications.
- Authenticated Socket.IO connection with role/restaurant rooms.
- Development seed script and API docs.

## Requires configuration and further integration tests before production
- Razorpay order creation, signature verification, webhook reconciliation, refunds and payment ledger.
- Mapping provider key, route/ETA service and production HTTPS.
- Complete manager/staff CRUD screens, delivery assignment UX, location consent/history retention.
- Full audit/report exports and comprehensive automated tests.
