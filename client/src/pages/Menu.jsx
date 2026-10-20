import { useEffect, useState } from 'react';
import { menuService } from '../../services/menuService.js';
import { useCart } from '../../context/CartContext.jsx';
import MenuCategory from '../../components/menu/MenuCategory.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const nav = useNavigate();
  const { setContext, setOrderType, itemCount } = useCart();
  const [state, setState] = useState({ loading: true, error: null, menu: null });

  useEffect(() => {
    const rid = localStorage.getItem('rms_restaurant_id') || prompt('Enter restaurant id');
    if (!rid) { setState({ loading: false, error: 'No restaurant selected', menu: null }); return; }
    localStorage.setItem('rms_restaurant_id', rid);
    setContext({ restaurantId: rid, tableId: null, tableNumber: null });
    setOrderType('DELIVERY');
    menuService.publicMenu(rid).then((menu) => setState({ loading: false, error: null, menu })).catch((err) => setState({ loading: false, error: err.message, menu: null }));
  }, [setContext, setOrderType]);

  if (state.loading) return <Loader label="Loading menu…" />;
  if (state.error) return <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{state.error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Menu (Delivery)</h1>
        <button className="btn-success" onClick={() => nav('/cart')} disabled={itemCount === 0}>Cart ({itemCount})</button>
      </div>
      <MenuCategory menu={state.menu} />
    </div>
  );
}