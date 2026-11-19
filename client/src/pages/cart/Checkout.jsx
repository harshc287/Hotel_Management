import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { orderService } from '../../services/orderService.js';
import { paymentService } from '../../services/paymentService.js';

export default function Checkout() {
  const { cart, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ customerName: user?.name || '', customerPhone: user?.phone || '', deliveryAddress: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault(); if (!cart.items.length) return setError('Cart is empty');
    setBusy(true); setError('');
    try {
      const order = await orderService.create({
        ...form, restaurantId: cart.restaurantId, tableId: cart.tableId, orderType: cart.orderType,
        items: cart.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, modifierNames: i.modifierNames, notes: i.notes })),
      });
      const rzpData = await paymentService.createOrder(order._id);
      const options = {
        key: rzpData.keyId, amount: rzpData.amount, currency: rzpData.currency, name: 'RMS',
        description: `Order ${order.orderNumber}`, order_id: rzpData.razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentService.verify({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature });
            clear(); nav(`/track/${order._id}`);
          } catch (err) { setError('Verification failed: ' + err.message); setBusy(false); }
        },
        prefill: { name: form.customerName, contact: form.customerPhone }, theme: { color: '#2563eb' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => { setError(resp.error.description); setBusy(false); });
      rzp.open();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <form onSubmit={handleCheckout} className="card">
        <div className="card-body space-y-4">
          <div><label className="label">Name</label><input required className="input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></div>
          <div><label className="label">Phone</label><input required className="input" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} /></div>
          {cart.orderType === 'DELIVERY' && <div><label className="label">Address</label><textarea required className="input" rows="2" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} /></div>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Processing…' : `Pay ₹${cart.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)}`}</button>
        </div>
      </form>
    </div>
  );
}