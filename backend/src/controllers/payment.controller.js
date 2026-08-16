import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email.js';
import { createShiprocketOrder, getShippingRate } from '../services/shiprocket.service.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  const { orderId, amount, items } = req.body;

  try {
    let finalAmount = 0;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      finalAmount = order.totalPrice;
    } else if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product && product.status === 'active') {
          finalAmount += product.salePrice * item.quantity;
        }
      }
    } else if (amount) {
      finalAmount = amount;
    } else {
      return res.status(400).json({ success: false, message: 'Order ID, items, or amount is required' });
    }

    // Amount in paise
    const options = {
      amount: Math.round(finalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Math.floor(100000 + Math.random() * 900000)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.status(200).json({ success: true, razorpayOrder });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay payment order' });
  }
};

// Verify Payment Signature
export const verifyPayment = async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    orderId,
    name,
    email,
    mobile,
    street1,
    street2,
    district,
    state,
    pincode,
    landmark,
    items,
    amount
  } = req.body;

  try {
    // 1. Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // 2. Resolve User profile
    let currentUser;
    let isNewUser = false;
    let rawPassword = '';

    // Check if token exists in header to decode logged-in user
    let tokenValue;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      tokenValue = req.headers.authorization.split(' ')[1];
    }
    
    if (tokenValue) {
      try {
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.id).select('-password');
      } catch (err) {
        console.error('JWT Decode Error in verifyPayment:', err.message);
      }
    }

    if (!currentUser) {
      let query = [];
      if (email) query.push({ email });
      if (mobile) query.push({ mobile });
      
      let existingUser;
      if (query.length > 0) {
        existingUser = await User.findOne({ $or: query });
      }

      if (existingUser) {
        currentUser = existingUser;
      } else {
        isNewUser = true;
        rawPassword = 'Dermix@' + Math.floor(10000 + Math.random() * 90000);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        
        currentUser = await User.create({
          name: name || 'Guest Customer',
          email,
          mobile,
          password: hashedPassword,
          role: 'customer',
          isVerified: true,
        });
      }
    }

    // 3. Generate auto-login JWT tokens
    const token = jwt.sign({ id: currentUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    const refreshToken = jwt.sign({ id: currentUser._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    // 4. Create address record for this order
    const address = await Address.create({
      userId: currentUser._id,
      street1: street1 || 'Street Address',
      street2,
      district: district || 'City',
      state: state || 'State',
      pincode: pincode || '000000',
      landmark,
    });

    // 5. Build order products list and verify live prices
    const orderProducts = [];
    let calculatedAmount = 0;
    let paidShippingWeight = 0;
    
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product) {
          orderProducts.push({
            productId: product._id,
            quantity: item.quantity,
            price: product.salePrice,
            size: item.size || 'Standard',
          });
          calculatedAmount += product.salePrice * item.quantity;
          
          if (product.isShippingPaid) {
            paidShippingWeight += 0.5 * item.quantity;
          }
        }
      }
    }

    let shippingCost = 0;
    if (paidShippingWeight > 0 && address && address.pincode) {
      shippingCost = await getShippingRate(address.pincode, paidShippingWeight, 0); // 0 for Prepaid
    }
    
    // Security check: calculate total internally
    const secureCalculatedTotal = calculatedAmount + shippingCost;

    // Use amount provided by frontend (which includes shipping) or fallback to calculated
    const finalAmount = amount || secureCalculatedTotal;

    // 6. Generate unique order number in format: DERMIX-YYYYMMDD-XXXX
    const now = new Date();
    const yyyymmdd = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DERMIX-${yyyymmdd}-${randomNum}`;

    // 7. Create database Order record
    const order = await Order.create({
      orderNumber,
      userId: currentUser._id,
      products: orderProducts,
      addressId: address._id,
      totalPrice: finalAmount,
      paymentStatus: 'Paid',
      deliveryStatus: 'Pending',
      transactionId: razorpay_payment_id,
    });

    // 8. Create database Payment record
    await Payment.create({
      orderId: order._id,
      paymentType: 'Razorpay',
      transactionId: razorpay_payment_id,
      amount: finalAmount,
      status: 'Success',
    });

    // 8.5 Push Order to Shiprocket
    try {
      const shiprocketItems = orderProducts.map(async (item) => {
        const prod = await Product.findById(item.productId);
        return {
          name: prod.name,
          sku: prod.sku || prod._id.toString().substring(0, 8),
          units: item.quantity,
          selling_price: item.price,
          discount: 0,
          tax: 0,
          hsn: 441122
        };
      });

      const resolvedItems = await Promise.all(shiprocketItems);

      const shiprocketPayload = {
        order_id: order.orderNumber,
        order_date: now.toISOString().split('T')[0],
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
        billing_customer_name: address.firstName || currentUser.name.split(' ')[0],
        billing_last_name: address.lastName || (currentUser.name.split(' ')[1] || ''),
        billing_address: address.street1,
        billing_address_2: address.street2 || "",
        billing_city: address.district,
        billing_pincode: address.pincode,
        billing_state: address.state,
        billing_country: "India",
        billing_email: currentUser.email,
        billing_phone: currentUser.mobile || "9999999999",
        shipping_is_billing: true,
        order_items: resolvedItems,
        payment_method: "Prepaid",
        sub_total: finalAmount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
      };

      const srResponse = await createShiprocketOrder(shiprocketPayload);
      if (srResponse && srResponse.order_id) {
        order.shiprocketOrderId = srResponse.order_id.toString();
        order.shiprocketShipmentId = srResponse.shipment_id ? srResponse.shipment_id.toString() : '';
        order.shiprocketAwbCode = srResponse.awb_code ? srResponse.awb_code.toString() : '';
        await order.save();
      }
    } catch (srError) {
      console.error("Failed to push order to Shiprocket:", srError);
      // We don't block the checkout flow if Shiprocket fails, just log it.
    }

    // 9. Update product stock levels and save StockHistory logs
    for (const item of orderProducts) {
      const product = await Product.findById(item.productId);
      if (product) {
        const previousQty = product.qty;
        product.qty = Math.max(0, product.qty - item.quantity);
        await product.save();

        await StockHistory.create({
          productId: product._id,
          previousQty,
          updatedQty: product.qty,
          reason: `Order Purchase #${order.orderNumber}`,
        });
      }
    }

    // 10. Clear user's cart in database
    const cart = await Cart.findOne({ userId: currentUser._id });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }

    // 11. Send Email Notifications
    try {
      const customerName = currentUser.name;
      const customerEmail = currentUser.email;
      const customerMobile = currentUser.mobile || 'N/A';

      if (customerEmail) {
        if (isNewUser) {
          await sendEmail({
            email: customerEmail,
            subject: 'Welcome to Dermix',
            message: `Hello ${customerName},

Your Dermix account has been created successfully.

Email:
${customerEmail}

Mobile:
${customerMobile}

Password:
${rawPassword}

You can login and track your orders anytime.

Thank you for shopping with Dermix.`,
          });
        }

        await sendEmail({
          email: customerEmail,
          subject: 'Dermix Order Confirmation',
          message: `Hello ${customerName},

Thank you for your order.

Order Number:
${order.orderNumber}

Order Amount:
₹${order.totalPrice.toFixed(2)}

Order Status:
Confirmed

You can track your order from your Dermix account.

Thank you for shopping with Dermix.`,
        });
      }
    } catch (emailErr) {
      console.error('Failed to send order/welcome email notifications:', emailErr);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Payment successfully processed and order placed', 
      order,
      token,
      refreshToken,
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        mobile: currentUser.mobile,
        role: currentUser.role
      }
    });
  } catch (error) {
    console.error('Verify payment signature error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

// Get Payments History (Admin)
export const getPaymentsHistory = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Get payments history error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payment history' });
  }
};
