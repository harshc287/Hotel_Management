import { useNotifications } from '../../context/NotificationContext.jsx';

export default function NotificationList() {
  const { notifications } = useNotifications();
  return (
    <div className="max-h-80 overflow-y-auto p-2">
      {notifications.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">No notifications.</p> : (
        notifications.map((n) => (
          <div key={n.id} className="mb-2 rounded-lg border border-slate-100 p-3 text-sm">
            <div className="flex justify-between items-start gap-2">
              <span className="font-semibold">{n.title}</span>
              <span className="text-[10px] text-slate-400">{new Date(n.at).toLocaleTimeString()}</span>
            </div>
            {n.message && <p className="mt-1 text-slate-600">{n.message}</p>}
          </div>
        ))
      )}
    </div>
  );
}