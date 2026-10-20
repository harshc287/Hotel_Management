import mongoose from 'mongoose';

const locationUpdateSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['customer', 'delivery'], required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number, default: null },
    recordedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

locationUpdateSchema.index({ order: 1, recordedAt: -1 });

export const LocationUpdate = mongoose.model('LocationUpdate', locationUpdateSchema);