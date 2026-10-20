import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CartItem from '../components/cart/CartItem.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';

export default function Cart() {
  const nav = useNavigate();
  const { cart, updateQty, removeItem, subtotal, clear } = useCart();

  if (!cart.items.length) return <div className="card mx-auto max-w-md"><div className="card-body text-center"><h2 className="text-lg font-semibold">Your cart is empty</h2><p className="mt-1 text-sm text-slate-500">Add items from the menu.</p></div></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="card-body">
          <div className="flex justify-between"><h1 className="text-xl font-semibold">Your cart</h1><button className="btn-ghost btn-sm" onClick={clear}>Clear</button></div>
          <div className="mt-4 divide-y divide-slate-100">
            {cart.items.map((item) => <CartItem key={item.key} item={item} onChangeQty={(q) => updateQty(item.key, q)} onRemove={() => removeItem(item.key)} />)}
          </div>
        </div>
      </div>
      <div className="card h-fit"><CartSummary cart={cart} subtotal={subtotal} onCheckout={() => nav('/checkout')} /></div>
    </div>
  );
}