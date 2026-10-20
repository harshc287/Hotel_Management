// Server-authoritative pricing. Never trust client-submitted amounts.
export function calculateOrderTotal({ items, restaurant, orderType, menuById, discount = 0 }) {
  let subtotal = 0;
  const snapshot = [];

  for (const line of items) {
    const menuItem = menuById[String(line.menuItemId)];
    if (!menuItem || !menuItem.isAvailable) {
      throw Object.assign(new Error(`Item unavailable: ${line.menuItemId}`), { status: 400 });
    }
    const mods = (line.modifierNames || []).map((n) => {
      const found = menuItem.modifiers.find((m) => m.name === n);
      if (!found) throw Object.assign(new Error(`Unknown modifier: ${n}`), { status: 400 });
      return { name: found.name, priceDelta: found.priceDelta };
    });
    const modifierDelta = mods.reduce((s, m) => s + m.priceDelta, 0);
    const unitPrice = menuItem.price + modifierDelta;
    const lineTotal = unitPrice * line.quantity;
    subtotal += lineTotal;
    snapshot.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      unitPrice,
      quantity: line.quantity,
      modifiers: mods,
      lineTotal,
      notes: line.notes || '',
    });
  }

  const taxPercent = Number(restaurant.taxPercent) || 0;
  const taxAmount = round2((subtotal * taxPercent) / 100);
  const serviceChargePercent =
    orderType === 'DINE_IN' ? Number(restaurant.serviceChargePercent) || 0 : 0;
  const serviceCharge = round2((subtotal * serviceChargePercent) / 100);
  const deliveryFee = orderType === 'DELIVERY' ? Number(restaurant.deliveryFee) || 0 : 0;
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);

  const total = round2(subtotal + taxAmount + serviceCharge + deliveryFee - safeDiscount);

  return {
    items: snapshot,
    subtotal: round2(subtotal),
    taxPercent,
    taxAmount,
    serviceChargePercent,
    serviceCharge,
    deliveryFee,
    discount: safeDiscount,
    total,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}