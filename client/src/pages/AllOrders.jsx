import { useEffect, useState } from 'react';
import { managerService } from '../../services/managerService.js';
import Loader from '../../components/common/Loader.jsx';
export default function AllOrders() {
  const [data, setData] = useState(null);
  useEffect(() => { managerService.allOrders().then(setData); }, []);
  if (!data) return <Loader />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Orders</h1>
      <div className="card"><div className="card-body">
        <table className="w-full text-left text-sm"><thead className="text-slate-500 border-b border-slate-100"><tr><th className="pb-2">Number</th><th className="pb-2">Customer</th><th className="pb-2">Total</th><th className="pb-2">Status</th></tr></thead>
        <tbody className="divide-y divide-slate-50">{data.items.map((o) => <tr key={o._id}><td className="py-2">{o.orderNumber}</td><td className="py-2">{o.customerName}</td><td className="py-2">₹{o.total}</td><td className="py-2"><span className="badge-blue">{o.status}</span></td></tr>)}</tbody></table>
      </div></div>
    </div>
  );
}