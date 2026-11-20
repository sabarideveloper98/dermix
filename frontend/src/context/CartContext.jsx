import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE as API_BASE_CONFIG } from '../config';
import { calculateCartTotals } from '../utils/cartCalculations';

const CartContext = createContext();

const API_BASE = `${API_BASE_CONFIG}`;

export const CartProvider = ({ children }) => {
  const { user, authFetch } = useAuth();

  // Initialize cart state lazily from localStorage to avoid initial ₹0.00 flash on refresh
  const [cart, setCart] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('guestCart') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        const { totalAmount } = calculateCartTotals(stored);
        return { items: stored, totalAmount };
      }
    } catch (e) {
      console.warn('Failed to parse stored guest cart:', e);
    }
    return { items: [], totalAmount: 0 };
  });

  const [loading, setLoading] = useState(true);

  // Helper to calculate totals for guests using unified calculation logic
  const calculateGuestCart = useCallback((items) => {
    const validItems = Array.isArray(items) ? items : [];
    const { totalAmount } = calculateCartTotals(validItems);
    setCart({ items: validItems, totalAmount });
  }, []);

  // Fetch from database and guarantee totalAmount is accurately computed from populated items
  const fetchDatabaseCart = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/cart`);
      const data = await res.json();
      if (res.ok && data.success && data.cart) {
        const items = Array.isArray(data.cart.items) ? data.cart.items : [];
        const { totalAmount } = calculateCartTotals(items);
        setCart({
          ...data.cart,
          items,
          totalAmount: totalAmount > 0 ? totalAmount : (Number(data.cart.totalAmount) || totalAmount),
        });
      }
    } catch (err) {
      console.error('Error fetching db cart:', err);
    }
  }, [authFetch]);

  // Load cart based on auth state
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Logged in user: sync guest cart if exists, then fetch from database
        try {
          const guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            for (const item of guestItems) {
              const productId = item.productId?._id || item.productId || item._id;
              if (productId) {
                await authFetch(`${API_BASE}/cart/add`, {
                  method: 'POST',
                  body: JSON.stringify({
                    productId,
                    quantity: item.quantity || 1,
                    size: item.size || 'Standard',
                  }),
                });
              }
            }
            localStorage.removeItem('guestCart');
          }
        } catch (error) {
          console.error('Error syncing guest cart:', error);
        }
        await fetchDatabaseCart();
      } else {
        // Guest user: load from localStorage
        try {
          const guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
          calculateGuestCart(guestItems);
        } catch (e) {
          calculateGuestCart([]);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user, fetchDatabaseCart, calculateGuestCart]);

  // Add Item to Cart
  const addToCart = async (product, quantity = 1, size = null) => {
    if (!product) return;

    let finalSize = size;
    if (!finalSize) {
      if (product.sizes && product.sizes.length > 0) {
        finalSize = product.sizes[0].name || (product.sizes[0].size ? product.sizes[0].size.name : 'Standard');
      } else {
        finalSize = 'Standard';
      }
    }

    const safeQty = Math.max(1, parseInt(quantity, 10) || 1);

    if (user) {
      try {
        const res = await authFetch(`${API_BASE}/cart/add`, {
          method: 'POST',
          body: JSON.stringify({ productId: product._id, quantity: safeQty, size: finalSize }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to add item to cart');
        }
        if (data.cart) {
          const items = Array.isArray(data.cart.items) ? data.cart.items : [];
          const { totalAmount } = calculateCartTotals(items);
          setCart({
            ...data.cart,
            items,
            totalAmount: totalAmount > 0 ? totalAmount : (Number(data.cart.totalAmount) || totalAmount),
          });
        }
      } catch (err) {
        alert(err.message);
        throw err;
      }
    } else {
      // Guest user
      let guestItems = [];
      try {
        guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (!Array.isArray(guestItems)) guestItems = [];
      } catch (e) {
        guestItems = [];
      }

      const index = guestItems.findIndex(
        (item) => (item.productId?._id || item.productId) === product._id && item.size === finalSize
      );

      if (index > -1) {
        const newQty = guestItems[index].quantity + safeQty;
        if (product.qty && product.qty < newQty) {
          alert(`Cannot add more. Only ${product.qty} left in stock.`);
          return;
        }
        guestItems[index].quantity = newQty;
      } else {
        if (product.qty && product.qty < safeQty) {
          alert(`Cannot add. Only ${product.qty} left in stock.`);
          return;
        }
        guestItems.push({
          productId: product,
          quantity: safeQty,
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
    const safeQty = Math.max(1, parseInt(quantity, 10) || 1);

    if (user) {
      try {
        const res = await authFetch(`${API_BASE}/cart/update`, {
          method: 'PUT',
          body: JSON.stringify({ productId, quantity: safeQty, size }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to update cart');
        }
        if (data.cart) {
          const items = Array.isArray(data.cart.items) ? data.cart.items : [];
          const { totalAmount } = calculateCartTotals(items);
          setCart({
            ...data.cart,
            items,
            totalAmount: totalAmount > 0 ? totalAmount : (Number(data.cart.totalAmount) || totalAmount),
          });
        }
      } catch (err) {
        alert(err.message);
      }
    } else {
      // Guest
      let guestItems = [];
      try {
        guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (!Array.isArray(guestItems)) guestItems = [];
      } catch (e) {
        guestItems = [];
      }

      const index = guestItems.findIndex(
        (item) => (item.productId?._id || item.productId) === productId && item.size === size
      );

      if (index > -1) {
        const product = guestItems[index].productId;
        if (product && product.qty && product.qty < safeQty) {
          alert(`Only ${product.qty} units left in stock.`);
          return;
        }
        guestItems[index].quantity = safeQty;
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
        if (res.ok && data.success && data.cart) {
          const items = Array.isArray(data.cart.items) ? data.cart.items : [];
          const { totalAmount } = calculateCartTotals(items);
          setCart({
            ...data.cart,
            items,
            totalAmount: totalAmount > 0 ? totalAmount : (Number(data.cart.totalAmount) || totalAmount),
          });
        }
      } catch (err) {
        console.error('Error removing from db cart:', err);
      }
    } else {
      // Guest
      let guestItems = [];
      try {
        guestItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (!Array.isArray(guestItems)) guestItems = [];
      } catch (e) {
        guestItems = [];
      }

      guestItems = guestItems.filter(
        (item) => !((item.productId?._id || item.productId) === productId && item.size === size)
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

  // Always compute dynamic totals as the single source of truth
  const calculatedTotals = useMemo(() => calculateCartTotals(cart), [cart]);

  const synchronizedCart = useMemo(() => ({
    ...cart,
    totalAmount: calculatedTotals.totalAmount,
    totalCount: calculatedTotals.totalCount,
    items: Array.isArray(cart.items) ? cart.items : [],
  }), [cart, calculatedTotals]);

  return (
    <CartContext.Provider
      value={{
        cart: synchronizedCart,
        calculatedTotals,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart: user ? fetchDatabaseCart : () => { },
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
