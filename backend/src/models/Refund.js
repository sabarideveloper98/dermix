import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    refund_id: {
      type: String,
      required: true,
      unique: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payment_id: {
      type: String,
      required: true,
    },
    refund_amount: {
      type: Number,
      required: true,
    },
    refund_charge: {
      type: Number,
      default: 0,
    },
    refund_reason: {
      type: String,
    },
    refund_status: {
      type: String,
      enum: ['Pending', 'Processing', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    refund_reference: {
      type: String,
    },
    admin_notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Refund = mongoose.model('Refund', refundSchema);
export default Refund;
