import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartContent() {
  const { cart, updateCartItem, removeFromCart } = useCart();

  const totalAmount = cart.totalAmount;

  return (
    <>
      <div className="section-shopping-cart each-list-prd flat-spacing-2 pb-0">
        <div className="container">
          {cart.items.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="font-instrument_serif mb-16">Your Cart is Empty</h4>
              <p className="cl-text-5 mb-24">
                Looks like you haven't added anything yet. Explore our collections to get started!
              </p>
              <Link to="/" className="tf-btn style-2 type-2">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="row gy-30">
              <div className="col-lg-7">
                <div className="overflow-auto">
                  <div className="tf-table-page-cart">
                    {cart.items.map((item) => {
                      const prod = item.productId;
                      if (!prod) return null;

                      const itemSubtotal = prod.salePrice * item.quantity;

                      return (
                        <div key={`${prod._id}-${item.size}`} className="tf-cart_item each-prd file-delete">
                          <div className="cart-col cart_product">
                            <Link 
                              to={`/ProductDetails?id=${prod._id}`} 
                              className="img-prd"
                              onClick={() => localStorage.setItem('selectedProductId', prod._id)}
                            >
                              <img 
                                loading="lazy" 
                                width="128" 
                                height="154"
                                src={prod.images[0] || "assets/images/products/serum_product.png"} 
                                alt={prod.name} 
                              />
                            </Link>
                            <div className="infor-prd">
                              <Link 
                                to={`/ProductDetails?id=${prod._id}`} 
                                className="prd_name fw-normal link-underline"
                                onClick={() => localStorage.setItem('selectedProductId', prod._id)}
                              >
                                {prod.name}
                              </Link>
                              <div className="prd_select cl-text-5">
                                <span className="type-text">Size: {item.size}</span>
                              </div>
                              <div className="price-wrap fw-normal gap-6">
                                <p className="price-new text-primary cart_price each-price">
                                  ₹{prod.salePrice}
                                </p>
                                {prod.mrpPrice > prod.salePrice && (
                                  <p className="price-old cl-text-6">₹{prod.mrpPrice}</p>
                                )}
                              </div>
                              <div 
                                className="cart_remove tf-btn-line fw-normal remove"
                                style={{ cursor: 'pointer' }}
                                onClick={() => removeFromCart(prod._id, item.size)}
                              >
                                REMOVE
                              </div>
                            </div>
                          </div>
                          <div className="cart-col cart_quantity" data-cart-title="Quantity">
                            <div className="wg-quantity">
                              <button 
                                className="btn-quantity minus-quantity"
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
                                className="btn-quantity plus-quantity"
                                onClick={() => updateCartItem(prod._id, item.quantity + 1, item.size)}
                              >
                                <i className="icon icon-Plus"></i>
                              </button>
                            </div>
                          </div>
                          <div className="cart-col cart_total fw-normal each-subtotal-price" data-cart-title="Total">
                            ₹{itemSubtotal.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="sidebar-cart-checkout">
                  <div className="sidebar-cart-checkout_inner">
                    <div className="total-order text-body-l mb-8">
                      <span className="fw-normal">Estimated total</span>
                      <div className="price-wrap gap-6">
                        <span className="total fw-normal each-total-price">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-save text-body-s fw-normal text-end mb-24">
                      Taxes and shipping calculated at checkout
                    </p>
                    <Link to="/checkout" className="tf-btn type-2 style-2 w-100 mb-16">
                      Check out
                    </Link>
                    <p className="text-center text-body-s cl-text-5 mb-24">
                      We support major secure payment methods.
                    </p>
                    <ul className="list-card justify-content-center">
                      <li className="card-item">
                        <img width="48" height="32" src="assets/images/payment/visa.svg" alt="card" />
                      </li>
                      <li className="card-item">
                        <img width="48" height="32" src="assets/images/payment/master.svg" alt="card"/>
                      </li>
                      <li className="card-item">
                        <img width="48" height="32" src="assets/images/payment/paypal.svg" alt="card"/>
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