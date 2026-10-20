import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    provider: { type: String, default: 'razorpay' },
    razorpayOrderId: { type: String, index: true, default: null },
    razorpayPaymentId: { type: String, index: true, default: null },
    razorpaySignature: { type: String, default: null },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND'],
      default: 'CREATED',
      index: true,
    },
    method: { type: String, default: '' },
    webhookEvents: [{ eventId: String, eventType: String, receivedAt: Date }],
    refunds: [
      {
        refundId: String,
        amount: Number,
        status: String,
        at: Date,
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    failureReason: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });

export const Payment = mongoose.model('Payment', paymentSchema);