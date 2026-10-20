import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import SoundAlert from '../components/notifications/SoundAlert.jsx';
import Loader from '../components/common/Loader.jsx';

export default function KitchenDashboard() {
  const { user } = useAuth();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => orderService.kitchen().then(setOrders).catch(console.error).finally(() => setLoading(false));

  useEffect(() => {
    fetchOrders();
    if (socket) {
      socket.emit('notifications:join-restaurant', { restaurantId: user.restaurant });
      socket.on('notification', fetchOrders);
      return () => socket.off('notification', fetchOrders);
    }
  }, [socket, user]);

  const updateStatus = async (id, status) => { await orderService.updateStatus(id, status); fetchOrders(); };
  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <SoundAlert />
      <h1 className="text-2xl font-bold">Kitchen Queue</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orders.map((o) => (
          <div key={o._id} className="card border-t-4 border-t-orange-500">
            <div className="card-body">
              <div className="flex justify-between items-center mb-3"><h3 className="font-bold">{o.orderNumber}</h3><span className="badge-blue">{o.status}</span></div>
              <ul className="space-y-2 text-sm">{o.items.map((i) => <li key={i.menuItemId} className="flex justify-between"><span>{i.quantity}x {i.name}</span>{i.notes && <span className="text-xs text-rose-600">!{i.notes}</span>}</li>)}</ul>
              <div className="mt-4 pt-3 border-t border-slate-100">
                {(o.status === 'PAID' || o.status === 'CONFIRMED') && <button className="btn-secondary w-full" onClick={() => updateStatus(o._id, 'PREPARING')}>Start Preparing</button>}
                {o.status === 'PREPARING' && <button className="btn-success w-full" onClick={() => updateStatus(o._id, 'READY')}>Mark Ready</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}