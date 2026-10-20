import { useEffect, useState } from 'react';
import { managerService } from '../services/managerService.js';
import Loader from '../components/common/Loader.jsx';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { managerService.dashboard().then(setData).catch(console.error); }, []);
  if (!data) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Revenue Today', value: `₹${data.revenueToday}` },
          { label: 'Orders Today', value: data.ordersToday },
          { label: 'Active Orders', value: data.activeOrders },
          { label: 'Pending Payments', value: data.pendingPayments },
          { label: 'Active Deliveries', value: data.activeDeliveries },
          { label: 'Cancelled Today', value: data.cancelledToday },
        ].map((c) => (
          <div key={c.label} className="card"><div className="card-body"><p className="text-sm text-slate-500">{c.label}</p><p className="mt-1 text-3xl font-bold">{c.value}</p></div></div>
        ))}
      </div>
    </div>
  );
}