import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";

import { API_BASE as API_BASE_CONFIG } from "../config";

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = `${API_BASE_CONFIG}/api`;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Orders
        const ordersRes = await authFetch(`${API_BASE}/orders`);
        const ordersData = await ordersRes.json();
        if (ordersRes.ok && ordersData.success) {
          setOrders(ordersData.orders);
        }

        // Fetch Addresses
        const addressRes = await authFetch(`${API_BASE}/addresses`);
        const addressData = await addressRes.json();
        if (addressRes.ok && addressData.success) {
          setAddresses(addressData.addresses);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalSpent = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  if (loading) {
    return (
      <main id="wrapper">
        <TopBar />
        <Header />
        <div className="container py-5 text-center">
          <h4 className="font-instrument_serif">Loading your dashboard...</h4>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main id="wrapper">
      <TopBar />
      <Header />

      <section className="flat-spacing-2">
        <div className="container">
          <div className="sect-heading mb-40 text-center text-lg-start">
            <h3 className="s-title font-instrument_serif">My Account Dashboard</h3>
            <p className="desc cl-text-5">Manage your profile details, track recent orders, and view delivery updates.</p>
          </div>

          <div className="row gy-30">
            {/* Left: User Details & Stats */}
            <div className="col-12 col-lg-4">
              {/* Profile Card */}
              <div className="card p-4 border border-light mb-30" style={{ borderRadius: "12px", backgroundColor: "#fcfcfc" }}>
                <h5 className="font-instrument_serif mb-20">Profile Information</h5>
                <div className="mb-12">
                  <span className="text-body-xs text-muted block mb-4">Full Name</span>
                  <p className="text-body-m fw-semibold mb-0">{user?.name}</p>
                </div>
                <div className="mb-12">
                  <span className="text-body-xs text-muted block mb-4">Email Address</span>
                  <p className="text-body-m mb-0">{user?.email}</p>
                </div>
                <div className="mb-20">
                  <span className="text-body-xs text-muted block mb-4">Mobile Number</span>
                  <p className="text-body-m mb-0">{user?.mobile}</p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="card p-4 border border-light mb-30" style={{ borderRadius: "12px", backgroundColor: "#003087", color: "#fff" }}>
                <h5 className="font-instrument_serif text-white mb-20">Statistics</h5>
                <div className="row">
                  <div className="col-6 mb-16">
                    <span className="text-body-xs text-light opacity-75">Total Orders</span>
                    <h3 className="text-white mt-4 font-instrument_serif">{orders.length}</h3>
                  </div>
                  <div className="col-6 mb-16">
                    <span className="text-body-xs text-light opacity-75">Total Spent</span>
                    <h3 className="text-white mt-4 font-instrument_serif">₹{totalSpent.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              {/* Addresses Box */}
              <div className="card p-4 border border-light" style={{ borderRadius: "12px", backgroundColor: "#fcfcfc" }}>
                <h5 className="font-instrument_serif mb-20">Saved Addresses</h5>
                {addresses.length === 0 ? (
                  <p className="text-body-s cl-text-5">No addresses saved yet.</p>
                ) : (
                  <div className="d-grid gap-16">
                    {addresses.map((addr, idx) => (
                      <div key={addr._id} className="pb-12 border-bottom border-light-2 last-border-0">
                        <p className="text-body-s fw-semibold mb-4">Address #{idx + 1}</p>
                        <p className="text-body-xs cl-text-5 mb-0">
                          {addr.street1}, {addr.street2 && addr.street2 + ", "}
                          {addr.district}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order History & Details */}
            <div className="col-12 col-lg-8">
              <div className="card p-4 border border-light" style={{ borderRadius: "12px", backgroundColor: "#fff" }}>
                <h5 className="font-instrument_serif mb-24">Order History</h5>
                
                {orders.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="cl-text-5 mb-16">You have not placed any orders yet.</p>
                    <Link to="/" className="tf-btn style-2 type-2">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="d-grid gap-24">
                    {orders.map((order) => (
                      <div 
                        key={order._id} 
                        className="p-20 border border-light" 
                        style={{ borderRadius: "8px", backgroundColor: "#fafafa" }}
                      >
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-16 gap-10">
                          <div>
                            <span className="text-body-xs text-muted block mb-4">Order Number</span>
                            <p className="text-body-m fw-semibold mb-0">{order.orderNumber}</p>
                          </div>
                          <div>
                            <span className="text-body-xs text-muted block mb-4">Date Placed</span>
                            <p className="text-body-m mb-0">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-body-xs text-muted block mb-4">Payment</span>
                            <span 
                              className={`badge px-10 py-4 font-normal text-body-xs`}
                              style={{ 
                                borderRadius: "4px",
                                backgroundColor: order.paymentStatus === "Paid" ? "#e6f7ff" : "#fff1f0",
                                color: order.paymentStatus === "Paid" ? "#1890ff" : "#ff4d4f",
                                border: `1px solid ${order.paymentStatus === "Paid" ? "#91d5ff" : "#ffa39e"}`
                              }}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-body-xs text-muted block mb-4">Delivery Status</span>
                            <span 
                              className={`badge px-10 py-4 font-normal text-body-xs`}
                              style={{ 
                                borderRadius: "4px",
                                backgroundColor: order.deliveryStatus === "Delivered" ? "#f6ffed" : "#fff7e6",
                                color: order.deliveryStatus === "Delivered" ? "#52c41a" : "#fa8c16",
                                border: `1px solid ${order.deliveryStatus === "Delivered" ? "#b7eb8f" : "#ffd591"}`
                              }}
                            >
                              {order.deliveryStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order Products List */}
                        <div className="br-line bg-line-5 mb-16"></div>
                        <div className="d-grid gap-12">
                          {order.products.map((item) => (
                            <div key={item._id} className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-12">
                                <img 
                                  src={item.productId?.images[0] || "assets/images/products/serum_product.png"} 
                                  alt={item.productId?.name}
                                  width="50" 
                                  height="60"
                                  style={{ objectFit: "cover", borderRadius: "4px" }}
                                />
                                <div>
                                  <p className="text-body-s fw-semibold mb-2">{item.productId?.name || "Product Name"}</p>
                                  <span className="text-body-xs cl-text-5">Size: {item.size} x {item.quantity}</span>
                                </div>
                              </div>
                              <span className="text-body-s fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="br-line bg-line-5 mt-16 mb-12"></div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-body-s text-muted">Total Price</span>
                          <span className="text-body-m fw-bold" style={{ color: "#003087" }}>
                            ₹{order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-end gap-12 mt-12 pt-12 border-top border-light-2">
                          <Link 
                            to={`/track-order/${order._id}`} 
                            className="tf-btn-line fw-semibold text-body-s text-primary text-decoration-none"
                          >
                            Track Order →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}
