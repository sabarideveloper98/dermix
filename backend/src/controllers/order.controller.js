import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';
import User from '../models/User.js';
import StockHistory from '../models/StockHistory.js';
import { getShiprocketTracking, createShiprocketOrder, getShippingRate } from '../services/shiprocket.service.js';
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

    let calculatedTotalPrice = 0;
    let paidShippingWeight = 0;

    // 3. Verify stock, prepare order products array, and calculate weight for shipping
    const orderProducts = [];
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

      if (product.isShippingPaid) {
        paidShippingWeight += 0.5 * item.quantity;
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

    // Add shipping cost if there are paid shipping items
    let shippingCost = 0;
    const address = await Address.findById(finalAddressId);
    if (paidShippingWeight > 0 && address && address.pincode) {
      // Calculate shipping cost as Prepaid (0) by default since the immediate next step is Razorpay checkout
      shippingCost = await getShippingRate(address.pincode, paidShippingWeight, 0);
    }

    // `req.user` check uses the total from the frontend if authenticated, but we should always add shipping cost.
    // In our robust backend, we should use our calculated total. Let's use calculated total + shipping.
    const finalTotalPrice = calculatedTotalPrice + shippingCost;

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

    // 5.5 Push Order to Shiprocket as COD
    try {
      const address = await Address.findById(finalAddressId);
      const currentUser = await User.findById(userId) || req.user;

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
        billing_customer_name: address.firstName || currentUser?.name?.split(' ')[0] || "Customer",
        billing_last_name: address.lastName || (currentUser?.name?.split(' ')[1] || ''),
        billing_address: address.street1,
        billing_address_2: address.street2 || "",
        billing_city: address.district,
        billing_pincode: address.pincode,
        billing_state: address.state,
        billing_country: "India",
        billing_email: currentUser?.email || "customer@example.com",
        billing_phone: currentUser?.mobile || "9999999999",
        shipping_is_billing: true,
        order_items: resolvedItems,
        payment_method: "COD",
        sub_total: finalTotalPrice,
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
      console.error("Failed to push COD order to Shiprocket:", srError);
    }

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

// Get Shiprocket Tracking
export const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order tracking' });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(200).json({ success: true, tracking: null, message: 'No Shiprocket shipment found for this order' });
    }

    const trackingData = await getShiprocketTracking(order.shiprocketShipmentId);
    res.status(200).json({ success: true, tracking: trackingData });
  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tracking data' });
  }
};

// Calculate Shipping Rate
export const calculateShippingRate = async (req, res) => {
  try {
    const { pincode, products } = req.body;
    if (!pincode) return res.status(400).json({ success: false, message: 'Pincode is required' });

    let paidShippingWeight = 0;
    
    // Calculate total weight of paid-shipping products
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product && product.isShippingPaid) {
        paidShippingWeight += 0.5 * (item.quantity || 1); // 0.5kg per item
      }
    }

    if (paidShippingWeight === 0) {
      return res.status(200).json({ success: true, shippingRate: 0 });
    }

    const rate = await getShippingRate(pincode, paidShippingWeight, 0); // 0 for Prepaid estimation
    res.status(200).json({ success: true, shippingRate: rate });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(500).json({ success: false, message: 'Server error calculating shipping' });
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
