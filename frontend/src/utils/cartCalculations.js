/**
 * Centralized cart and product pricing calculation utility.
 * Guarantees consistent calculation across CartDrawer, CartPage, CheckoutPage, and CartContext.
 *
 * Formula: Total = Sum of (Product Selling Price × Product Quantity)
 */

/**
 * Safely parses any price representation into a valid positive number.
 * Handles numbers, numeric strings, and strings with currency symbols (₹, $, etc.) or commas.
 * Returns 0 if invalid or negative.
 *
 * @param {any} val
 * @returns {number}
 */
export function parseNumericPrice(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") {
    return !isNaN(val) && isFinite(val) && val >= 0 ? val : 0;
  }
  if (typeof val === "string") {
    const cleaned = val.replace(/[₹$,\s]/g, "").trim();
    if (!cleaned) return 0;
    const parsed = parseFloat(cleaned);
    return !isNaN(parsed) && isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }
  return 0;
}

/**
 * Resolves the numeric selling price of a product or cart item,
 * taking size-specific variations and property name aliases into account.
 *
 * Checks: salePrice, sellingPrice, price, discountPrice, finalPrice, mrpPrice
 *
 * @param {object} itemOrProduct - Product object or Cart item object
 * @param {string|null} selectedSize - Optional size name or ID
 * @returns {number} Selling price as a valid number
 */
export function getProductSellingPrice(itemOrProduct, selectedSize = null) {
  if (!itemOrProduct) return 0;

  // Unwrap product if cart item shape: item.productId or item.product
  const prod = itemOrProduct.productId || itemOrProduct.product || itemOrProduct;
  const sizeToMatch = selectedSize || itemOrProduct.size || null;

  // 1. Check size-specific price first if sizes exist
  if (prod.sizes && Array.isArray(prod.sizes) && prod.sizes.length > 0) {
    if (sizeToMatch) {
      const normalizedMatch = String(sizeToMatch).trim().toLowerCase();
      const matched = prod.sizes.find((s) => {
        if (!s) return false;
        const sizeName = s.size ? (s.size.name || s.size) : (s.name || s._id);
        const sizeId = s.size?._id || s.size || s._id;
        return (
          (sizeName && String(sizeName).trim().toLowerCase() === normalizedMatch) ||
          (sizeId && String(sizeId).trim().toLowerCase() === normalizedMatch)
        );
      });

      if (matched) {
        const sizeSale = parseNumericPrice(
          matched.salePrice ?? matched.sellingPrice ?? matched.price ?? matched.discountPrice
        );
        if (sizeSale > 0) return sizeSale;
      }
    }

    // If root product has no valid price, fallback to first size price
    const rootPriceCandidate = parseNumericPrice(
      prod.salePrice ?? prod.sellingPrice ?? prod.price ?? prod.discountPrice ?? prod.finalPrice
    );
    if (rootPriceCandidate > 0) {
      return rootPriceCandidate;
    }

    const firstSize = prod.sizes[0];
    if (firstSize) {
      const firstSale = parseNumericPrice(
        firstSize.salePrice ?? firstSize.sellingPrice ?? firstSize.price ?? firstSize.discountPrice
      );
      if (firstSale > 0) return firstSale;
    }
  }

  // 2. Fall back to root product price fields in priority order
  const rootSale = parseNumericPrice(
    prod.salePrice ??
    prod.sellingPrice ??
    prod.price ??
    prod.discountPrice ??
    prod.finalPrice ??
    prod.mrpPrice ??
    0
  );

  return rootSale;
}

/**
 * Resolves the numeric MRP (Maximum Retail Price / Original Price) of a product or cart item.
 *
 * @param {object} itemOrProduct
 * @param {string|null} selectedSize
 * @returns {number} MRP price as a valid number
 */
export function getProductMrpPrice(itemOrProduct, selectedSize = null) {
  if (!itemOrProduct) return 0;

  const prod = itemOrProduct.productId || itemOrProduct.product || itemOrProduct;
  const sizeToMatch = selectedSize || itemOrProduct.size || null;
  const sellingPrice = getProductSellingPrice(itemOrProduct, sizeToMatch);

  if (prod.sizes && Array.isArray(prod.sizes) && prod.sizes.length > 0 && sizeToMatch) {
    const normalizedMatch = String(sizeToMatch).trim().toLowerCase();
    const matched = prod.sizes.find((s) => {
      if (!s) return false;
      const sizeName = s.size ? (s.size.name || s.size) : (s.name || s._id);
      const sizeId = s.size?._id || s.size || s._id;
      return (
        (sizeName && String(sizeName).trim().toLowerCase() === normalizedMatch) ||
        (sizeId && String(sizeId).trim().toLowerCase() === normalizedMatch)
      );
    });

    if (matched) {
      const sizeMrp = parseNumericPrice(matched.mrpPrice ?? matched.originalPrice);
      if (sizeMrp > 0) return Math.max(sizeMrp, sellingPrice);
    }
  }

  const rootMrp = parseNumericPrice(prod.mrpPrice ?? prod.originalPrice);
  return rootMrp > 0 ? Math.max(rootMrp, sellingPrice) : sellingPrice;
}

/**
 * Calculates complete cart totals and resolves all item prices consistently.
 *
 * Total = Sum of (Product Selling Price × Product Quantity)
 *
 * @param {object|Array} cartOrItems - Cart object ({ items: [...] }) or items array
 * @returns {object} Calculated totals and resolved items
 */
export function calculateCartTotals(cartOrItems) {
  const items = Array.isArray(cartOrItems)
    ? cartOrItems
    : (cartOrItems && Array.isArray(cartOrItems.items) ? cartOrItems.items : []);

  let rawTotal = 0;
  let rawMrpTotal = 0;
  let totalCount = 0;

  const resolvedItems = items
    .map((item) => {
      if (!item) return null;
      const product = item.productId || item.product || item;
      if (!product) return null;

      const size = item.size || "Standard";
      const sellingPrice = getProductSellingPrice(item, size);
      const mrpPrice = getProductMrpPrice(item, size);
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      const subtotal = Math.round(sellingPrice * quantity * 100) / 100;
      const mrpSubtotal = Math.round(mrpPrice * quantity * 100) / 100;

      rawTotal += subtotal;
      rawMrpTotal += mrpSubtotal;
      totalCount += quantity;

      return {
        ...item,
        productId: product,
        product,
        size,
        sellingPrice,
        mrpPrice,
        quantity,
        subtotal,
        mrpSubtotal,
      };
    })
    .filter(Boolean);

  const totalAmount = Math.round(rawTotal * 100) / 100;
  const totalMrp = Math.round(rawMrpTotal * 100) / 100;
  const mrpSavings = Math.max(0, Math.round((totalMrp - totalAmount) * 100) / 100);

  const shippingThreshold = 499;
  const isFreeShipping = totalAmount >= shippingThreshold;
  const spendMore = isFreeShipping ? 0 : Math.max(0, Math.round((shippingThreshold - totalAmount) * 100) / 100);
  const shippingProgress = Math.min(100, Math.round((totalAmount / shippingThreshold) * 100));
  const shippingFee = totalAmount === 0 || isFreeShipping ? 0 : 50;

  return {
    totalAmount,
    subtotal: totalAmount,
    totalCount,
    totalMrp,
    mrpSavings,
    shippingThreshold,
    isFreeShipping,
    spendMore,
    shippingProgress,
    shippingFee,
    resolvedItems,
  };
}
