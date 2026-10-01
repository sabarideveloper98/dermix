import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import { generateInvoice } from "../utils/generateInvoice";

import { API_BASE as API_BASE_CONFIG } from "../config";

export default function Orders() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  const API_BASE = `${API_BASE_CONFIG}/api`;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await authFetch(`${API_BASE}/orders`);
        const data = await res.json();
        if (res.ok && data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleDownloadInvoice = (order) => {
    generateInvoice(order, user);
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesNumber = order.orderNumber.toLowerCase().includes(query);
    const matchesProduct = order.products.some((item) =>
      item.productId?.name?.toLowerCase().includes(query)
    );
    return matchesNumber || matchesProduct;
  });

  return (
    <main id="wrapper">
      <TopBar />
      <Header />

      <section className="flat-spacing-2">
        <div className="container">
          <div className="sect-heading mb-40 text-center text-lg-start">
            <h3 className="s-title font-instrument_serif">Order History</h3>
            <p className="desc cl-text-5">Search and view details of your previous orders and check delivery status.</p>
          </div>

          <div className="row gy-30">
            {/* Left side: Orders Listing */}
            <div className="col-12 col-lg-8">
              <div className="card p-4 border border-light" style={{ borderRadius: "12px", backgroundColor: "#fff" }}>
                <div className="d-flex gap-3 mb-4 border-bottom pb-2">
                  <button
                    className={`btn btn-link text-decoration-none fw-semibold p-0 pb-2 ${activeTab === 'orders' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    style={{ borderBottomWidth: '3px', borderRadius: '0' }}
                    onClick={() => setActiveTab('orders')}
                  >
                    Order History
                  </button>
                  <button
                    className={`btn btn-link text-decoration-none fw-semibold p-0 pb-2 ms-3 ${activeTab === 'refunds' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                    style={{ borderBottomWidth: '3px', borderRadius: '0' }}
                    onClick={() => setActiveTab('refunds')}
                  >
                    Refund History
                  </button>
                </div>

                {activeTab === 'orders' && (
                  <>
                    <div className="mb-24">
                      <input
                        type="text"
                        className="form-control w-100"
                        placeholder="Search by Order Number or Product Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: "1px solid #ddd"
                        }}
                      />
                    </div>

                    {loading ? (
                      <p>Loading your orders...</p>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="cl-text-5 mb-16">No orders match your search.</p>
                        <Link to="/" className="tf-btn style-2 type-2">
                          Shop Products
                        </Link>
                      </div>
                    ) : (
                      <div className="d-grid gap-20">
                        {filteredOrders.map((order) => (
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
                                <span className="text-body-xs text-muted block mb-4">Status</span>
                                <div className="d-flex gap-8">
                                  <span
                                    className="badge px-10 py-4 font-normal text-body-xs"
                                    style={{
                                      borderRadius: "4px",
                                      backgroundColor: order.paymentStatus === "Paid" ? "#e6f7ff" : "#fff1f0",
                                      color: order.paymentStatus === "Paid" ? "#1890ff" : "#ff4d4f",
                                      border: `1px solid ${order.paymentStatus === "Paid" ? "#91d5ff" : "#ffa39e"}`
                                    }}
                                  >
                                    {order.paymentStatus}
                                  </span>
                                  <span
                                    className="badge px-10 py-4 font-normal text-body-xs"
                                    style={{
                                      borderRadius: "4px",
                                      backgroundColor: order.deliveryStatus === "Delivered" ? "#f6ffed" : order.deliveryStatus === "Cancelled" ? "#fff1f0" : "#fff7e6",
                                      color: order.deliveryStatus === "Delivered" ? "#52c41a" : order.deliveryStatus === "Cancelled" ? "#cf1322" : "#fa8c16",
                                      border: `1px solid ${order.deliveryStatus === "Delivered" ? "#b7eb8f" : order.deliveryStatus === "Cancelled" ? "#ffa39e" : "#ffd591"}`
                                    }}
                                  >
                                    {order.deliveryStatus}
                                  </span>
                                  {order.refundStatus && order.refundStatus !== 'None' && (
                                    <span
                                      className="badge px-10 py-4 font-normal text-body-xs ms-2"
                                      style={{
                                        borderRadius: "4px",
                                        backgroundColor: order.refundStatus === "Refunded" ? "#e6fffb" : "#fff0f6",
                                        color: order.refundStatus === "Refunded" ? "#08979c" : "#c41d7f",
                                        border: `1px solid ${order.refundStatus === "Refunded" ? "#87e8de" : "#ffadd2"}`
                                      }}
                                    >
                                      {order.refundStatus}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-16">
                              <p className="mb-0 text-body-m fw-bold" style={{ color: "#003087" }}>
                                ₹{order.totalPrice.toFixed(2)}
                              </p>
                              <div className="d-flex gap-16">
                                <button
                                  className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  View Details
                                </button>
                                <Link
                                  to={`/track-order/${order._id}`}
                                  className="tf-btn-line fw-semibold text-body-s text-primary"
                                >
                                  Track Order →
                                </Link>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleDownloadInvoice(order)}
                                >
                                  Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'refunds' && (
                  <div className="table-responsive">
                    <table className="table table-borderless align-middle" style={{ fontSize: "13px" }}>
                      <thead>
                        <tr className="border-bottom text-muted">
                          <th>Order ID</th>
                          <th>Order Amount</th>
                          <th>Refund Amount</th>
                          <th>Refund Status</th>
                          <th>Refund Date</th>
                          <th>Razorpay Refund ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.refundStatus && o.refundStatus !== 'None').length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">
                              No refund history found.
                            </td>
                          </tr>
                        ) : (
                          orders
                            .filter(o => o.refundStatus && o.refundStatus !== 'None')
                            .map((order) => (
                              <tr key={order._id} className="border-bottom">
                                <td className="fw-semibold">{order.orderNumber}</td>
                                <td>₹{order.totalPrice.toFixed(2)}</td>
                                <td className="text-primary fw-semibold">₹{(order.refundAmount || 0).toFixed(2)}</td>
                                <td>
                                  <span
                                    className={`badge px-10 py-4 font-normal text-body-xs`}
                                    style={{
                                      borderRadius: "4px",
                                      backgroundColor: order.refundStatus === "Refunded" ? "#e6fffb" : "#fff0f6",
                                      color: order.refundStatus === "Refunded" ? "#08979c" : "#c41d7f",
                                      border: `1px solid ${order.refundStatus === "Refunded" ? "#87e8de" : "#ffadd2"}`
                                    }}
                                  >
                                    {order.refundStatus}
                                  </span>
                                </td>
                                <td>{order.refundDate ? new Date(order.refundDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="text-secondary">{order.refundId || order.razorpayRefundId || 'N/A'}</td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Detailed Order Panel (Shows detail view of selectedOrder) */}
            <div className="col-12 col-lg-4">
              {selectedOrder ? (
                <div className="card p-4 border border-light" style={{ borderRadius: "12px", backgroundColor: "#fcfcfc" }}>
                  <div className="d-flex justify-content-between align-items-center mb-20 border-bottom border-light-2 pb-12">
                    <h5 className="font-instrument_serif mb-0">Order Details</h5>
                    <button className="btn p-0 border-0 text-muted" onClick={() => setSelectedOrder(null)}>✕</button>
                  </div>

                  <div className="mb-16">
                    <span className="text-body-xs text-muted block mb-4">Order Number</span>
                    <p className="text-body-m fw-semibold mb-0">{selectedOrder.orderNumber}</p>
                  </div>

                  <div className="mb-16">
                    <span className="text-body-xs text-muted block mb-4">Shipping Address</span>
                    <p className="text-body-s cl-text-5 mb-0">
                      {selectedOrder.addressId?.street1}, {selectedOrder.addressId?.street2 && selectedOrder.addressId.street2 + ", "}
                      {selectedOrder.addressId?.district}, {selectedOrder.addressId?.state} - {selectedOrder.addressId?.pincode}
                    </p>
                  </div>

                  <div className="mb-20">
                    <span className="text-body-xs text-muted block mb-8">Items Ordered</span>
                    <div className="d-grid gap-12">
                      {selectedOrder.products.map((item) => (
                        <div key={item._id} className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-10">
                            <img
                              src={item.productId?.images[0] || "assets/images/products/serum_product.png"}
                              alt={item.productId?.name}
                              width="40"
                              height="48"
                              style={{ objectFit: "cover", borderRadius: "4px" }}
                            />
                            <div>
                              <p className="text-body-s fw-semibold mb-0" style={{ fontSize: "13px" }}>{item.productId?.name || "Product Name"}</p>
                              <span className="text-body-xs text-muted">Size: {item.size} x {item.quantity}</span>
                            </div>
                          </div>
                          <span className="text-body-s fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-16 border-top border-light-2 d-flex justify-content-between align-items-center">
                    <span className="text-body-s text-muted font-bold">Total Paid</span>
                    <span className="text-body-m fw-bold text-primary">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>

                  {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'None' && (
                    <div className="mt-16 pt-16 border-top border-light-2" style={{ fontSize: "13px", color: "#333" }}>
                      <span className="text-body-xs text-muted block mb-8 fw-semibold">Refund Details</span>
                      <p className="mb-4"><strong>Refund Status:</strong> <span className="text-info fw-bold">{selectedOrder.refundStatus}</span></p>
                      {selectedOrder.refundStatus === 'Refunded' && (
                        <>
                          <p className="mb-4"><strong>Refund Amount:</strong> ₹{(selectedOrder.refundAmount || 0).toFixed(2)}</p>
                          <p className="mb-4"><strong>Refund Date:</strong> {selectedOrder.refundDate ? new Date(selectedOrder.refundDate).toLocaleDateString() : 'N/A'}</p>
                          <p className="mb-0"><strong>Refund Transaction ID:</strong> {selectedOrder.refundId || selectedOrder.razorpayRefundId || 'N/A'}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-4 border border-light text-center py-5" style={{ borderRadius: "12px", backgroundColor: "#fcfcfc", borderStyle: "dashed" }}>
                  <p className="cl-text-5 mb-0">Select an order to view full shipping details and product list.</p>
                </div>
              )}
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
