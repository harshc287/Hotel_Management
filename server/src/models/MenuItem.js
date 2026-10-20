import mongoose from 'mongoose';

const modifierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    priceDelta: { type: Number, default: 0 },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    isVeg: { type: Boolean, default: true },
    dietaryLabels: [{ type: String }],
    modifiers: [modifierSchema],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurant: 1, category: 1, name: 1 }, { unique: true });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);