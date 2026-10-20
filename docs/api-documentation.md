
# API summary
Base URL: `/api`

## Auth
`POST /auth/register` `{name,email,password,role?,restaurantName?}`; `POST /auth/login` `{email,password}`; `GET /auth/me` (Bearer token).

## Restaurants and menu
`GET /restaurants/public/:slug`; `GET /menu?restaurantId=<id>`; manager `POST /menu`, `PATCH /menu/:id`, `DELETE /menu/:id`.
Menu create body: `{restaurantId,name,description,price,category,imageUrl,isVeg,available}`.

## Tables / QR
Manager `POST /tables` `{restaurantId,tableNumber,seats}`; `GET /tables/qr/:token`; manager `POST /tables/:id/regenerate-qr`.

## Orders
`POST /orders` `{restaurantId,orderType,tableToken?,customerName,items:[{menuItemId,quantity,notes?}],deliveryAddress?}`.
`GET /orders/mine`; manager/staff `GET /orders?restaurantId=...`; `GET /orders/:id`; `PATCH /orders/:id/status` `{status}`.
Valid statuses are enforced by the server. Do not trust a client-calculated total.

## Notifications
`GET /notifications`; `PATCH /notifications/:id/acknowledge`.

All protected routes require `Authorization: Bearer <token>`. Restaurant ownership is checked on protected manager routes.
