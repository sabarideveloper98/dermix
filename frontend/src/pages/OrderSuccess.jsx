import { useLocation, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";

export default function OrderSuccess() {
  const location = useLocation();
  const { orderNumber, paymentId, amount } = location.state || {};

  return (
    <main id="wrapper">
      <TopBar />
      <Header />

      <section className="flat-spacing-2">
        <div className="container text-center py-5">
          <div className="mb-30 d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style={{ width: "80px", height: "80px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h2 className="font-instrument_serif mb-16">✓ Order Placed Successfully</h2>
          <h4 className="text-muted fw-normal mb-30">Thank you for your purchase.</h4>

          <div className="card mx-auto p-4 border border-light mb-40 text-start" style={{ maxWidth: "500px", borderRadius: "12px", backgroundColor: "#fcfcfc" }}>
            <h6 className="font-instrument_serif mb-16 pb-12 border-bottom border-light-2">Order Confirmation Summary</h6>
            {orderNumber && (
              <div className="d-flex justify-content-between mb-10 text-body-s">
                <span className="text-muted">Order Number</span>
                <span className="fw-semibold">{orderNumber}</span>
              </div>
            )}
            {paymentId && (
              <div className="d-flex justify-content-between mb-10 text-body-s">
                <span className="text-muted">Transaction ID</span>
                <span className="fw-semibold text-break">{paymentId}</span>
              </div>
            )}
            {amount && (
              <div className="d-flex justify-content-between mb-10 text-body-s">
                <span className="text-muted">Order Amount</span>
                <span className="fw-bold text-primary">₹{amount.toFixed(2)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between text-body-s">
              <span className="text-muted">Delivery Status</span>
              <span className="fw-semibold text-success">{location.state?.deliveryStatus || "Pending"}</span>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-16">
            <Link to="/" className="tf-btn style-2 type-2 btn-light">
              Continue Shopping
            </Link>
            <Link to="/myorders" className="tf-btn type-2 style-2">
              My Orders
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}
