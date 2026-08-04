import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import { API_BASE as API_BASE_CONFIG } from "../config";

export default function CheckoutContent() {
  const { user, authFetch } = useAuth();
  const { cart, clearCart, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Customer Information fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");

  // Address Form State
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [addressError, setAddressError] = useState("");

  const API_BASE = `${API_BASE_CONFIG}/api`;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
    }
  }, [user, navigate]);

  // Sync logged in user info
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
    }
  }, [user]);

  // Load Razorpay Script and user addresses
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    if (user) {
      fetchAddresses();
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await authFetch(`${API_BASE}/addresses`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          handleAddressSelect(data.addresses[0]);
        }
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
  };

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr._id);
    setStreet1(addr.street1 || "");
    setStreet2(addr.street2 || "");
    setDistrict(addr.district || "");
    setState(addr.state || "");
    setPincode(addr.pincode || "");
    setLandmark(addr.landmark || "");
    setShowNewAddressForm(false);
  };

  const handleAddNewAddressClick = () => {
    setSelectedAddressId("");
    setStreet1("");
    setStreet2("");
    setDistrict("");
    setState("");
    setPincode("");
    setLandmark("");
    setShowNewAddressForm(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError("");
    setLoading(true);

    try {
      const isEditing = selectedAddressId && addresses.some(a => a._id === selectedAddressId);
      const url = isEditing ? `${API_BASE}/addresses/${selectedAddressId}` : `${API_BASE}/addresses`;
      const method = isEditing ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        body: JSON.stringify({ street1, street2, district, state, pincode, landmark }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (isEditing) {
          setAddresses(addresses.map(a => a._id === selectedAddressId ? data.address : a));
        } else {
          setAddresses([data.address, ...addresses]);
          setSelectedAddressId(data.address._id);
        }
        setShowNewAddressForm(false);
      } else {
        setAddressError(data.message || "Failed to save address");
      }
    } catch (err) {
      setAddressError("Server error saving address");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validate Customer Details
    if (!name.trim()) {
      setValidationError("Full Name is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setValidationError("Please enter a valid 10-digit mobile number");
      return;
    }

    // Validate Shipping Address Form
    if (!street1.trim()) {
      setValidationError("Street 1 (House No, Building, Area) is required");
      return;
    }
    if (!district.trim()) {
      setValidationError("District / City is required");
      return;
    }
    if (!state.trim()) {
      setValidationError("State is required");
      return;
    }
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      setValidationError("Please enter a valid 6-digit pincode");
      return;
    }

    if (user && !selectedAddressId) {
      setValidationError("Please select or save a shipping address first");
      return;
    }

    setLoading(true);

    try {
      let payload = {};
      if (user) {
        payload = { addressId: selectedAddressId };
      } else {
        payload = {
          name,
          email,
          mobile,
          street1,
          street2,
          district,
          state,
          pincode,
          landmark,
          items: cart.items.map((item) => ({
            productId: item.productId._id || item.productId,
            quantity: item.quantity,
            size: item.size,
          })),
        };
      }

      // 1. Create order in backend
      const orderRes = await authFetch(`${API_BASE}/orders`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to place order");
      }

      const order = orderData.order;

      // 2. Create Razorpay Payment Order
      const rzpRes = await authFetch(`${API_BASE}/payments/razorpay/create-order`, {
        method: "POST",
        body: JSON.stringify({ orderId: order._id }),
      });
      const rzpData = await rzpRes.json();

      if (!rzpRes.ok || !rzpData.success) {
        throw new Error(rzpData.message || "Failed to create payment gateway order");
      }

      const rzpOrder = rzpData.razorpayOrder;

      // 3. Launch Razorpay Gateway Modal
      const options = {
        key: "rzp_test_TIpu5U4jYaChIu", // Test Key ID
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Dermix E-Commerce",
        description: `Order Purchase - #${order.orderNumber}`,
        order_id: rzpOrder.id,
        handler: async function (response) {
          // 4. Verify Payment on Success
          try {
            const verifyRes = await authFetch(`${API_BASE}/payments/razorpay/verify`, {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              clearCart();
              navigate("/order-success", {
                state: {
                  orderNumber: order.orderNumber,
                  paymentId: response.razorpay_payment_id,
                  amount: order.totalPrice,
                  deliveryStatus: order.deliveryStatus || "Pending"
                }
              });
            } else {
              console.error("Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: mobile,
        },
        theme: {
          color: "#003087", // Dermix premium theme blue
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error.description);
      });

    } catch (err) {
      console.error("Error processing order check out:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4 className="font-instrument_serif mb-16">Your Cart is Empty</h4>
        <p className="cl-text-5 mb-24">Please add products to your cart before checking out.</p>
        <Link to="/" className="tf-btn style-2 type-2">Shop Catalog</Link>
      </div>
    );
  }

  return (
    <>
      <div className="tf-page-checkout position-relative">
        <span className="br-line fake-class top-0 bg-line-5"></span>
        <div className="col-left flat-spacing-2">
          <div className="content-left">
            <h4 className="font-instrument_serif mb-24">Shipping Address</h4>

            {/* Address Selection Grid (Only if logged in) */}
            {user && (
              <div className="address-selection mb-24">
                {addresses.length === 0 ? (
                  <p className="cl-text-5 mb-16">No saved addresses found. Please add a new address below.</p>
                ) : (
                  <div className="row gy-3">
                    {addresses.map((addr) => (
                      <div key={addr._id} className="col-12 col-md-6">
                        <div
                          className={`card p-3 h-100 ${selectedAddressId === addr._id ? 'border-primary' : 'border-light'}`}
                          style={{
                            cursor: 'pointer',
                            border: selectedAddressId === addr._id ? '2px solid #003087' : '1px solid #ddd',
                            borderRadius: '8px'
                          }}
                          onClick={() => handleAddressSelect(addr)}
                        >
                          <div className="d-flex align-items-start">
                            <input
                              type="radio"
                              name="selectedAddress"
                              className="mr-10 mt-4"
                              checked={selectedAddressId === addr._id}
                              onChange={() => handleAddressSelect(addr)}
                              style={{ accentColor: '#003087' }}
                            />
                            <div>
                              <p className="mb-1 text-body-s fw-semibold">{addr.street1}</p>
                              {addr.street2 && <p className="mb-1 text-body-s">{addr.street2}</p>}
                              <p className="mb-1 text-body-s cl-text-5">
                                {addr.district}, {addr.state} - {addr.pincode}
                              </p>
                              {addr.landmark && <p className="mb-0 text-body-xs italic text-muted">Landmark: {addr.landmark}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Toggle New Address Form Button (Only if logged in) */}
            {user && (
              <div className="mb-24">
                {!showNewAddressForm ? (
                  <button
                    type="button"
                    className="tf-btn type-2 style-2 btn-light"
                    onClick={handleAddNewAddressClick}
                  >
                    Add New Address +
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tf-btn type-2 style-2 btn-light"
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Use Saved Address
                  </button>
                )}
              </div>
            )}

            {/* Address Input Form */}
            <div className="card p-4 border border-light mb-24" style={{ borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
              <h6 className="font-instrument_serif mb-16">
                {user ? (selectedAddressId && !showNewAddressForm ? "Edit Shipping Address" : "Add Shipping Address") : "Shipping Address"}
              </h6>

              <form onSubmit={handleAddAddress}>
                {addressError && <div className="alert alert-danger p-2 fs-14 mb-3">{addressError}</div>}
                <div className="row gy-3">
                  <div className="col-12">
                    <fieldset className="tf-field">
                      <label className="text-body-xs">Street 1 (House No, Building, Area)*</label>
                      <input className="style-4" type="text" value={street1} onChange={(e) => setStreet1(e.target.value)} required />
                    </fieldset>
                  </div>
                  <div className="col-12">
                    <fieldset className="tf-field">
                      <label className="text-body-xs">Street 2 (Apartment, Suite, Unit)</label>
                      <input className="style-4" type="text" value={street2} onChange={(e) => setStreet2(e.target.value)} />
                    </fieldset>
                  </div>
                  <div className="col-12 col-md-6">
                    <fieldset className="tf-field">
                      <label className="text-body-xs">District / City*</label>
                      <input className="style-4" type="text" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                    </fieldset>
                  </div>
                  <div className="col-12 col-md-6">
                    <fieldset className="tf-field">
                      <label className="text-body-xs">State*</label>
                      <input className="style-4" type="text" value={state} onChange={(e) => setState(e.target.value)} required />
                    </fieldset>
                  </div>
                  <div className="col-12 col-md-6">
                    <fieldset className="tf-field">
                      <label className="text-body-xs">Pincode*</label>
                      <input className="style-4" type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    </fieldset>
                  </div>
                  <div className="col-12 col-md-6">
                    <fieldset className="tf-field">
                      <label className="text-body-xs">Landmark</label>
                      <input className="style-4" type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                    </fieldset>
                  </div>
                </div>

                {/* Only show address update/save button for logged in user */}
                {user && (
                  <button type="submit" className="tf-btn style-2 w-100 mt-24" disabled={loading}>
                    {loading ? "Saving Address..." : (selectedAddressId && !showNewAddressForm ? "Update Shipping Address" : "Save Shipping Address")}
                  </button>
                )}
              </form>
            </div>

            {/* Place Order Trigger */}
            <form onSubmit={handlePlaceOrder} className="mt-24">
              {validationError && (
                <div className="alert alert-danger p-2 fs-14 mb-3" style={{ borderRadius: '6px' }}>
                  {validationError}
                </div>
              )}
              <button
                type="submit"
                className="tf-btn style-2 w-100"
                disabled={loading}
              >
                {loading ? "Processing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-right flat-spacing-2">
          <div className="content-right sticky-top">
            <h4 className="font-instrument_serif mb-24">Order Summary</h4>
            <ul className="list-order-product">
              {cart.items.map((item) => {
                const prod = item.productId;
                if (!prod) return null;

                return (
                  <li key={`${prod._id}-${item.size}`} className="order-item">
                    <Link to={`/ProductDetails?id=${prod._id}`} className="img-prd">
                      <img
                        loading="lazy"
                        width="74"
                        height="88"
                        src={prod.images[0] || "assets/images/products/serum_product.png"}
                        alt={prod.name}
                      />
                      <span className="prd_quanitty text-body-s">{item.quantity}</span>
                    </Link>
                    <div className="infor-prd">
                      <Link to={`/ProductDetails?id=${prod._id}`} className="prd_name fw-normal link-underline text-line-clamp-1">
                        {prod.name}
                      </Link>
                      <p className="prd_size cl-text-5">Size: {item.size}</p>
                      <div className="price-wrap fw-normal gap-6 mb-8">
                        <span className="price-new text-primary">₹{prod.salePrice}</span>
                      </div>
                      <div className="group-action d-flex align-items-center gap-12 mt-8">
                        <div className="wg-quantity style-2" style={{ scale: '0.8', transformOrigin: 'left center' }}>
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
                          className="tf-btn-rounded style-2 remove p-0 bg-transparent border-0"
                          onClick={() => removeFromCart(prod._id, item.size)}
                          style={{ cursor: 'pointer', color: '#db4444' }}
                        >
                          <i className="icon icon-Trash" style={{ fontSize: '18px' }}></i>
                        </button>
                      </div>
                    </div>
                    <div className="prd_price fw-normal">
                      ₹{(prod.salePrice * item.quantity).toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>

            <ul className="box-total mt-24">
              <li className="fw-normal">
                <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{cart.totalAmount.toFixed(2)}</span>
              </li>
              <li className="fw-normal">
                <span>Shipping</span>
                <span>FREE</span>
              </li>
              <li>
                <p className="d-grid">
                  <span className="fw-normal mb-8 text-body-l">Total</span>
                </p>
                <span className="fw-normal" style={{ fontSize: '20px', color: '#003087', fontWeight: 'bold' }}>
                  ₹{cart.totalAmount.toFixed(2)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}