import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function MenuCard({ item }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-40 w-full object-cover" />}
      <div className="card-body flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{item.name}</h3>
          {item.isVeg ? <span className="badge-green">Veg</span> : <span className="badge-red">Non-veg</span>}
        </div>
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{item.description}</p>
        <p className="mt-2 text-base font-semibold text-slate-900">₹{item.price}</p>
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))} className="input w-16" />
            <input className="input flex-1" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => { addItem(item, qty, [], notes); setQty(1); setNotes(''); }}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}