import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper to recalculate cart total amount
const recalculateCart = async (cart) => {
  let totalAmount = 0;
  
  // Populate products to get fresh price
  await cart.populate({
    path: 'items.productId',
    populate: {
      path: 'sizes.size'
    }
  });

  // Filter out any items where the product was deleted
  cart.items = cart.items.filter(item => item.productId !== null);

  for (const item of cart.items) {
    let itemPrice = item.productId.salePrice;
    
    if (item.productId.sizes && item.productId.sizes.length > 0) {
      // Find matching size by name
      const matchedSize = item.productId.sizes.find(s => s.size && s.size.name === item.size);
      if (matchedSize && matchedSize.salePrice) {
        itemPrice = matchedSize.salePrice;
      }
    }
    
    totalAmount += itemPrice * item.quantity;
  }

  cart.totalAmount = totalAmount;
  await cart.save();
  return cart;
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [], totalAmount: 0 });
    } else {
      await cart.populate({
        path: 'items.productId',
        populate: {
          path: 'sizes.size'
        }
      });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching cart' });
  }
};

// Add to Cart
export const addToCart = async (req, res) => {
  const { productId, quantity, size = 'Standard' } = req.body;
  const qtyToAdd = Number(quantity) || 1;

  try {
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found or inactive' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [], totalAmount: 0 });
    }

    // Check if item already in cart with same size
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (existingIndex > -1) {
      // Check stock limits
      const newQty = cart.items[existingIndex].quantity + qtyToAdd;
      if (product.qty < newQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${product.qty} left in stock.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      // Check stock limits
      if (product.qty < qtyToAdd) {
        return res.status(400).json({
          success: false,
          message: `Cannot add items. Only ${product.qty} left in stock.`,
        });
      }
      cart.items.push({ productId, quantity: qtyToAdd, size });
    }

    cart = await recalculateCart(cart);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error adding to cart' });
  }
};

// Update Cart Item Quantity
export const updateCartItem = async (req, res) => {
  const { productId, quantity, size = 'Standard' } = req.body;
  const newQty = Number(quantity);

  if (newQty < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.qty < newQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.qty} items left in stock.`,
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = newQty;
    cart = await recalculateCart(cart);

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error updating cart' });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  const { productId, size = 'Standard' } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => !(item.productId.toString() === productId && item.size === size)
    );

    cart = await recalculateCart(cart);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error removing item from cart' });
  }
};
