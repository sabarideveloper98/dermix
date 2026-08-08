import mongoose from 'mongoose';

const refundSettingsSchema = new mongoose.Schema(
  {
    defaultPercentage: {
      type: Number,
      default: 100, // 100%
    },
    fixedDeduction: {
      type: Number,
      default: 0,
    },
    processingFee: {
      type: Number,
      default: 50,
    },
    fullRefundEnabled: {
      type: Boolean,
      default: true,
    },
    partialRefundEnabled: {
      type: Boolean,
      default: true,
    },
    autoRefundEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const RefundSettings = mongoose.model('RefundSettings', refundSettingsSchema);
export default RefundSettings;
