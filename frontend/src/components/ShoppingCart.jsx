import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { triggerCheckoutWorkflow } from "../utils/checkoutWorkflow";
import { calculateCartTotals } from "../utils/cartCalculations";

export default function ShoppingCart() {
  const { cart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Single source of truth for cart totals and item prices
  const {
    totalAmount,
    totalCount: cartCount,
    spendMore,
    shippingProgress: progressPercent,
    resolvedItems,
  } = useMemo(() => calculateCartTotals(cart), [cart]);

  const handleCheckoutClick = (e) => {
    triggerCheckoutWorkflow({
      event: e,
      cart,
      user,
      navigate,
      setLoading: setCheckoutLoading
    });
  };

  const handleViewCartClick = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    // Cleanly close offcanvas
    try {
      const offcanvasEl = document.getElementById("shoppingCart");
      if (offcanvasEl) {
        if (window.bootstrap?.Offcanvas) {
          const bsOffcanvas =
            window.bootstrap.Offcanvas.getInstance(offcanvasEl) ||
            new window.bootstrap.Offcanvas(offcanvasEl);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        }
        const closeBtn = offcanvasEl.querySelector(".btn-close-popup");
        if (closeBtn) {
          closeBtn.click();
        }
      }
    } catch (err) {
      console.warn("Offcanvas close error:", err);
    }

    // Clean up any dangling backdrop or scroll locks
    setTimeout(() => {
      document.querySelectorAll(".offcanvas-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }, 100);

    navigate("/cart");
  };

  return (
    <div className="offcanvas offcanvas-end popup-shopping-cart" id="shoppingCart">
      <div className="canvas-wrapper overflow-hidden">
        <div className="popup-header">
          <div className="d-flex justify-content-between align-items-start mb-24">
            <h6 className="font-instrument_serif">
              Your Cart (<span className="prd__count">{cartCount}</span>)
            </h6>
            <i className="icon icon-Close btn-close-popup fs-24" data-bs-dismiss="offcanvas"></i>
          </div>
          <div className="cart-threshold">
            <p className="text text-body-s fw-normal mb-8">
              {spendMore > 0
                ? `Spend ₹${spendMore.toFixed(2)} more for free shipping`
                : "Congrats! You get free shipping!"}
            </p>
            <div className="tf-progress-bar tf-progress-ship">
              <div
                className="value"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="br-line bg-line-5"></div>
        </div>

        <div className="wrap">
          {resolvedItems.length === 0 ? (
            <div className="tf-mini-cart-wrap list-file-delete wrap-empty_text" style={{ display: 'block' }}>
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items list-empty">
                    <div className="box-text_empty type-shop_cart">
                      <div className="shop-empty_top">
                        <span className="icon">
                          <i className="icon-Box"></i>
                        </span>
                        <p className="text-emp text-body-l fw-normal">Your cart is empty</p>
                        <p className="text-body-s cl-text-5">
                          Looks like you haven’t added anything yet. <br />
                          Start browsing and find something you’ll love.
                        </p>
                      </div>
                      <div className="shop-empty_bot">
                        <button className="tf-btn style-2 type-2" data-bs-dismiss="offcanvas">
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="tf-mini-cart-wrap" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="tf-mini-cart-main" style={{ flex: 1, overflowY: 'auto' }}>
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {resolvedItems.map((item) => {
                      const prod = item.productId || item.product;
                      if (!prod) return null;

                      const prodId = prod._id || prod.id;
                      const imageSrc =
                        (Array.isArray(prod.images) && prod.images[0]) ||
                        prod.image ||
                        "assets/images/products/serum_product.png";

                      return (
                        <div key={`${prodId}-${item.size}`} className="tf-mini-cart-item">
                          <Link
                            to={`/ProductDetails?id=${prodId}`}
                            className="tf-mini-cart-image"
                            onClick={() => localStorage.setItem('selectedProductId', prodId)}
                            data-bs-dismiss="offcanvas"
                          >
                            <img
                              loading="lazy"
                              width="74"
                              height="88"
                              src={imageSrc}
                              alt={prod.name || "Product image"}
                            />
                          </Link>
                          <div className="tf-mini-cart-info">
                            <Link
                              to={`/ProductDetails?id=${prodId}`}
                              className="name fw-normal link-underline text-line-clamp-1"
                              onClick={() => localStorage.setItem('selectedProductId', prodId)}
                              data-bs-dismiss="offcanvas"
                            >
                              {prod.name}
                            </Link>
                            <div className="tf-prd-select select-color text-body-s cl-text-5">
                              <span className="type-text">Size: {item.size}</span>
                            </div>
                          </div>
                          <div className="tf-mini-cart-price">
                            <div className="price-wrap gap-6">
                              <span className="price-new fw-normal text-primary">
                                ₹{item.sellingPrice.toFixed(2)}
                              </span>
                              {item.mrpPrice > item.sellingPrice && (
                                <span className="price-old fw-normal cl-text-6">
                                  ₹{item.mrpPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="group-action">
                              <div className="wg-quantity style-2">
                                <button
                                  type="button"
                                  className="btn-quantity minus-btn"
                                  onClick={() => updateCartItem(prodId, item.quantity - 1, item.size)}
                                  disabled={item.quantity <= 1}
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
                                  aria-label="Product quantity"
                                />
                                <button
                                  type="button"
                                  className="btn-quantity plus-btn"
                                  onClick={() => updateCartItem(prodId, item.quantity + 1, item.size)}
                                  aria-label="Increase quantity"
                                >
                                  <i className="icon icon-Plus"></i>
                                </button>
                              </div>
                              <button
                                type="button"
                                className="tf-btn-rounded style-2 btn-remove-cart"
                                onClick={() => removeFromCart(prodId, item.size)}
                                aria-label="Remove item from cart"
                              >
                                <i className="icon icon-Trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="tf-mini-cart-bottom box-empty_clear">
                <div className="tf-mini-cart-total text-body-l fw-normal">
                  <span>Estimated total</span>
                  <div className="price-wrap gap-6">
                    <span className="price-new tf-cart-estimated-total fw-normal">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="tf-mini-cart-view-checkout">
                  <button
                    type="button"
                    onClick={handleViewCartClick}
                    className="tf-btn style-2 type-2 btn-light"
                    data-bs-dismiss="offcanvas"
                  >
                    View cart
                  </button>
                  <button
                    onClick={handleCheckoutClick}
                    className="tf-btn style-2 w-50"
                    disabled={checkoutLoading || resolvedItems.length === 0}
                  >
                    {checkoutLoading ? "Processing..." : "Check out"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}