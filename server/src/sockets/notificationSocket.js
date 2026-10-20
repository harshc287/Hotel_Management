// Handles role/restaurant room joins for notifications.
const STAFF = ['waiter', 'cook', 'manager', 'admin'];

export function registerNotificationSocket(io, socket) {
  // Personal room
  socket.join(`user:${socket.user.id}`);

  // Role room (only staff roles are useful for broadcast, but harmless otherwise)
  if (socket.user.role) socket.join(`role:${socket.user.role}`);

  socket.on('notifications:join-restaurant', ({ restaurantId }, ack) => {
    if (!STAFF.includes(socket.user.role)) {
      return ack?.({ ok: false, error: 'Forbidden' });
    }
    if (!restaurantId || String(restaurantId) !== String(socket.user.restaurant)) {
      return ack?.({ ok: false, error: 'Restaurant mismatch' });
    }
    socket.join(`restaurant:${restaurantId}`);
    return ack?.({ ok: true });
  });

  socket.on('notifications:leave-restaurant', ({ restaurantId }) => {
    socket.leave(`restaurant:${restaurantId}`);
  });

  // Heartbeat / presence
  socket.on('ping:app', (cb) => cb?.({ ok: true, at: Date.now() }));
}