import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    role: { type: String, enum: ['customer', 'delivery'], required: true },
    granted: { type: Boolean, default: false },
    grantedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

consentSchema.index({ order: 1, role: 1 }, { unique: true });

export const LocationConsent = mongoose.model('LocationConsent', consentSchema);