
import { useNotifications } from '../../hooks/useNotifications.js';

export default function NotificationList() {
  const { notifications, notificationLoading } = useNotifications();

  if (notificationLoading) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        Loading notifications...
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        No notifications.
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto p-2">
      {notifications.map((notification) => (
        <div
          key={notification._id || notification.id}
          className="mb-2 rounded-lg border border-slate-100 p-3 text-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold">
              {notification.title}
            </span>

            <span className="text-[10px] text-slate-400">
              {notification.createdAt || notification.at
                ? new Date(
                    notification.createdAt || notification.at
                  ).toLocaleTimeString()
                : ''}
            </span>
          </div>

          {notification.message && (
            <p className="mt-1 text-slate-600">
              {notification.message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
