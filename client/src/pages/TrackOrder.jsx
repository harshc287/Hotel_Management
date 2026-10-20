import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService.js';
import Loader from '../../components/common/Loader.jsx';

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { orderService.get(id).then(setOrder).catch((err) => setError(err.message)); }, [id]);

  if (error) return <div className="text-rose-600">{error}</div>;
  if (!order) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card">
        <div className="card-body">
          <div className="flex justify-between border-b border-slate-100 pb-3"><h1 className="text-xl font-bold">Order #{order.orderNumber}</h1><span className="badge-blue">{order.status}</span></div>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total</span><span className="font-semibold">₹{order.total}</span></div>
            <div><h3 className="text-sm font-semibold">Items</h3>{order.items.map((it, i) => <div key={i} className="flex justify-between text-sm mt-1"><span>{it.quantity}x {it.name}</span><span>₹{it.lineTotal}</span></div>)}</div>
          </div>
        </div>
      </div>
      <Link to="/" className="btn-secondary w-full text-center block">Home</Link>
    </div>
  );
}