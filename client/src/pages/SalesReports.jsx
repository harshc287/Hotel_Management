import { useEffect, useState } from 'react';
import { managerService } from '../services/managerService.js';
import Loader from '../components/common/Loader.jsx';
export default function SalesReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { managerService.reports().then(setData).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales Reports</h1>
      <div className="card"><div className="card-body">
        <table className="w-full text-left text-sm"><thead className="text-slate-500 border-b border-slate-100"><tr><th className="pb-2">Date</th><th className="pb-2">Orders</th><th className="pb-2">Revenue</th></tr></thead>
        <tbody className="divide-y divide-slate-50">{data.map((d) => <tr key={d._id}><td className="py-2">{d._id}</td><td className="py-2">{d.orders}</td><td className="py-2">₹{d.revenue}</td></tr>)}</tbody></table>
      </div></div>
    </div>
  );
}