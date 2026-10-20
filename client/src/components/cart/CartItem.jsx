export default function CartItem({ item, onChangeQty, onRemove }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.name}</span>
        </div>
        {item.notes && <div className="mt-0.5 text-xs text-slate-500 italic">“{item.notes}”</div>}
        <div className="mt-1 text-sm text-slate-600">₹{item.unitPrice} each</div>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" min={1} value={item.quantity} onChange={(e) => onChangeQty(Math.max(1, parseInt(e.target.value || '1', 10)))} className="input w-16 text-center" />
        <span className="w-20 text-right font-medium">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
        <button className="btn-ghost btn-sm text-rose-600" onClick={onRemove} aria-label="Remove">✕</button>
      </div>
    </div>
  );
}