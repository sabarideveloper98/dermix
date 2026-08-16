import Order from '../models/Order.js';
import Refund from '../models/Refund.js';
import RefundSettings from '../models/RefundSettings.js';
import { uploadBuffer } from '../utils/cloudinary.js';

// --- Customer APIs ---

export const requestRefund = async (req, res) => {
  const { orderId, productId, reason, comments } = req.body;
  const customerId = req.user._id;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Validate if the product is in the order
    const orderProduct = order.products.find(p => p.productId.toString() === productId);
    if (!orderProduct) return res.status(400).json({ success: false, message: 'Product not found in this order' });

    // Check if a refund already exists for this product in this order
    const existingRefund = await Refund.findOne({ orderId, productId, customerId });
    if (existingRefund) {
      return res.status(400).json({ success: false, message: 'Refund already requested for this product' });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBuffer(file.buffer, 'dermix/refunds');
        images.push(result.secure_url);
      }
    }

    const refund = await Refund.create({
      orderId,
      customerId,
      productId,
      reason,
      comments,
      images,
      status: 'Requested',
    });

    res.status(201).json({ success: true, message: 'Refund request submitted successfully', refund });
  } catch (error) {
    console.error('Error submitting refund request:', error);
    res.status(500).json({ success: false, message: 'Server error processing refund request' });
  }
};

export const getMyRefundRequests = async (req, res) => {
  const customerId = req.user._id;
  try {
    const refunds = await Refund.find({ customerId })
      .populate('orderId', 'orderNumber totalPrice')
      .populate('productId', 'name images')
      .sort({ requestedAt: -1 });
    res.status(200).json({ success: true, refunds });
  } catch (error) {
    console.error('Error fetching my refunds:', error);
    res.status(500).json({ success: false, message: 'Server error fetching refunds' });
  }
};

// --- Admin APIs ---

export const getAdminRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate('customerId', 'name email phone')
      .populate('orderId', 'orderNumber totalPrice createdAt')
      .populate('productId', 'name images')
      .sort({ requestedAt: -1 });
    res.status(200).json({ success: true, refunds });
  } catch (error) {
    console.error('Error fetching admin refunds:', error);
    res.status(500).json({ success: false, message: 'Server error fetching refunds' });
  }
};

export const getRefundDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const refund = await Refund.findById(id)
      .populate('customerId', 'name email phone')
      .populate('orderId', 'orderNumber totalPrice createdAt')
      .populate('productId', 'name images price');
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });
    res.status(200).json({ success: true, refund });
  } catch (error) {
    console.error('Error fetching refund details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching refund details' });
  }
};

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const updateRefundStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  try {
    const refund = await Refund.findById(id).populate('orderId').populate('productId');
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });

    if (refund.status === 'Refunded' && status !== 'Refunded') {
       return res.status(400).json({ success: false, message: 'Refund already processed' });
    }

    refund.status = status;
    if (adminNotes !== undefined) refund.adminNotes = adminNotes;
    
    if (status === 'Approved') {
      refund.approvedAt = new Date();
      // Calculate Refund Amount
      let settings = await RefundSettings.findOne();
      const productPriceInOrder = refund.orderId.products.find(p => p.productId.toString() === refund.productId._id.toString())?.price || 0;
      let finalRefund = productPriceInOrder;
      
      if (settings && settings.isEnabled) {
        refund.refundChargeType = settings.refundChargeType;
        refund.refundChargeValue = settings.refundChargeValue;
        if (settings.refundChargeType === 'Percentage') {
          finalRefund = productPriceInOrder - (productPriceInOrder * (settings.refundChargeValue / 100));
        } else if (settings.refundChargeType === 'Fixed Amount') {
          finalRefund = productPriceInOrder - settings.refundChargeValue;
        }
      }
      refund.refundAmount = finalRefund > 0 ? finalRefund : 0;

      // Initiate Razorpay Refund if online payment
      if (refund.orderId.paymentMethod === 'online' && refund.orderId.transactionId) {
        try {
          const razorpayRefund = await razorpay.payments.refund(refund.orderId.transactionId, {
            amount: Math.round(refund.refundAmount * 100),
            notes: {
              refund_id: refund._id.toString(),
              order_id: refund.orderId._id.toString()
            }
          });
          refund.status = 'Refunded';
          refund.refundedAt = new Date();
        } catch (rpErr) {
          console.error("Razorpay refund failed:", rpErr);
          return res.status(500).json({ success: false, message: 'Razorpay refund failed', error: rpErr.message });
        }
      }
    } else if (status === 'Refunded') {
      refund.refundedAt = new Date();
    }

    await refund.save();
    res.status(200).json({ success: true, message: 'Refund status updated', refund });
  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({ success: false, message: 'Server error updating refund status' });
  }
};

export const getRefundSettings = async (req, res) => {
  try {
    let settings = await RefundSettings.findOne();
    if (!settings) {
      settings = await RefundSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching refund settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateRefundSettings = async (req, res) => {
  try {
    let settings = await RefundSettings.findOne();
    if (!settings) {
      settings = new RefundSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error updating refund settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
