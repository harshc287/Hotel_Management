import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
    type: { type: String, required: true },
    eventId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    targetRoles: [{ type: String }],
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    acknowledgedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

notificationSchema.index({ restaurant: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);