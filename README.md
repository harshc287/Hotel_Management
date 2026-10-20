
# Restaurant Management System — MERN starter

Responsive React + Express + MongoDB application foundation for multi-restaurant QR ordering.

## Important implementation status
This ZIP contains a runnable foundation with authentication, restaurant scoping, menu CRUD/listing, table QR tokens, order creation/status transitions, Socket.IO notifications, and a React interface. It also lays out the planned modules and documents integration points. **It is not yet a production-certified implementation of every item in the supplied specification.** Razorpay refunds/webhook reconciliation, Google Maps routing/ETA, complete staff workflows, location consent/history retention, exhaustive reporting, and the full automated security test matrix require merchant/provider credentials and further end-to-end testing. Do not accept real payments until the payment checklist below is completed.

## Requirements
- Node.js 20+
- MongoDB local or Atlas
- npm

## Quick start (Windows PowerShell)
1. Open this folder in VS Code.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and strong JWT secrets.
3. Copy `client/.env.example` to `client/.env`.
4. From the project root run:
   ```powershell
   npm install
   npm run install:all
   npm run dev
   ```
5. Frontend: `http://localhost:5173`; API health: `http://localhost:5000/api/health`.

The first user to register can select a role only from the server-allowed public roles (`customer` or `manager`). For a real multi-tenant deployment, provision manager/admin accounts through a trusted seed/admin workflow; do not expose public admin registration. For development, use the included seed command to create demo users and sample menu data:
```powershell
npm run seed --prefix server
```
Demo credentials are printed by the script. Change them immediately and never use them in production.

## Environment variables
See `server/.env.example` and `client/.env.example`. Keep secrets only on the server. `VITE_RAZORPAY_KEY_ID` is a public checkout key; never put the Razorpay secret in a VITE variable.

## Main API
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/restaurants/public/:slug`
- `GET /api/menu?restaurantId=...`; manager: `POST /api/menu`, `PATCH /api/menu/:id`, `DELETE /api/menu/:id`
- `GET /api/tables/qr/:token`; manager: `POST /api/tables`, `POST /api/tables/:id/regenerate-qr`
- `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status`
- `GET /api/notifications`

## Order/payment safety
Order prices are recalculated from MongoDB menu item prices; the browser total is not trusted. Order and payment status are separate. The current order endpoint supports cash/test workflow and creates orders as `PENDING_PAYMENT` unless `PAYMENT_MODE=manual`; Razorpay endpoints are explicitly scaffolded for safe extension and should not be treated as real-money ready. Implement and test Razorpay signature verification and webhook idempotency before enabling live mode.

## Live notifications
Authenticated Socket.IO rooms are scoped by restaurant and role. Important notification records are persisted in MongoDB; clients should still reload notifications after reconnect. Browser sound requires a user gesture and a locally supplied audio file.

## Location privacy
Browser GPS is foreground-only and requires user consent, HTTPS in production, and permission. Do not use fabricated coordinates. The provided location module is a guarded starter and should be reviewed before production use. It does not promise background tracking or road ETA.

## Deployment
Deploy the API and frontend separately. Configure exact `CLIENT_URL`, HTTPS, MongoDB network access, secret environment variables, and restricted map keys. Test QR scans, cross-restaurant access, duplicate orders, socket room authorization, payment retries, and location revocation before launch.
