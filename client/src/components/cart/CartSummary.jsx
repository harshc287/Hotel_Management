export default function CartSummary({ cart, subtotal, onCheckout }) {
  const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100;
  return (
    <div className="card-body">
      <h2 className="text-lg font-semibold">Summary</h2>
      <div className="mt-3 space-y-1.5 text-sm text-slate-700">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Est. tax</span><span>₹{estimatedTax.toFixed(2)}</span></div>
        <div className="border-t border-slate-100 pt-1.5 flex justify-between font-semibold">
          <span>Est. total</span><span>₹{(subtotal + estimatedTax).toFixed(2)}</span>
        </div>
      </div>
      <button className="btn-primary mt-4 w-full" onClick={onCheckout}>Proceed to checkout</button>
    </div>
  );
}