import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import { useCart } from "../context/CartContext.jsx";
import { API_BASE } from "../config.js";

export default function PaymentResponse() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [verificationData, setVerificationData] = useState(null);

  // Extract return parameters from URL query string or route state
  const orderId =
    searchParams.get("oid") ||
    searchParams.get("order_id") ||
    searchParams.get("id") ||
    location.state?.order_id ||
    sessionStorage.getItem("lastShiprocketOrderId") ||
    "";

  const ostParam =
    searchParams.get("ost") ||
    searchParams.get("status") ||
    location.state?.status ||
    "";

  const txnIdParam =
    searchParams.get("txn_id") ||
    searchParams.get("payment_id") ||
    searchParams.get("transactionId") ||
    "";

  const verifyPayment = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      if (!orderId) {
        setError(
          "No Order ID found in return parameters. Unable to locate transaction details."
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const query = new URLSearchParams({
          order_id: orderId,
          ...(ostParam ? { ost: ostParam } : {}),
          ...(txnIdParam ? { txn_id: txnIdParam } : {})
        });

        const res = await fetch(`${API_BASE}/checkout/verify-payment?${query.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token")
              ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
              : {})
          }
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(
            data?.message || "Unable to verify payment status with server. Please try refreshing."
          );
        } else {
          setVerificationData(data);
          // If payment is successfully verified, clear cart
          if (data.paymentStatus === "Paid" || data.orderStatus === "SUCCESS") {
            try {
              if (clearCart) clearCart();
              sessionStorage.removeItem("lastShiprocketOrderId");
            } catch (clearErr) {
              console.warn("Cart clear notification:", clearErr.message);
            }
          }
        }
      } catch (err) {
        console.error("Payment verification failure:", err);
        setError("Network connection issue while verifying payment. Please refresh the page.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId, ostParam, txnIdParam, clearCart]
  );

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  // Determine effective status
  const effectivePaymentStatus =
    verificationData?.paymentStatus ||
    (ostParam && ostParam.toUpperCase() === "SUCCESS"
      ? "Paid"
      : ostParam && ostParam.toUpperCase() === "FAILED"
      ? "Failed"
      : "Pending");

  const payment = verificationData?.paymentDetails || {};
  const order = verificationData?.orderDetails || {};

  return (
    <main id="wrapper">
      <TopBar />
      <Header />

      <section className="flat-spacing-2" style={{ minHeight: "65vh" }}>
        <div className="container py-4">
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
                style={{ width: "3.5rem", height: "3.5rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="font-instrument_serif mb-2">Verifying Payment Status</h4>
              <p className="text-muted">
                Connecting securely with Shiprocket to confirm your transaction details...
              </p>
            </div>
          ) : error && !verificationData ? (
            <div className="text-center py-5">
              <div
                className="mb-4 d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle"
                style={{ width: "80px", height: "80px" }}
              >
                <i className="icon icon-Close fs-36" style={{ fontSize: "36px" }}></i>
              </div>
              <h3 className="font-instrument_serif text-danger mb-2">Payment Verification Error</h3>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: "500px" }}>
                {error}
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button
                  onClick={() => verifyPayment(true)}
                  className="tf-btn style-2"
                  disabled={refreshing}
                >
                  {refreshing ? "Checking..." : "Retry Verification"}
                </button>
                <Link to="/checkout" className="tf-btn style-2 type-2 btn-light">
                  Return to Checkout
                </Link>
              </div>
            </div>
          ) : (
            <div className="mx-auto" style={{ maxWidth: "780px" }}>
              {/* Header Status Banner */}
              <div className="text-center mb-4">
                {effectivePaymentStatus === "Paid" && (
                  <>
                    <div
                      className="mb-3 d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <h2 className="font-instrument_serif text-success mb-2">
                      Payment Successful
                    </h2>
                    <p className="text-muted fs-16">
                      Thank you! Your payment was verified and your order has been confirmed.
                    </p>
                  </>
                )}

                {effectivePaymentStatus === "Failed" && (
                  <>
                    <div
                      className="mb-3 d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                    <h2 className="font-instrument_serif text-danger mb-2">
                      Payment Failed
                    </h2>
                    <p className="text-muted fs-16">
                      {payment.failureReason ||
                        "Your transaction could not be completed by the payment provider."}
                    </p>
                  </>
                )}

                {effectivePaymentStatus === "Pending" && (
                  <>
                    <div
                      className="mb-3 d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <h2 className="font-instrument_serif text-warning mb-2">
                      Payment Pending
                    </h2>
                    <p className="text-muted fs-16">
                      Your payment is currently being processed by the gateway.
                    </p>
                  </>
                )}
              </div>

              {/* Payment Information Card */}
              <div
                className="card border border-light p-4 mb-4"
                style={{ borderRadius: "12px", backgroundColor: "#ffffff", boxShadow: "0 4px 18px rgba(0,0,0,0.04)" }}
              >
                <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom border-light-2">
                  <h5 className="font-instrument_serif mb-0">Payment Details</h5>
                  <span
                    className={`badge ${
                      effectivePaymentStatus === "Paid"
                        ? "bg-success"
                        : effectivePaymentStatus === "Failed"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    } px-3 py-2 fs-12`}
                    style={{ borderRadius: "20px" }}
                  >
                    {effectivePaymentStatus === "Paid"
                      ? "PAID"
                      : effectivePaymentStatus === "Failed"
                      ? "FAILED"
                      : "PENDING"}
                  </span>
                </div>

                <div className="row gy-2 text-body-s">
                  <div className="col-sm-6 d-flex justify-content-between">
                    <span className="text-muted">Payment Status:</span>
                    <span className="fw-semibold">
                      {payment.status || effectivePaymentStatus}
                    </span>
                  </div>
                  {payment.transactionId && (
                    <div className="col-sm-6 d-flex justify-content-between">
                      <span className="text-muted">Transaction ID:</span>
                      <span className="fw-semibold text-break">
                        {payment.transactionId}
                      </span>
                    </div>
                  )}
                  {payment.paymentReferenceId && (
                    <div className="col-sm-6 d-flex justify-content-between">
                      <span className="text-muted">Reference ID:</span>
                      <span className="fw-semibold text-break">
                        {payment.paymentReferenceId}
                      </span>
                    </div>
                  )}
                  {payment.paymentMethod && (
                    <div className="col-sm-6 d-flex justify-content-between">
                      <span className="text-muted">Payment Method:</span>
                      <span className="fw-semibold">
                        {payment.paymentMethod}
                      </span>
                    </div>
                  )}
                  <div className="col-sm-6 d-flex justify-content-between">
                    <span className="text-muted">Payment Amount:</span>
                    <span className="fw-bold text-primary">
                      ₹{Number(payment.paymentAmount || order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  {payment.paymentDate && (
                    <div className="col-sm-6 d-flex justify-content-between">
                      <span className="text-muted">Payment Date:</span>
                      <span className="fw-semibold">
                        {new Date(payment.paymentDate).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {payment.gateway && (
                    <div className="col-sm-6 d-flex justify-content-between">
                      <span className="text-muted">Gateway:</span>
                      <span className="fw-semibold">{payment.gateway}</span>
                    </div>
                  )}
                  {payment.gatewayResponse && (
                    <div className="col-sm-6 d-flex justify-content-between">
                      <span className="text-muted">Gateway Status:</span>
                      <span className="fw-semibold">{payment.gatewayResponse}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Information Card */}
              <div
                className="card border border-light p-4 mb-4"
                style={{ borderRadius: "12px", backgroundColor: "#ffffff", boxShadow: "0 4px 18px rgba(0,0,0,0.04)" }}
              >
                <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom border-light-2">
                  <h5 className="font-instrument_serif mb-0">Order Summary</h5>
                  {order.orderNumber && (
                    <span className="text-muted fs-13">
                      Order #: <strong className="text-dark">{order.orderNumber}</strong>
                    </span>
                  )}
                </div>

                {/* Customer Details */}
                <div className="row gy-2 pb-3 mb-3 border-bottom border-light-2 text-body-s">
                  {order.customerName && (
                    <div className="col-sm-4">
                      <span className="text-muted d-block fs-12">Customer Name</span>
                      <span className="fw-semibold">{order.customerName}</span>
                    </div>
                  )}
                  {order.customerEmail && (
                    <div className="col-sm-4">
                      <span className="text-muted d-block fs-12">Email Address</span>
                      <span className="fw-semibold text-break">{order.customerEmail}</span>
                    </div>
                  )}
                  {order.customerMobile && (
                    <div className="col-sm-4">
                      <span className="text-muted d-block fs-12">Mobile Number</span>
                      <span className="fw-semibold">{order.customerMobile}</span>
                    </div>
                  )}
                </div>

                {/* Ordered Products List */}
                {Array.isArray(order.products) && order.products.length > 0 && (
                  <div className="mb-3">
                    <h6 className="fs-14 fw-semibold text-muted mb-2">Ordered Products</h6>
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead className="table-light fs-12 text-muted">
                          <tr>
                            <th>Product</th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Price</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.products.map((item, idx) => (
                            <tr key={idx} className="fs-14">
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      width="42"
                                      height="42"
                                      style={{ objectFit: "cover", borderRadius: "6px" }}
                                    />
                                  )}
                                  <span className="fw-medium">{item.name}</span>
                                </div>
                              </td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-end">₹{Number(item.price).toFixed(2)}</td>
                              <td className="text-end fw-semibold">
                                ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totals Breakdown */}
                <div className="pt-2 border-top border-light-2">
                  <div className="d-flex justify-content-between mb-2 fs-14">
                    <span className="text-muted">Subtotal</span>
                    <span>₹{Number(order.subtotalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 fs-14">
                    <span className="text-muted">Shipping Charges</span>
                    <span>
                      {Number(order.shippingCharges || 0) > 0
                        ? `₹${Number(order.shippingCharges).toFixed(2)}`
                        : "FREE"}
                    </span>
                  </div>
                  {Number(order.discountAmount || 0) > 0 && (
                    <div className="d-flex justify-content-between mb-2 fs-14 text-success">
                      <span>Discount</span>
                      <span>-₹{Number(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between pt-2 border-top fs-16 fw-bold">
                    <span>Final Payable Amount</span>
                    <span className="text-primary fs-18">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                {effectivePaymentStatus === "Paid" && (
                  <>
                    <Link to="/" className="tf-btn style-2 type-2 btn-light">
                      Continue Shopping
                    </Link>
                    <Link to="/myorders" className="tf-btn style-2">
                      View My Orders
                    </Link>
                  </>
                )}

                {effectivePaymentStatus === "Failed" && (
                  <>
                    <Link to="/checkout" className="tf-btn style-2">
                      Retry Payment
                    </Link>
                    <Link to="/cart" className="tf-btn style-2 type-2 btn-light">
                      Return to Cart
                    </Link>
                  </>
                )}

                {effectivePaymentStatus === "Pending" && (
                  <>
                    <button
                      onClick={() => verifyPayment(true)}
                      className="tf-btn style-2"
                      disabled={refreshing}
                    >
                      {refreshing ? "Refreshing..." : "Refresh Payment Status"}
                    </button>
                    <Link to="/" className="tf-btn style-2 type-2 btn-light">
                      Continue Shopping
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}
