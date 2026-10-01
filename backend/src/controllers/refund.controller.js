import Order from '../models/Order.js';
import Refund from '../models/Refund.js';
import RefundSettings from '../models/RefundSettings.js';
import { uploadBuffer } from '../utils/cloudinary.js';
import { sendEmail } from '../utils/email.js';

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
    res.status(500).json({ success: false, message: 'Server error processing refund request', error: error.message });
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
      .populate('orderId', 'orderNumber totalPrice createdAt products paymentMethod transactionId')
      .populate('productId', 'name images price')
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
      .populate('orderId', 'orderNumber totalPrice createdAt products paymentMethod transactionId')
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

    const order = await Order.findById(refund.orderId?._id);
    if (!order) return res.status(404).json({ success: false, message: 'Associated order not found' });

    // Validation Checks
    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'Refunds can only be processed for paid/captured orders.' });
    }

    if (order.refundStatus === 'Refunded' || refund.status === 'Refunded') {
      return res.status(400).json({ success: false, message: 'Refund has already been processed.' });
    }

    if (!order.transactionId) {
      return res.status(400).json({ success: false, message: 'No payment transaction ID found for this order.' });
    }

    const orderAmount = order.totalPrice || 0;
    if (orderAmount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Refund cannot be processed because the order amount is less than the refund charge.'
      });
    }

    const refundCharge = 50;
    const refundAmount = Math.max(0, orderAmount - refundCharge);

    refund.status = status;
    if (adminNotes !== undefined) refund.adminNotes = adminNotes;

    // Trigger Razorpay Refund for Approved / Refunded statuses
    if (status === 'Approved' || status === 'Refunded') {
      console.log(`[Razorpay Refund Request] PaymentID: ${order.transactionId}, OrderID: ${order._id}, Amount: ₹${refundAmount}`);

      let razorpayRefund;
      try {
        razorpayRefund = await razorpay.payments.refund(order.transactionId, {
          amount: Math.round(refundAmount * 100),
          notes: {
            orderId: order._id.toString(),
            refundCharge: 50
          }
        });
        console.log('[Razorpay Refund Success] Response:', razorpayRefund);
      } catch (rpErr) {
        console.error('[Razorpay Refund Error] Response:', rpErr);
        return res.status(500).json({ success: false, message: 'Razorpay refund failed', error: rpErr.message });
      }

      // Update Order fields
      order.refundStatus = "Refunded";
      order.refundAmount = refundAmount;
      order.refundCharge = refundCharge;
      order.refundDate = new Date();
      order.refundId = razorpayRefund.id;
      order.razorpayRefundId = razorpayRefund.id;
      order.refundCreatedAt = razorpayRefund.created_at ? new Date(razorpayRefund.created_at * 1000) : new Date();
      await order.save();

      // Update Refund fields
      refund.status = 'Refunded';
      refund.refundAmount = refundAmount;
      refund.refundChargeType = 'Fixed Amount';
      refund.refundChargeValue = refundCharge;
      refund.refundId = razorpayRefund.id;
      refund.approvedAt = new Date();
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

export const processRazorpayRefund = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'Refunds can only be processed for paid orders.' });
    }

    if (order.refundStatus === 'Refunded') {
      return res.status(400).json({ success: false, message: 'This order has already been refunded.' });
    }

    const orderAmount = order.totalPrice || 0;
    if (orderAmount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Refund cannot be processed because the order amount is less than the refund charge.'
      });
    }

    const refundCharge = 50;
    const refundAmount = Math.max(0, orderAmount - refundCharge);

    if (!order.transactionId) {
      return res.status(400).json({ success: false, message: 'No payment transaction ID found for this order.' });
    }

    let razorpayRefundId = `rfd_mock_${Date.now()}`;
    try {
      const razorpayRefund = await razorpay.payments.refund(order.transactionId, {
        amount: Math.round(refundAmount * 100),
        notes: {
          orderId: order._id.toString(),
          refundCharge: 50
        }
      });
      razorpayRefundId = razorpayRefund.id;
    } catch (rpErr) {
      console.error("Razorpay refund API call failed:", rpErr);
      return res.status(500).json({ success: false, message: 'Razorpay refund failed', error: rpErr.message });
    }

    order.refundStatus = "Refunded";
    order.refundAmount = refundAmount;
    order.refundCharge = refundCharge;
    order.refundDate = new Date();
    order.refundId = razorpayRefundId;
    await order.save();

    const refundDoc = await Refund.findOne({ orderId: order._id });
    if (refundDoc) {
      refundDoc.status = 'Refunded';
      refundDoc.refundAmount = refundAmount;
      refundDoc.refundChargeType = 'Fixed Amount';
      refundDoc.refundChargeValue = refundCharge;
      refundDoc.approvedAt = new Date();
      refundDoc.refundedAt = new Date();
      await refundDoc.save();
    }

    if (order.userId?.email) {
      try {
        await sendEmail({
          email: order.userId.email,
          subject: 'Refund Processed Successfully - Dermix',
          message: `Your refund has been processed successfully.

Order Amount: ₹${orderAmount.toFixed(2)}
Refund Charge: ₹${refundCharge.toFixed(2)}
Refund Amount Credited: ₹${refundAmount.toFixed(2)}

The refund will appear in your account according to your bank/payment provider processing time.`,
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #9333ea;">Refund Processed Successfully</h2>
            <p>Dear ${order.userId.name || 'Customer'},</p>
            <p>Your refund has been processed successfully for order <strong>${order.orderNumber}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Order Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${orderAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Refund Charge:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${refundCharge.toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold; color: #9333ea;">
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Refund Amount Credited:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${refundAmount.toFixed(2)}</td>
              </tr>
            </table>
            <p>The refund will appear in your account according to your bank/payment provider's standard processing time.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Dermix Support Team</strong></p>
          </div>`
        });
      } catch (mailErr) {
        console.error("Failed to send customer refund email:", mailErr);
      }
    }

    console.log(`[Admin Notification] Refund processed successfully. Order ID: ${order.orderNumber}, Refund Amount: ₹${refundAmount.toFixed(2)}, Refund ID: ${razorpayRefundId}`);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      order: {
        refundStatus: order.refundStatus,
        refundAmount: order.refundAmount,
        refundCharge: order.refundCharge,
        refundDate: order.refundDate,
        refundId: order.refundId
      }
    });

  } catch (err) {
    console.error('Error processing refund:', err);
    res.status(500).json({ success: false, message: 'Server error processing refund' });
  }
};
