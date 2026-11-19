import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
export default function ManageMenu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  useEffect(() => { Promise.all([api.get('/menu/categories'), api.get('/menu')]).then(([c, i]) => { setCategories(c.data.data); setItems(i.data.data); }); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Menu</h1>
      <div className="card"><div className="card-body">
        <table className="w-full text-left text-sm"><thead className="text-slate-500 border-b border-slate-100"><tr><th className="pb-2">Name</th><th className="pb-2">Price</th><th className="pb-2">Status</th></tr></thead>
        <tbody className="divide-y divide-slate-50">{items.map((i) => <tr key={i._id}><td className="py-2">{i.name}</td><td className="py-2">₹{i.price}</td><td className="py-2">{i.isAvailable ? <span className="badge-green">Available</span> : <span className="badge-red">Out</span>}</td></tr>)}</tbody></table>
      </div></div>
    </div>
  );
}