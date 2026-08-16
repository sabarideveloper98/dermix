import mongoose from 'mongoose';

const refundSettingsSchema = new mongoose.Schema(
  {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    refundChargeType: {
      type: String,
      enum: ['Percentage', 'Fixed Amount'],
      default: 'Percentage',
    },
    refundChargeValue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const RefundSettings = mongoose.model('RefundSettings', refundSettingsSchema);
export default RefundSettings;
