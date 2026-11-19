
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { menuService } from '../../services/menuSService.js';
import { useCart } from '../../context/CartContext.jsx';
import MenuCategory from '../../components/menu/MenuCategory.jsx';
import Loader from '../../components/common/Loader.jsx';

export default function Menu() {
  const navigate = useNavigate();

  const { setContext, setOrderType, itemCount } = useCart();

  const [state, setState] = useState({
    loading: true,
    error: null,
    menu: null,
  });

  const restaurantId = import.meta.env.VITE_DEFAULT_RESTAURANT_ID;

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      if (!restaurantId) {
        setState({
          loading: false,
          error: 'Restaurant is not configured. Please contact the restaurant.',
          menu: null,
        });
        return;
      }

      try {
        localStorage.setItem('rms_restaurant_id', restaurantId);

        setContext({
          restaurantId,
          tableId: null,
          tableNumber: null,
        });

        setOrderType('DELIVERY');

        const menu = await menuService.publicMenu(restaurantId);

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            menu,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error:
              error.response?.data?.message ||
              error.message ||
              'Unable to load menu.',
            menu: null,
          });
        }
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, setContext, setOrderType]);

  if (state.loading) {
    return <Loader label="Loading menu..." />;
  }

  if (state.error) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        {state.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Menu (Delivery)</h1>

        <button
          type="button"
          className="btn-success"
          onClick={() => navigate('/cart')}
          disabled={itemCount === 0}
        >
          Cart ({itemCount})
        </button>
      </div>

      <MenuCategory menu={state.menu} />
    </div>
  );
}
