import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import Loader from '../components/common/Loader.jsx';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    orderService.mine()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false)); 
  }, []);

  if (loading) return <Loader />;
  if (!orders.length) return <p className="text-slate-500">You have no past orders.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {orders.map((o) => (
          <div key={o._id} className="card">
            <div className="card-body">
              <div className="flex justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="font-semibold">{o.orderNumber}</span>
                <span className="badge-blue">{o.status}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 mb-3">
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                <span>₹{o.total}</span>
              </div>
              <Link to={`/track/${o._id}`} className="btn-secondary w-full text-center">Track</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}