
# Socket.IO events
Client authenticates with `{ auth: { token } }`. Server emits `notification:new` only to restaurant and role rooms after persisting the notification. Do not join arbitrary order rooms; order-specific subscriptions must first verify order ownership/assignment server-side. On reconnect, reload `/api/notifications` and relevant order endpoints.
