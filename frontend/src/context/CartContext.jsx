import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

import { API_BASE as API_BASE_CONFIG } from '../config';

const CartContext = createContext();

const API_BASE = `${API_BASE_CONFIG}/api`;

export const CartProvider = ({ children }) => {
  const { user, authFetch } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  // Load cart based on auth state
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Logged in user: sync guest cart if exists, then fetch from database
        const guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestItems.length > 0) {
          try {
            for (const item of guestItems) {
              await authFetch(`${API_BASE}/cart/add`, {
                method: 'POST',
                body: JSON.stringify({
                  productId: item.productId._id || item.productId,
                  quantity: item.quantity,
                  size: item.size,
                }),
              });
            }
            localStorage.removeItem('guestCart');
          } catch (error) {
            console.error('Error syncing guest cart:', error);
          }
        }
        await fetchDatabaseCart();
      } else {
        // Guest user: load from localStorage
        const guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
        calculateGuestCart(guestItems);
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Fetch from database
  const fetchDatabaseCart = async () => {
    try {
      const res = await authFetch(`${API_BASE}/cart`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Error fetching db cart:', err);
    }
  };

  // Helper to calculate totals for guests
  const calculateGuestCart = (items) => {
    let total = 0;
    items.forEach((item) => {
      let price = item.productId.salePrice || item.price || 0;
      if (item.productId.sizes && item.productId.sizes.length > 0) {
        const sizeObj = item.productId.sizes.find(s => (s.size ? s.size.name : s.name) === item.size);
        if (sizeObj && sizeObj.salePrice) {
          price = sizeObj.salePrice;
        }
      }
      total += price * item.quantity;
    });
    setCart({ items, totalAmount: total });
  };

  // Add Item to Cart
  const addToCart = async (product, quantity = 1, size = null) => {
    let finalSize = size;
    if (!finalSize) {
      if (product.sizes && product.sizes.length > 0) {
        finalSize = product.sizes[0].name || (product.sizes[0].size ? product.sizes[0].size.name : 'Standard');
      } else {
        finalSize = 'Standard';
      }
    }

    if (user) {
      try {
        const res = await authFetch(`${API_BASE}/cart/add`, {
          method: 'POST',
          body: JSON.stringify({ productId: product._id, quantity, size: finalSize }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to add item to cart');
        }
        setCart(data.cart);
      } catch (err) {
        alert(err.message);
        throw err;
      }
    } else {
      // Guest
      const guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const index = guestItems.findIndex(
        (item) => item.productId._id === product._id && item.size === finalSize
      );

      if (index > -1) {
        const newQty = guestItems[index].quantity + quantity;
        if (product.qty < newQty) {
          alert(`Cannot add more. Only ${product.qty} left in stock.`);
          return;
        }
        guestItems[index].quantity = newQty;
      } else {
        if (product.qty < quantity) {
          alert(`Cannot add. Only ${product.qty} left in stock.`);
          return;
        }
        guestItems.push({
          productId: product,
          quantity,
          size: finalSize,
        });
      }

      localStorage.setItem('guestCart', JSON.stringify(guestItems));
      calculateGuestCart(guestItems);
    }
  };

  // Update Item Quantity
  const updateCartItem = async (productId, quantity, size = null) => {
    if (quantity < 1) return;

    if (user) {
      try {
        const res = await authFetch(`${API_BASE}/cart/update`, {
          method: 'PUT',
          body: JSON.stringify({ productId, quantity, size }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to update cart');
        }
        setCart(data.cart);
      } catch (err) {
        alert(err.message);
      }
    } else {
      // Guest
      const guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const index = guestItems.findIndex(
        (item) => item.productId._id === productId && item.size === size
      );

      if (index > -1) {
        const product = guestItems[index].productId;
        if (product.qty < quantity) {
          alert(`Only ${product.qty} units left in stock.`);
          return;
        }
        guestItems[index].quantity = quantity;
        localStorage.setItem('guestCart', JSON.stringify(guestItems));
        calculateGuestCart(guestItems);
      }
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (productId, size = null) => {
    if (user) {
      try {
        const res = await authFetch(`${API_BASE}/cart/remove`, {
          method: 'DELETE',
          body: JSON.stringify({ productId, size }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCart(data.cart);
        }
      } catch (err) {
        console.error('Error removing from db cart:', err);
      }
    } else {
      // Guest
      let guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
      guestItems = guestItems.filter(
        (item) => !(item.productId._id === productId && item.size === size)
      );
      localStorage.setItem('guestCart', JSON.stringify(guestItems));
      calculateGuestCart(guestItems);
    }
  };

  // Clear Cart
  const clearCart = () => {
    setCart({ items: [], totalAmount: 0 });
    localStorage.removeItem('guestCart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart: user ? fetchDatabaseCart : () => {},
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
