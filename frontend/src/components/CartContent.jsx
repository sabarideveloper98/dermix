import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { triggerCheckoutWorkflow } from "../utils/checkoutWorkflow";

export default function CartContent() {
  const { cart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponFeedback, setCouponFeedback] = useState({ type: "", text: "" });

  // Resolve size-specific prices and subtotal per item
  const resolvedItems = useMemo(() => {
    if (!cart || !Array.isArray(cart.items)) return [];

    return cart.items
      .map((item) => {
        const prod = item.productId;
        if (!prod) return null;

        let salePrice = Number(prod.salePrice || prod.price || 0);
        let mrpPrice = Number(prod.mrpPrice || salePrice);

        if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
          const matchedSize = prod.sizes.find(
            (s) => (s.size ? s.size.name : s.name) === item.size
          );
          if (matchedSize && matchedSize.salePrice) {
            salePrice = Number(matchedSize.salePrice);
            mrpPrice = Number(matchedSize.mrpPrice || mrpPrice);
          }
        }

        const quantity = Math.max(1, Number(item.quantity) || 1);
        const subtotal = salePrice * quantity;
        const mrpSubtotal = mrpPrice * quantity;

        return {
          ...item,
          product: prod,
          salePrice,
          mrpPrice,
          quantity,
          subtotal,
          mrpSubtotal,
        };
      })
      .filter(Boolean);
  }, [cart]);

  // Calculations
  const totalItemsCount = resolvedItems.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = resolvedItems.reduce((acc, it) => acc + it.subtotal, 0);
  const totalMrp = resolvedItems.reduce((acc, it) => acc + it.mrpSubtotal, 0);
  const mrpSavings = Math.max(0, totalMrp - subtotal);

  // Free shipping threshold (₹499)
  const shippingThreshold = 499;
  const isFreeShipping = subtotal >= shippingThreshold;
  const spendMore = Math.max(0, shippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / shippingThreshold) * 100);
  const shippingFee = subtotal === 0 || isFreeShipping ? 0 : 50;

  // Coupon application logic
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponFeedback({ type: "error", text: "Please enter a coupon code." });
      return;
    }

    if (code === "DERMFIX10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, discount, percent: 10 });
      setCouponFeedback({ type: "success", text: `Coupon "${code}" applied! 10% discount added.` });
    } else if (code === "SAVE50") {
      const discount = Math.min(50, subtotal);
      setAppliedCoupon({ code, discount, flat: 50 });
      setCouponFeedback({ type: "success", text: `Coupon "${code}" applied! ₹50 discount added.` });
    } else if (code === "WELCOME15") {
      const discount = Math.round(subtotal * 0.15);
      setAppliedCoupon({ code, discount, percent: 15 });
      setCouponFeedback({ type: "success", text: `Coupon "${code}" applied! 15% discount added.` });
    } else {
      setCouponFeedback({
        type: "error",
        text: `Invalid coupon "${code}". Try "DERMFIX10" or "SAVE50".`,
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponFeedback({ type: "", text: "" });
  };

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  // Proceed to Checkout handler using existing Shiprocket checkout workflow
  const handleCheckoutClick = (e) => {
    triggerCheckoutWorkflow({
      event: e,
      cart,
      user,
      navigate,
      setLoading: setCheckoutLoading,
    });
  };

  return (
    <>
      {/* Page Header / Breadcrumb */}
      <div className="tf-page-title mb-30 pt-20">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="heading font-instrument_serif mb-8">Your Shopping Cart</h2>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center gap-2 text-body-s cl-text-5">
                <li>
                  <Link to="/" className="link">
                    Home
                  </Link>
                </li>
                <li>
                  <span>/</span>
                </li>
                <li className="text-black fw-medium">Cart Details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="section-shopping-cart each-list-prd flat-spacing-2 pb-50">
        <div className="container">
          {resolvedItems.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-24">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "#f5f5f5",
                    fontSize: "36px",
                    color: "#999",
                  }}
                >
                  <i className="icon icon-Box"></i>
                </span>
              </div>
              <h4 className="font-instrument_serif mb-12">Your Cart is Empty</h4>
              <p className="cl-text-5 mb-24 max-w-400 mx-auto">
                Looks like you haven't added anything to your cart yet. Explore our dermatologically formulated products to get started!
              </p>
              <Link to="/" className="tf-btn style-2 type-2">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="row gy-30">
              {/* Left Column: Cart Items List */}
              <div className="col-lg-7 col-xl-8">
                {/* Free Shipping Progress Indicator */}
                <div
                  className="cart-threshold mb-24 p-3 rounded-8"
                  style={{ backgroundColor: "#F7F7F8", border: "1px solid #ECECEC" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-8">
                    <p className="text text-body-s fw-semibold mb-0">
                      {isFreeShipping ? (
                        <span className="text-success d-inline-flex align-items-center gap-1">
                          <i className="icon icon-Check"></i> Congrats! You have unlocked FREE shipping!
                        </span>
                      ) : (
                        <span>
                          Spend <strong>₹{spendMore.toFixed(2)}</strong> more for <strong>FREE shipping</strong>!
                        </span>
                      )}
                    </p>
                    <span className="text-body-xs cl-text-5">
                      {isFreeShipping ? "FREE" : `Threshold: ₹${shippingThreshold}`}
                    </span>
                  </div>
                  <div
                    className="tf-progress-bar tf-progress-ship"
                    style={{
                      height: "8px",
                      borderRadius: "99px",
                      backgroundColor: "#E5E5E5",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="value"
                      style={{
                        width: `${shippingProgress}%`,
                        height: "100%",
                        backgroundColor: isFreeShipping ? "#28a745" : "#003087",
                        transition: "width 0.4s ease",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Cart Items Table */}
                <div className="overflow-auto">
                  <div className="tf-table-page-cart">
                    {resolvedItems.map((item) => {
                      const prod = item.product;
                      const imageSrc =
                        (Array.isArray(prod.images) && prod.images[0]) ||
                        prod.image ||
                        "assets/images/products/serum_product.png";

                      const skuText = prod.sku
                        ? `SKU: ${prod.sku}`
                        : `Code: ${String(prod._id).slice(-6).toUpperCase()}`;

                      return (
                        <div
                          key={`${prod._id}-${item.size}`}
                          className="tf-cart_item each-prd file-delete py-3"
                        >
                          <div className="cart-col cart_product">
                            <Link
                              to={`/ProductDetails?id=${prod._id}`}
                              className="img-prd"
                              onClick={() => localStorage.setItem("selectedProductId", prod._id)}
                            >
                              <img
                                loading="lazy"
                                width="128"
                                height="154"
                                src={imageSrc}
                                alt={prod.name}
                                style={{ objectFit: "cover", borderRadius: "6px" }}
                              />
                            </Link>
                            <div className="infor-prd">
                              <Link
                                to={`/ProductDetails?id=${prod._id}`}
                                className="prd_name fw-medium link-underline"
                                onClick={() => localStorage.setItem("selectedProductId", prod._id)}
                              >
                                {prod.name}
                              </Link>

                              <div className="prd_select cl-text-5 text-body-s d-flex flex-wrap gap-2">
                                <span className="type-text">Size: <strong>{item.size}</strong></span>
                                <span className="cl-text-6">|</span>
                                <span className="cl-text-6">{skuText}</span>
                              </div>

                              <div className="price-wrap fw-normal gap-6 align-items-center">
                                <p className="price-new text-primary cart_price each-price fw-semibold mb-0">
                                  ₹{item.salePrice.toFixed(2)}
                                </p>
                                {item.mrpPrice > item.salePrice && (
                                  <p className="price-old cl-text-6 text-decoration-line-through mb-0 text-body-s">
                                    ₹{item.mrpPrice.toFixed(2)}
                                  </p>
                                )}
                              </div>

                              <div
                                className="cart_remove tf-btn-line fw-normal remove text-danger text-body-xs"
                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                onClick={() => removeFromCart(prod._id, item.size)}
                                role="button"
                                tabIndex={0}
                              >
                                Remove item
                              </div>
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div className="cart-col cart_quantity" data-cart-title="Quantity">
                            <div className="wg-quantity">
                              <button
                                type="button"
                                className="btn-quantity minus-quantity"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateCartItem(prod._id, item.quantity - 1, item.size);
                                  }
                                }}
                                disabled={item.quantity <= 1}
                                title={item.quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
                                aria-label="Decrease quantity"
                              >
                                <i className="icon icon-Minus"></i>
                              </button>
                              <input
                                className="quantity-product"
                                type="text"
                                name="number"
                                value={item.quantity}
                                readOnly
                                aria-label="Item quantity"
                              />
                              <button
                                type="button"
                                className="btn-quantity plus-quantity"
                                onClick={() => {
                                  if (prod.qty && item.quantity >= prod.qty) {
                                    alert(`Only ${prod.qty} units available in stock.`);
                                    return;
                                  }
                                  updateCartItem(prod._id, item.quantity + 1, item.size);
                                }}
                                title="Increase quantity"
                                aria-label="Increase quantity"
                              >
                                <i className="icon icon-Plus"></i>
                              </button>
                            </div>
                          </div>

                          {/* Item Subtotal */}
                          <div
                            className="cart-col cart_total fw-semibold each-subtotal-price text-end"
                            data-cart-title="Subtotal"
                          >
                            ₹{item.subtotal.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Continue Shopping Secondary Link on Left Column */}
                <div className="mt-24 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <Link to="/" className="tf-btn-line fw-medium d-inline-flex align-items-center gap-2">
                    <i className="icon icon-ArrowLeft"></i> Continue Shopping
                  </Link>
                  <span className="text-body-s cl-text-5">
                    {totalItemsCount} {totalItemsCount === 1 ? "product" : "products"} in your cart
                  </span>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="col-lg-5 col-xl-4">
                <div
                  className="sidebar-cart-checkout p-3 rounded-8"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #ECECEC",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  }}
                >
                  <h5 className=" mb-20 pb-12 border-bottom">
                    <b>Order Summary</b>
                  </h5>

                  {/* Summary Breakdown */}
                  <ul className="list-unstyled mb-20 d-grid gap-12 text-body-s">
                    <li className="d-flex justify-content-between align-items-center">
                      <span className="cl-text-5">
                        Subtotal ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
                      </span>
                      <span className="fw-medium text-black">₹{subtotal.toFixed(2)}</span>
                    </li>

                    {mrpSavings > 0 && (
                      <li className="d-flex justify-content-between align-items-center text-success">
                        <span>Retail Savings</span>
                        <span className="fw-medium">-₹{mrpSavings.toFixed(2)}</span>
                      </li>
                    )}

                    {appliedCoupon && (
                      <li className="d-flex justify-content-between align-items-center text-success">
                        <span className="d-flex align-items-center gap-1">
                          Coupon ({appliedCoupon.code})
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="btn btn-sm p-0 text-danger border-0 bg-transparent"
                            style={{ fontSize: "11px", marginLeft: "4px" }}
                            title="Remove coupon"
                          >
                            [Remove]
                          </button>
                        </span>
                        <span className="fw-medium">-₹{couponDiscount.toFixed(2)}</span>
                      </li>
                    )}

                    <li className="d-flex justify-content-between align-items-center">
                      <span className="cl-text-5">Shipping Charges</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-success fw-semibold">FREE</span>
                        ) : (
                          <span className="fw-medium text-black">₹{shippingFee.toFixed(2)}</span>
                        )}
                      </span>
                    </li>

                    <li className="d-flex justify-content-between align-items-center">
                      <span className="cl-text-5">Taxes (GST)</span>
                      <span className="cl-text-5 text-body-xs">Included in price</span>
                    </li>
                  </ul>

                  {/* Coupon Code Input */}
                  <div className="coupon-box  my-4  border-top" style={{paddingTop:"20px"}}>
                    <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. DERMFIX10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="form-control form-control-sm text-uppercase"
                        style={{ fontSize: "13px" }}
                        disabled={!!appliedCoupon}
                      />
                      <button
                        type="submit"
                        className="tf-btn style-2 type-2 py-1 px-3 text-nowrap"
                        style={{ minWidth: "80px", fontSize: "13px" }}
                        disabled={!!appliedCoupon}
                      >
                        Apply
                      </button>
                    </form>
                    {couponFeedback.text && (
                      <p
                        className={`text-body-xs mt-2 mb-0 ${
                          couponFeedback.type === "success" ? "text-success" : "text-danger"
                        }`}
                      >
                        {couponFeedback.text}
                      </p>
                    )}
                  </div>

                  {/* Final Total */}
                  <div className="pt-16 border-top mb-20" style={{paddingTop:"20px"}}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span className="fw-semibold text-body-l">Final Total</span>
                      <span className="fw-bold fs-20 text-primary">₹{finalTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-body-xs cl-text-6 mb-0 text-end">
                      All taxes and free shipping threshold calculated
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-10 mb-20">
                    <button
                      type="button"
                      onClick={handleCheckoutClick}
                      className="tf-btn style-2 type-2 w-100 d-flex align-items-center justify-content-center gap-2"
                      disabled={checkoutLoading || resolvedItems.length === 0}
                    >
                      {checkoutLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Redirecting to Checkout...
                        </>
                      ) : (
                        <>
                          <i className="icon icon-Lock"></i> Proceed to Checkout
                        </>
                      )}
                    </button>

                    <Link to="/" className="tf-btn style-2 type-2 btn-light w-100 text-center">
                      Continue Shopping
                    </Link>
                  </div>

                  {/* Trust & Payment Badges */}
                  <div className="text-center pt-12 border-top">
                    <p className="text-body-xs cl-text-5 mb-8">
                      Guaranteed safe & secure checkout powered by Shiprocket
                    </p>
                    <ul className="list-card d-flex justify-content-center align-items-center gap-2 list-unstyled mb-0">
                      <li className="card-item">
                        <img width="40" height="26" src="assets/images/payment/visa.svg" alt="Visa" />
                      </li>
                      <li className="card-item">
                        <img width="40" height="26" src="assets/images/payment/master.svg" alt="Mastercard" />
                      </li>
                      <li className="card-item">
                        <img width="40" height="26" src="assets/images/payment/paypal.svg" alt="PayPal" />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}