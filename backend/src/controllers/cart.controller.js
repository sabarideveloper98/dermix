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
    const prod = item.productId;
    if (!prod) continue;

    let itemPrice = Number(
      prod.salePrice ?? prod.sellingPrice ?? prod.price ?? prod.discountPrice ?? prod.finalPrice ?? prod.mrpPrice ?? 0
    );
    if (isNaN(itemPrice) || itemPrice < 0) itemPrice = 0;

    if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
      const normalizedSize = String(item.size || '').trim().toLowerCase();
      const matchedSize = prod.sizes.find(s => {
        if (!s) return false;
        const sizeName = s.size ? (s.size.name || s.size) : (s.name || s._id);
        const sizeId = s.size?._id || s.size || s._id;
        return (
          (sizeName && String(sizeName).trim().toLowerCase() === normalizedSize) ||
          (sizeId && String(sizeId).trim().toLowerCase() === normalizedSize)
        );
      });

      if (matchedSize) {
        const sizeSale = Number(
          matchedSize.salePrice ?? matchedSize.sellingPrice ?? matchedSize.price ?? matchedSize.discountPrice ?? 0
        );
        if (!isNaN(sizeSale) && sizeSale > 0) {
          itemPrice = sizeSale;
        }
      } else if (itemPrice === 0 && prod.sizes[0]) {
        const firstSizeSale = Number(
          prod.sizes[0].salePrice ?? prod.sizes[0].sellingPrice ?? prod.sizes[0].price ?? 0
        );
        if (!isNaN(firstSizeSale) && firstSizeSale > 0) {
          itemPrice = firstSizeSale;
        }
      }
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    totalAmount += itemPrice * qty;
  }

  cart.totalAmount = Math.round(totalAmount * 100) / 100;
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
      cart = await recalculateCart(cart);
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
