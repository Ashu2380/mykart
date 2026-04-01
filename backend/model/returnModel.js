import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  items: {
    type: Array,
    default: []
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Picked Up', 'Completed', 'Rejected'],
    default: 'Requested'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  pickupDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  returnLabel: {
    type: String // URL to return label
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Return = mongoose.model('Return', returnSchema);

export default Return;