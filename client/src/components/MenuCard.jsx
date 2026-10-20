
import { Plus, Leaf } from 'lucide-react';
export default function MenuCard({ item, onAdd }) {
  return <article className="food-card h-100">
    <div className="food-art"><span className="food-emoji">{item.isVeg ? '🥗' : '🍗'}</span><span className={`diet-dot ${item.isVeg ? 'veg' : 'nonveg'}`}></span></div>
    <div className="p-3 p-lg-4"><div className="d-flex justify-content-between align-items-start gap-2"><h3 className="food-title">{item.name}</h3><strong className="food-price">₹{item.price}</strong></div>
    <p className="food-description">{item.description || 'Freshly prepared by our kitchen.'}</p>
    <div className="d-flex justify-content-between align-items-center mt-3"><span className="food-tag">{item.isVeg ? <><Leaf size={13}/> Vegetarian</> : 'Chef’s special'}</span><button className="btn btn-add" onClick={() => onAdd(item)}><Plus size={16}/> Add</button></div></div>
  </article>;
}
