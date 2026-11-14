import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    default: 'Standard',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [orderItemSchema],
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    refundStatus: {
      type: String,
      enum: ['None', 'Pending', 'Processing', 'Refunded', 'Failed'],
      default: 'None',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundCharge: {
      type: Number,
      default: 0,
    },
    refundDate: {
      type: Date,
    },
    refundId: {
      type: String,
      default: '',
    },
    shiprocketOrderId: {
      type: String,
      default: '',
    },
    shiprocketCheckoutId: {
      type: String,
      default: '',
    },
    paymentReferenceId: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    paymentDate: {
      type: Date,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    shiprocketShipmentId: {
      type: String,
      default: '',
    },
    shiprocketAwbCode: {
      type: String,
      default: '',
    },
    shiprocketChannelOrderId: {
      type: String,
      default: '',
    },
    shiprocketStatus: {
      type: String,
      default: '',
    },
    shiprocketSyncStatus: {
      type: String,
      enum: ['PENDING', 'SYNCING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    shiprocketSyncedAt: {
      type: Date,
    },
    shiprocketSyncError: {
      type: String,
      default: '',
    },
    shiprocketResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    razorpay_order_id: {
      type: String,
      default: '',
    },
    razorpay_payment_id: {
      type: String,
      default: '',
    },
    razorpay_signature: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
