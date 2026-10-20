import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: '' },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    phone: { type: String, trim: true, default: '' },
    taxPercent: { type: Number, default: 5, min: 0, max: 30 },
    serviceChargePercent: { type: Number, default: 0, min: 0, max: 20 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);