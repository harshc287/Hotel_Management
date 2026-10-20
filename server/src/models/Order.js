
// import mongoose from 'mongoose';
// const item = new mongoose.Schema({
//   menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
//   name: { type: String, required: true },
//   unitPrice: { type: Number, required: true, min: 0 },
//   quantity: { type: Number, required: true, min: 1, max: 50 },
//   notes: { type: String, maxlength: 500, default: '' },
//   lineTotal: { type: Number, required: true }
// }, { _id: false });
// const history = new mongoose.Schema({ status: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }, { _id: false });
// const schema = new mongoose.Schema({
//   orderNumber: { type: String, required: true, unique: true, index: true },
//   restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
//   customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
//   customerName: { type: String, required: true },
//   orderType: { type: String, enum: ['DINE_IN','DELIVERY'], required: true },
//   tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
//   deliveryAddress: { type: String, default: '' },
//   items: [item],
//   subtotal: { type: Number, required: true },
//   tax: { type: Number, required: true },
//   deliveryFee: { type: Number, default: 0 },
//   total: { type: Number, required: true },
//   status: { type: String, enum: ['PENDING_PAYMENT','PAID','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','SERVED','DELIVERED','COMPLETED','CANCELLED'], default: 'PENDING_PAYMENT', index: true },
//   paymentStatus: { type: String, enum: ['PENDING','PAID','FAILED','REFUND_PENDING','REFUNDED'], default: 'PENDING', index: true },
//   paymentMethod: { type: String, default: 'online' },
//   statusHistory: [history]
// }, { timestamps: true });
// schema.index({ restaurantId: 1, createdAt: -1 });
// export default mongoose.model('Order', schema);
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    modifiers: [{ name: String, priceDelta: Number }],
    lineTotal: { type: Number, required: true, min: 0 },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const ORDER_STATUS = [
  'PENDING_PAYMENT',
  'PAYMENT_FAILED',
  'PAID',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'SERVED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REFUND_PENDING',
  'REFUNDED',
];

const PAYMENT_STATUS = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    orderType: { type: String, enum: ['DINE_IN', 'DELIVERY'], required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    deliveryAddress: { type: String, default: '' },
    deliveryLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxPercent: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    serviceChargePercent: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUS, default: 'PENDING_PAYMENT', index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'PENDING', index: true },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        note: String,
      },
    ],
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    specialInstructions: { type: String, default: '' },
    cancelledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.statics.ORDER_STATUS = ORDER_STATUS;
orderSchema.statics.PAYMENT_STATUS = PAYMENT_STATUS;

// Allowed state transitions (server-side authority)
const TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  PAID: ['CONFIRMED', 'CANCELLED', 'REFUND_PENDING'],
  CONFIRMED: ['PREPARING', 'CANCELLED', 'REFUND_PENDING'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  SERVED: ['COMPLETED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: [],
};

orderSchema.statics.canTransition = (from, to) => {
  return (TRANSITIONS[from] || []).includes(to);
};

orderSchema.methods.applyStatus = function (next, byUserId = null, note = '') {
  if (!this.constructor.canTransition(this.status, next)) {
    throw new Error(`Illegal transition ${this.status} → ${next}`);
  }
  this.status = next;
  this.statusHistory.push({ status: next, by: byUserId, note, at: new Date() });
  if (next === 'COMPLETED' || next === 'DELIVERED') this.completedAt = new Date();
  if (next === 'CANCELLED') this.cancelledAt = new Date();
};

export const Order = mongoose.model('Order', orderSchema);