import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Place Order
export const createOrder = async (req, res) => {
  try {
    let userId;
    let finalAddressId;
    let cartItems = [];
    let totalPrice = 0;

    if (req.user) {
      userId = req.user._id;
      const { addressId } = req.body;

      // 1. Fetch user's cart
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Your cart is empty' });
      }
      cartItems = cart.items;
      totalPrice = cart.totalAmount;
      finalAddressId = addressId;

      // 2. Validate address
      const address = await Address.findById(finalAddressId);
      if (!address || address.userId.toString() !== userId.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid shipping address' });
      }
    } else {
      // Guest Checkout flow
      const { name, email, mobile, street1, street2, district, state, pincode, landmark, items } = req.body;
      
      if (!name || !email || !mobile) {
        return res.status(400).json({ success: false, message: 'Customer details (Name, Email, Mobile) are required for checkout' });
      }
      if (!street1 || !district || !state || !pincode) {
        return res.status(400).json({ success: false, message: 'Shipping address fields are required' });
      }
      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Your cart is empty' });
      }

      // Find or create customer account
      let guestUser = await User.findOne({ email });
      if (!guestUser) {
        guestUser = await User.create({
          name,
          email,
          mobile,
          password: Math.random().toString(36).slice(-8), // random default password
          role: 'customer',
          isVerified: true,
        });
      }
      userId = guestUser._id;

      // Create shipping address for user
      const newAddress = await Address.create({
        userId,
        street1,
        street2,
        district,
        state,
        pincode,
        landmark,
      });
      finalAddressId = newAddress._id;
      cartItems = items;
    }

    // 3. Verify stock availability for all items
    const orderProducts = [];
    let calculatedTotalPrice = 0;
    for (const item of cartItems) {
      const product = await Product.findById(item.productId).populate('sizes.size');
      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product ${product ? product.name : 'Unknown'} is no longer available.`,
        });
      }

      if (product.qty < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.qty} units available.`,
        });
      }

      let itemPrice = product.salePrice;
      if (product.sizes && product.sizes.length > 0) {
        const matchedSize = product.sizes.find(s => s.size && s.size.name === item.size);
        if (matchedSize && matchedSize.salePrice) {
          itemPrice = matchedSize.salePrice;
        }
      }

      orderProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        size: item.size,
      });
      calculatedTotalPrice += itemPrice * item.quantity;
    }

    const finalTotalPrice = req.user ? totalPrice : calculatedTotalPrice;

    // 4. Generate unique order number in format: DERMIX-YYYYMMDD-XXXX
    const now = new Date();
    const yyyymmdd = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DERMIX-${yyyymmdd}-${randomNum}`;

    // 5. Create the Order
    const order = await Order.create({
      orderNumber,
      userId,
      products: orderProducts,
      addressId: finalAddressId,
      totalPrice: finalTotalPrice,
      paymentStatus: 'Pending',
      deliveryStatus: 'Pending',
    });

    // 6. Clear user's cart in database
    const existingCart = await Cart.findOne({ userId });
    if (existingCart) {
      existingCart.items = [];
      existingCart.totalAmount = 0;
      await existingCart.save();
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error placing order' });
  }
};

// Get User Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.productId')
      .populate('addressId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your orders' });
  }
};

// Get Single Order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId')
      .populate('addressId')
      .populate('userId', 'name email mobile');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Auth check: user owns order OR user is admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching order details' });
  }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  const { deliveryStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
};

// Track Order
export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { orderNumber: id };
    }

    const order = await Order.findOne(query)
      .populate('products.productId')
      .populate('addressId')
      .populate('userId', 'name email mobile');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Server error tracking order' });
  }
};
