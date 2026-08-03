import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ShoppingCart() {
  const { cart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.totalAmount;
  const shippingThreshold = 499; // Free shipping over 499
  const spendMore = Math.max(0, shippingThreshold - totalAmount);
  const progressPercent = Math.min(100, (totalAmount / shippingThreshold) * 100);

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const closeBtn = document.querySelector("#shoppingCart .btn-close-popup");
    if (closeBtn) {
      closeBtn.click();
    }

    navigate("/checkout");
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
          {cart.items.length === 0 ? (
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
            <div className="tf-mini-cart-wrap list-file-delete" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="tf-mini-cart-main" style={{ flex: 1, overflowY: 'auto' }}>
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {cart.items.map((item) => {
                      const prod = item.productId;
                      if (!prod) return null;

                      return (
                        <div key={`${prod._id}-${item.size}`} className="tf-mini-cart-item file-delete">
                          <Link 
                            to={`/ProductDetails?id=${prod._id}`} 
                            className="tf-mini-cart-image"
                            onClick={() => localStorage.setItem('selectedProductId', prod._id)}
                            data-bs-dismiss="offcanvas"
                          >
                            <img 
                              loading="lazy" 
                              width="74" 
                              height="88"
                              src={prod.images[0] || "assets/images/products/serum_product.png"} 
                              alt={prod.name} 
                            />
                          </Link>
                          <div className="tf-mini-cart-info">
                            <Link 
                              to={`/ProductDetails?id=${prod._id}`} 
                              className="name fw-normal link-underline text-line-clamp-1"
                              onClick={() => localStorage.setItem('selectedProductId', prod._id)}
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
                              <span className="price-new fw-normal text-primary tf-mini-card-price">
                                ₹{prod.salePrice}
                              </span>
                              {prod.mrpPrice > prod.salePrice && (
                                <span className="price-old fw-normal cl-text-6">₹{prod.mrpPrice}</span>
                              )}
                            </div>
                            <div className="group-action">
                              <div className="wg-quantity style-2">
                                <button 
                                  type="button" 
                                  className="btn-quantity minus-btn"
                                  onClick={() => updateCartItem(prod._id, item.quantity - 1, item.size)}
                                >
                                  <i className="icon icon-Minus"></i>
                                </button>
                                <input 
                                  className="quantity-product" 
                                  type="text" 
                                  name="number" 
                                  value={item.quantity}
                                  readOnly
                                />
                                <button 
                                  type="button" 
                                  className="btn-quantity plus-btn"
                                  onClick={() => updateCartItem(prod._id, item.quantity + 1, item.size)}
                                >
                                  <i className="icon icon-Plus"></i>
                                </button>
                              </div>
                              <button 
                                type="button" 
                                className="tf-btn-rounded style-2 remove"
                                onClick={() => removeFromCart(prod._id, item.size)}
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
                    <span className="price-new tf-totals-total-value fw-normal">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="tf-mini-cart-view-checkout">
                  <Link to="/cart" className="tf-btn style-2 type-2 btn-light" data-bs-dismiss="offcanvas">
                    View cart
                  </Link>
                  <button 
                    onClick={handleCheckoutClick}
                    className="tf-btn style-2 w-100"
                  >
                    Check out
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