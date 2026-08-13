import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";
import { generateInvoice } from "../utils/generateInvoice";

export default function Orders() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${API_BASE}/api/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const handleDownloadInvoice = (order) => {
        generateInvoice(order, user);
    };

    if (!user) return null;

    return (
        <>
        {/* Page Title */}
        <section className="tf-page-heading_account flat-spacing">
            <div className="container">
                <Link to="/myaccount" className="content d-inline-flex">
                    <div className="account-icon d-flex">
                        <i className="icon icon-ArrowLeft fs-24"></i>
                    </div>
                    <div className="account-infor">
                        <h3 className="info_name font-instrument_serif mb-8">
                            My Orders
                        </h3>
                        <p className="info_more cl-text-5">
                            View and track your order history
                        </p>
                    </div>
                </Link>
            </div>
        </section>
        {/* Page Title */}

         {/* Account  */}
         <div className="flat-spacing-2">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 col-xl-3 d-none">
                        <div className="sidebar-account-wrap sidebar-content-wrap">
                            <div className="my-account-nav">
                                <Link to="/myaccount" className="link-account">
                                    <i className="icon icon-Dashboard fs-20"></i>
                                    <span className="text fw-normal">
                                        My Account
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </Link>
                                <Link to="/myorders" className="link-account active">
                                    <i className="icon icon-Box fs-20"></i>
                                    <span className="text fw-normal">
                                        My Orders
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </Link>
                                <Link to="/accountsettings" className="link-account">
                                    <i className="icon icon-Setting fs-20"></i>
                                    <span className="text fw-normal">
                                        Account Settings
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </Link>
                                <button onClick={handleLogout} className="link-account" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
                                    <i className="icon icon-Logout fs-20"></i>
                                    <span className="text fw-normal">
                                        Log Out
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="my-account-order tf-grid-layout md-col-2 gap-24">
                            {loading ? (
                                <p>Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <p>No orders found.</p>
                            ) : (
                                orders.map(order => (
                                    <div className="account-order_item" key={order._id}>
                                        <div className="order-heading">
                                            <div className="left">
                                                <i className="icon icon-Box fs-20"></i>
                                                <div className="order_info">
                                                    <p className="order__code fw-normal mb-6">
                                                        #{order.orderNumber}
                                                    </p>
                                                    <p className="order__date text-body-s cl-text-5">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="right">
                                                <p className={`order__tag ${order.deliveryStatus?.toLowerCase() || 'pending'} text-body-s text-capitalize`}>
                                                    {order.deliveryStatus || 'Pending'}
                                                </p>
                                                <p className="order__price text-body-l fw-normal">
                                                    ₹{(order.totalPrice || 0).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="order-content">
                                            <ul className="list-prd">
                                                {(order.products || []).map((item, idx) => (
                                                    <li className="prd-item" key={idx}>
                                                        <div className="prd_image">
                                                            <img loading="lazy" width="74" height="88"
                                                                src={item.productId?.images?.[0] || "/assets/images/product/product-13.jpg"} alt={item.productId?.name || "Product"} />
                                                        </div>
                                                        <div className="prd_infor">
                                                            <div className="infor-wr">
                                                                <Link to={`/product/${item.productId?._id}`}
                                                                    className="info__name fw-normal link-underline mb-6">
                                                                    {item.productId?.name || "Product"}
                                                                </Link>
                                                                <p className="info__qty text-body-s cl-text-5">
                                                                    Qty: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="info__price fw-normal">
                                                                ₹{(item.price || 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <span className="br-line bg-line-5 mt-auto"></span>
                                            <div className="d-flex gap-16 justify-content-end mt-auto">
                                                <button onClick={() => handleDownloadInvoice(order)} className="tf-btn type-2 style-2 align-self-end">
                                                    <i className="icon icon-Download"></i>
                                                    INVOICE
                                                </button>
                                                <Link to={`/orderdetails?id=${order._id}`} className="tf-btn type-4 align-self-end">
                                                    <i className="icon icon-EyeOpen"></i>
                                                    VIEW DETAILS
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
         {/* Account */}
    </>
    )
}