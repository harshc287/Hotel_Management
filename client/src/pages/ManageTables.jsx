import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
export default function ManageTables() {
  const [tables, setTables] = useState([]);
  useEffect(() => { api.get('/tables').then((r) => setTables(r.data.data)); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Tables</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tables.map((t) => <div key={t._id} className="card"><div className="card-body text-center"><h3 className="text-xl font-bold">{t.number}</h3><p className="text-xs text-slate-500">{t.isActive ? 'Active' : 'Inactive'}</p></div></div>)}
      </div>
    </div>
  );
}