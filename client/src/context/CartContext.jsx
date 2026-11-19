
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

const CartContext = createContext(null);

const KEY = 'rms_cart_v1';

const DEFAULT = {
  restaurantId: null,
  tableId: null,
  tableNumber: null,
  orderType: 'DINE_IN',
  items: [],
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return {
        ...DEFAULT,
        ...JSON.parse(localStorage.getItem(KEY) || '{}'),
      };
    } catch {
      return DEFAULT;
    }
  });

  // Persist cart whenever it changes.
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart]);

  // Update restaurant and table context.
  const setContext = useCallback(
    ({ restaurantId, tableId = null, tableNumber = null }) => {
      setCart((current) => {
        if (
          current.restaurantId === restaurantId &&
          current.tableId === tableId &&
          current.tableNumber === tableNumber
        ) {
          return current;
        }

        return {
          ...current,
          restaurantId,
          tableId,
          tableNumber,
        };
      });
    },
    []
  );

  // Update order type.
  const setOrderType = useCallback((orderType) => {
    setCart((current) => {
      if (current.orderType === orderType) {
        return current;
      }

      return {
        ...current,
        orderType,
      };
    });
  }, []);

  // Add menu item to cart.
  const addItem = useCallback(
    (menuItem, quantity = 1, modifierNames = [], notes = '') => {
      setCart((current) => {
        const key = `${menuItem._id}|${modifierNames
          .slice()
          .sort()
          .join(',')}|${notes}`;

        const found = current.items.find((item) => item.key === key);

        if (found) {
          return {
            ...current,
            items: current.items.map((item) =>
              item.key === key
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          };
        }

        const unitPrice =
          menuItem.price +
          modifierNames.reduce(
            (sum, name) =>
              sum +
              (menuItem.modifiers?.find((modifier) => modifier.name === name)
                ?.priceDelta || 0),
            0
          );

        return {
          ...current,
          items: [
            ...current.items,
            {
              key,
              menuItemId: menuItem._id,
              name: menuItem.name,
              unitPrice,
              quantity,
              modifierNames,
              notes,
            },
          ],
        };
      });
    },
    []
  );

  // Update item quantity.
  const updateQty = useCallback((key, quantity) => {
    setCart((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ),
    }));
  }, []);

  // Remove item.
  const removeItem = useCallback((key) => {
    setCart((current) => ({
      ...current,
      items: current.items.filter((item) => item.key !== key),
    }));
  }, []);

  // Clear cart items.
  const clear = useCallback(() => {
    setCart((current) => {
      if (current.items.length === 0) return current;

      return {
        ...current,
        items: [],
      };
    });
  }, []);

  // Derived cart values.
  const itemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  const subtotal = useMemo(
    () =>
      cart.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    [cart.items]
  );

  // Keep provider value stable between renders.
  const value = useMemo(
    () => ({
      cart,
      setContext,
      setOrderType,
      addItem,
      updateQty,
      removeItem,
      clear,
      itemCount,
      subtotal,
    }),
    [
      cart,
      setContext,
      setOrderType,
      addItem,
      updateQty,
      removeItem,
      clear,
      itemCount,
      subtotal,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
