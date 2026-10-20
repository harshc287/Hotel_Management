import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    type: { type: String, enum: ['WAITER_CALL', 'BILL_REQUEST', 'OTHER'], required: true },
    note: { type: String, default: '' },
    status: { type: String, enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'], default: 'OPEN', index: true },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);