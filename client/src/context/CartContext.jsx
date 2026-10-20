import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'rms_cart_v1';
const DEFAULT = { restaurantId: null, tableId: null, tableNumber: null, orderType: 'DINE_IN', items: [] };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return DEFAULT; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(cart)); }, [cart]);

  const setContext = ({ restaurantId, tableId, tableNumber }) => setCart((c) => ({ ...c, restaurantId, tableId, tableNumber }));
  const setOrderType = (orderType) => setCart((c) => ({ ...c, orderType }));

  const addItem = (menuItem, quantity = 1, modifierNames = [], notes = '') =>
    setCart((c) => {
      const key = `${menuItem._id}|${modifierNames.slice().sort().join(',')}|${notes}`;
      const found = c.items.find((i) => i.key === key);
      if (found) return { ...c, items: c.items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i)) };
      
      const unitPrice = menuItem.price + modifierNames.reduce((s, n) => s + (menuItem.modifiers?.find((m) => m.name === n)?.priceDelta || 0), 0);
      return { ...c, items: [...c.items, { key, menuItemId: menuItem._id, name: menuItem.name, unitPrice, quantity, modifierNames, notes }] };
    });

  const updateQty = (key, qty) => setCart((c) => ({ ...c, items: c.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, qty) } : i)) }));
  const removeItem = (key) => setCart((c) => ({ ...c, items: c.items.filter((i) => i.key !== key) }));
  const clear = () => setCart((c) => ({ ...c, items: [] }));

  const itemCount = useMemo(() => cart.items.reduce((s, i) => s + i.quantity, 0), [cart.items]);
  const subtotal = useMemo(() => cart.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), [cart.items]);

  return (
    <CartContext.Provider value={{ cart, setContext, setOrderType, addItem, updateQty, removeItem, clear, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}