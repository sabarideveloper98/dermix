import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    previousQty: {
      type: Number,
      required: true,
    },
    updatedQty: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);
export default StockHistory;
