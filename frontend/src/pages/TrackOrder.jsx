import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";

import { API_BASE as API_BASE_CONFIG } from "../config";

export default function TrackOrder() {
  const { orderId } = useParams();
  const { authFetch } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = `${API_BASE_CONFIG}/api`;

  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/track/${orderId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "Failed to fetch tracking details");
        }
      } catch (err) {
        console.error("Tracking fetch error:", err);
        setError("Server error fetching tracking details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderTracking();
  }, [orderId]);

  const stages = [
    { name: "Order Placed", description: "Your order has been recorded in our system." },
    { name: "Payment Confirmed", description: "Payment verified successfully." },
    { name: "Processing", description: "Our team is preparing your skincare package." },
    { name: "Packed", description: "Items have been packed and ready for carrier pickup." },
    { name: "Shipped", description: "Order is in transit with our logistics partner." },
    { name: "Out For Delivery", description: "Courier is delivering to your address today." },
    { name: "Delivered", description: "SKU packages successfully handed over." },
  ];

  const getStageIndex = (delStatus, payStatus) => {
    if (delStatus === "Cancelled") return -1;

    const statusMap = {
      "Pending": 0,
      "Confirmed": 1,
      "Processing": 2,
      "Packed": 3,
      "Shipped": 4,
      "Out For Delivery": 5,
      "Delivered": 6,
    };

    let index = statusMap[delStatus] ?? 0;

    if (payStatus === "Paid" && index < 1) {
      index = 1;
    }
    return index;
  };

  const currentStageIndex = order ? getStageIndex(order.deliveryStatus, order.paymentStatus) : 0;

  return (
    <main id="wrapper">
      <TopBar />
      <Header />

      <section className="flat-spacing-2">
        <div className="container">
          <div className="sect-heading mb-40 text-center text-lg-start">
            <h3 className="s-title font-instrument_serif">Order Tracking</h3>
            <p className="desc cl-text-5">Real-time status updates of your shipment.</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <p>Fetching order status...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">
              <h5 className="mb-16">Tracking Details Unavailable</h5>
              <p className="mb-24">{error}</p>
              <Link to="/myaccount" className="tf-btn style-2 type-2 btn-light">Go to My Account</Link>
            </div>
          ) : (
            <div className="row gy-40">
              {/* Left: Interactive Timeline */}
              <div className="col-12 col-md-6">
                <div className="card p-4 border border-light" style={{ borderRadius: "12px", backgroundColor: "#fff" }}>
                  <h5 className="font-instrument_serif mb-24 pb-12 border-bottom border-light-2">Shipment Progress</h5>
                  
                  {order.deliveryStatus === "Cancelled" ? (
                    <div className="alert alert-danger mb-0">
                      <strong>Order Cancelled:</strong> This order was cancelled and tracking is inactive.
                    </div>
                  ) : (
                    <div className="position-relative pl-24">
                      {/* Line connecting stages */}
                      <div 
                        className="position-absolute" 
                        style={{
                          left: "8px",
                          top: "20px",
                          bottom: "20px",
                          width: "2px",
                          backgroundColor: "#f0f0f0",
                          zIndex: 1
                        }}
                      ></div>

                      {stages.map((stage, idx) => {
                        const isCompleted = idx <= currentStageIndex;
                        const isCurrent = idx === currentStageIndex;

                        return (
                          <div key={idx} className="d-flex mb-24 position-relative align-items-start" style={{ zIndex: 2 }}>
                            {/* Circle Pin */}
                            <div 
                              className="d-flex align-items-center justify-content-center rounded-circle mr-16"
                              style={{
                                width: "18px",
                                height: "18px",
                                minWidth: "18px",
                                backgroundColor: isCompleted ? "#52c41a" : "#fff",
                                border: `2px solid ${isCompleted ? "#52c41a" : "#d9d9d9"}`,
                                outline: isCurrent ? "4px solid rgba(82, 196, 26, 0.15)" : "none",
                                fontSize: "10px",
                                color: "#fff",
                                fontWeight: "bold",
                                marginTop: "3px"
                              }}
                            >
                              {isCompleted && "✓"}
                            </div>
                            
                            <div>
                              <p className={`mb-4 text-body-s fw-semibold ${isCompleted ? 'text-dark' : 'text-muted'}`}>
                                {stage.name}
                              </p>
                              <span className="text-body-xs text-muted block">{stage.description}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Order Summary Details */}
              <div className="col-12 col-md-6">
                <div className="card p-4 border border-light" style={{ borderRadius: "12px", backgroundColor: "#fcfcfc" }}>
                  <h5 className="font-instrument_serif mb-20 pb-12 border-bottom border-light-2">Order Information</h5>

                  <div className="row gy-3 mb-24">
                    <div className="col-6">
                      <span className="text-body-xs text-muted block mb-4">Order Number</span>
                      <p className="text-body-m fw-semibold mb-0">{order.orderNumber}</p>
                    </div>
                    <div className="col-6">
                      <span className="text-body-xs text-muted block mb-4">Placed Date</span>
                      <p className="text-body-m mb-0">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="col-12">
                      <span className="text-body-xs text-muted block mb-4">Delivery Address</span>
                      <p className="text-body-s mb-0">
                        {order.addressId?.street1}, {order.addressId?.street2 && order.addressId.street2 + ", "}
                        {order.addressId?.district}, {order.addressId?.state} - {order.addressId?.pincode}
                      </p>
                    </div>
                  </div>

                  <h6 className="font-instrument_serif mb-16">Products Purchased</h6>
                  <div className="d-grid gap-16 mb-24">
                    {order.products.map((item) => (
                      <div key={item._id} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-12">
                          <img
                            src={item.productId?.images[0] || "assets/images/products/serum_product.png"}
                            alt={item.productId?.name}
                            width="48"
                            height="56"
                            style={{ objectFit: "cover", borderRadius: "4px" }}
                          />
                          <div>
                            <p className="text-body-s fw-semibold mb-2">{item.productId?.name}</p>
                            <span className="text-body-xs text-muted">Size: {item.size} x {item.quantity}</span>
                          </div>
                        </div>
                        <span className="text-body-s fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-16 border-top border-light-2 d-flex justify-content-between align-items-center">
                    <span className="text-body-s text-muted">Amount Paid</span>
                    <span className="text-body-m fw-bold text-primary">₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
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
