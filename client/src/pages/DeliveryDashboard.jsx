import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deliveryService } from '../services/deliveryService.js';
import Loader from '../components/common/Loader.jsx';

export default function DeliveryDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { deliveryService.assignments().then(setAssignments).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Deliveries</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {assignments.map((a) => (
          <div key={a._id} className="card">
            <div className="card-body">
              <div className="flex justify-between mb-2"><h3 className="font-bold">{a.order.orderNumber}</h3><span className="badge-yellow">{a.status}</span></div>
              <p className="text-sm text-slate-600 mb-4">{a.order.deliveryAddress}</p>
              <Link to={`/delivery/${a._id}`} className="btn-primary w-full text-center">Open Map & Deliver</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}