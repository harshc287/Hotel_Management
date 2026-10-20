import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { menuService } from '../services/menuService.js';
import { useCart } from '../context/CartContext.jsx';
import MenuCategory from '../components/menu/MenuCategory.jsx';
import Loader from '../components/common/Loader.jsx';

export default function QRMenu() {
  const { token } = useParams();
  const nav = useNavigate();
  const { setContext, setOrderType, itemCount } = useCart();
  const [state, setState] = useState({ loading: true, error: null, table: null, menu: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const table = await menuService.resolveTable(token);
        const menu = await menuService.publicMenu(table.restaurant.id);
        if (cancelled) return;
        setContext({ restaurantId: table.restaurant.id, tableId: table.tableId, tableNumber: table.tableNumber });
        setOrderType('DINE_IN');
        setState({ loading: false, error: null, table, menu });
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, table: null, menu: null });
      }
    })();
    return () => { cancelled = true; };
  }, [token, setContext, setOrderType]);

  if (state.loading) return <Loader label="Loading menu…" />;
  if (state.error) return <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{state.error} · <Link to="/" className="underline">home</Link></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold">{state.table.restaurant.name}</h1><p className="text-sm text-slate-500">Table {state.table.tableNumber} · Dine-in</p></div>
        <button className="btn-success" onClick={() => nav('/cart')} disabled={itemCount === 0}>Cart ({itemCount})</button>
      </div>
      <MenuCategory menu={state.menu} />
    </div>
  );
}