# Reorganized frontend pages

This archive groups the supplied page components by feature/module.

## Folder structure

pages/
  public/       Home, public menu, QR menu, not found
  auth/         Login, Register, auth/styles/custom.css
  cart/         Cart, Checkout
  orders/       AllOrders, OrderDetails, OrderHistory, TrackOrder
  kitchen/      KitchenDashboard
  waiter/       WaiterDashboard
  delivery/     DeliveryDashboard, DeliveryDetails, DeliveryTracking
  manager/      ManagerDashboard, ManageMenu, ManageTables, RestaurantSettings, SalesReports
  payments/     PaymentResult, Payments

## Integration

Copy these folders into `client/src/pages/` (or your actual frontend src/pages folder).
Update imports in your route configuration because page paths have changed.
Shared components, context, hooks, and services remain in their existing shared folders.

This archive only reorganizes the page files supplied in pages.zip. It does not include the rest of the app, routes, components, contexts, hooks, services, or backend.

## Recommended public routes

/              -> public/Home.jsx
/menu          -> public/Menu.jsx
/qr/:token     -> public/QRMenu.jsx
/login         -> auth/Login.jsx
/register      -> auth/Register.jsx
/*             -> public/NotFound.jsx

Protect staff routes and route users to the correct dashboard after authentication.
