import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['Damaged Product', 'Wrong Product', 'Missing Item', 'Quality Issue', 'Other'],
    },
    comments: {
      type: String,
    },
    images: [
      {
        type: String, // URLs from cloudinary
      },
    ],
    refundChargeType: {
      type: String,
      enum: ['Percentage', 'Fixed Amount'],
    },
    refundChargeValue: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number, // Final refund amount after deduction
    },
    status: {
      type: String,
      enum: ['Requested', 'Under Review', 'Approved', 'Refund Processing', 'Refunded', 'Rejected'],
      default: 'Requested',
    },
    adminNotes: {
      type: String,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Refund = mongoose.model('Refund', refundSchema);
export default Refund;
