import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import SoundAlert from '../components/notifications/SoundAlert.jsx';
import Loader from '../components/common/Loader.jsx';

export default function WaiterDashboard() {
  const { user } = useAuth();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => orderService.waiter().then(setOrders).catch(console.error).finally(() => setLoading(false));

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
      <h1 className="text-2xl font-bold">Waiter Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((o) => (
          <div key={o._id} className="card border-l-4 border-l-brand-500">
            <div className="card-body">
              <div className="flex justify-between items-start"><div><h3 className="font-bold">{o.orderNumber}</h3><p className="text-sm text-slate-500">{o.orderType === 'DINE_IN' ? `Table ${o.table?.number}` : 'Delivery'}</p></div><span className="badge-yellow">{o.status}</span></div>
              <div className="mt-3 text-sm">{o.items.map((i) => <div key={i.menuItemId}>{i.quantity}x {i.name}</div>)}</div>
              <div className="mt-4 flex gap-2">
                {o.status === 'READY' && <button className="btn-primary w-full" onClick={() => updateStatus(o._id, 'SERVED')}>Mark Served</button>}
                {o.status === 'PAID' && <button className="btn-secondary w-full" onClick={() => updateStatus(o._id, 'CONFIRMED')}>Accept</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}