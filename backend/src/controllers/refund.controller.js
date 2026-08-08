import Order from '../models/Order.js';
import Refund from '../models/Refund.js';
import RefundSettings from '../models/RefundSettings.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  try {
    const order = await Order.findById(id).populate('userId', 'email name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (['Delivered', 'Cancelled'].includes(order.deliveryStatus)) {
      return res.status(400).json({ success: false, message: `Order cannot be cancelled because it is ${order.deliveryStatus}` });
    }

    order.deliveryStatus = 'Cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by admin';
    await order.save();

    // Send email notification
    if (order.userId && order.userId.email) {
      await sendEmail({
        email: order.userId.email,
        subject: `Order Cancelled - ${order.orderNumber}`,
        message: `Your order ${order.orderNumber} has been cancelled.\nReason: ${order.cancellationReason}`,
      });
    }

    res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const processRefund = async (req, res) => {
  const { orderId, refundAmount, refundCharge, refundReason, adminNotes } = req.body;

  try {
    const order = await Order.findById(orderId).populate('userId', 'email name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!order.transactionId) {
      return res.status(400).json({ success: false, message: 'Order does not have a valid payment transaction ID' });
    }

    if (order.refundStatus === 'Refunded' || order.refundStatus === 'Processing') {
      return res.status(400).json({ success: false, message: `Refund is already ${order.refundStatus}` });
    }

    // Call Razorpay API
    const refundOptions = {
      amount: Math.round(refundAmount * 100), // convert to paise
      speed: 'normal',
      notes: {
        reason: refundReason || 'Requested by admin',
        admin_notes: adminNotes || '',
      }
    };

    let razorpayRefund;
    try {
      razorpayRefund = await razorpay.payments.refund(order.transactionId, refundOptions);
    } catch (rpErr) {
      console.error('Razorpay refund error:', rpErr);
      return res.status(400).json({ success: false, message: 'Razorpay refund failed', details: rpErr });
    }

    // Create Refund record
    const refundRecord = await Refund.create({
      refund_id: `RFD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_id: order._id,
      user_id: order.userId._id,
      payment_id: order.transactionId,
      refund_amount: refundAmount,
      refund_charge: refundCharge || 0,
      refund_reason: refundReason,
      refund_status: 'Completed', // Assuming synchronous success for now
      refund_reference: razorpayRefund.id,
      admin_notes: adminNotes,
    });

    // Update order
    order.refundStatus = 'Refunded';
    order.refundAmount = (order.refundAmount || 0) + refundAmount;
    await order.save();

    // Send email to customer
    if (order.userId && order.userId.email) {
      await sendEmail({
        email: order.userId.email,
        subject: `Refund Processed - ${order.orderNumber}`,
        message: `We have processed a refund of ₹${refundAmount} for your order ${order.orderNumber}.\nReason: ${refundReason}\nRefund Reference ID: ${razorpayRefund.id}`,
      });
    }

    res.status(200).json({ success: true, message: 'Refund processed successfully', refund: refundRecord, order });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, message: 'Server error processing refund' });
  }
};

export const getRefundStats = async (req, res) => {
  try {
    const totalRefundsCount = await Refund.countDocuments();
    
    const statsAgg = await Refund.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$refund_amount' },
        }
      }
    ]);
    const totalRefundedAmount = statsAgg.length > 0 ? statsAgg[0].totalAmount : 0;
    
    const pendingRefunds = await Refund.countDocuments({ refund_status: 'Pending' });
    const failedRefunds = await Refund.countDocuments({ refund_status: 'Failed' });

    res.status(200).json({ 
      success: true, 
      stats: {
        totalRefunds: totalRefundsCount,
        totalRefundedAmount,
        pendingRefunds,
        failedRefunds
      }
    });
  } catch (error) {
    console.error('Error fetching refund stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find().populate('order_id', 'orderNumber').populate('user_id', 'name email').sort({ created_at: -1 });
    res.status(200).json({ success: true, refunds });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
