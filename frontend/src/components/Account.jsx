import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

export default function Account() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('accessToken');
                const [ordersRes, addrRes] = await Promise.all([
                    fetch(`${API_BASE}/api/orders`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE}/api/addresses`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                const ordersData = await ordersRes.json();
                if (ordersData.success) {
                    setOrders(ordersData.orders.slice(0, 3));
                }
                const addrData = await addrRes.json();
                if (addrData.success) {
                    setAddresses(addrData.addresses);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    if (!user) return null;

    return (
        <>
            <section className="tf-page-heading_account flat-spacing">
                <div className="container">
                    <div className="content">
                        <div className="account-image">
                            <img loading="lazy" width="96" height="96" src="assets/images/avatar/avt-10.jpg" alt="Image" />
                        </div>
                        <div className="account-infor">
                            <h3 className="info_name font-instrument_serif mb-8">
                                Hello, {user.name}!
                            </h3>
                            <p className="info_more cl-text-5">
                                {user.email} · Member since {formatDate(user.createdAt || new Date())}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Account  */}
            <div className="flat-spacing-mix-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-xl-3 lg-d-none">
                            <div className="sidebar-account-wrap sidebar-content-wrap">
                                <div className="my-account-nav">
                                    <Link to="/myaccount" className="link-account active">
                                        <i className="icon icon-Dashboard fs-20"></i>
                                        <span className="text fw-normal">
                                            My Account
                                        </span>
                                        <i className="icon icon-ArrowCaretRight"></i>
                                    </Link>
                                    <Link to="/myorders" className="link-account">
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
                        <div className="col-lg-8 col-xl-9">
                            <div className="my-account-content">
                                <div className="box-dashboard_item dashboard-info">
                                    <div className="dash_title">
                                        <h6 className="font-instrument_serif">
                                            Personal Information
                                        </h6>
                                        <Link to="/accountsettings" className="tf-btn-line">
                                            <span className="fw-normal">
                                                EDIT
                                            </span>
                                            <i className="icon icon-Edit fs-20"></i>
                                        </Link>
                                    </div>
                                    <div className="dash_content">
                                        <div className="tf-grid-layout gap-24">
                                            <div className="infor-item">
                                                <p className="text-body-s cl-text-5 mb-8">
                                                    Full Name
                                                </p>
                                                <p className="fw-normal">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <div className="infor-item">
                                                <p className="text-body-s cl-text-5 mb-8">
                                                    Phone Number
                                                </p>
                                                <p className="fw-normal">
                                                    {user.mobile}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="tf-grid-layout gap-24">
                                            <div className="infor-item">
                                                <p className="text-body-s cl-text-5 mb-8">
                                                    Email
                                                </p>
                                                <p className="fw-normal">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="infor-item">
                                                <p className="text-body-s cl-text-5 mb-8">
                                                    Status
                                                </p>
                                                <p className="fw-normal text-capitalize">
                                                    {user.status || 'Active'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-dashboard_item dashboard-order">
                                    <div className="dash_title">
                                        <h6 className="font-instrument_serif">
                                            Recent Orders
                                        </h6>
                                        <Link to="/myorders" className="tf-btn-line">
                                            <span className="fw-normal">
                                                VIEW ALL
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="dash_content">
                                        {loading ? (
                                            <p>Loading orders...</p>
                                        ) : orders.length === 0 ? (
                                            <p>No recent orders found.</p>
                                        ) : (
                                            <ul className="list-order">
                                                {orders.map((order, index) => (
                                                    <div key={order._id}>
                                                        <li className="item">
                                                            <div className="dash-order_info">
                                                                <p className="order__code fw-normal mb-8">
                                                                    #{order.orderNumber}
                                                                </p>
                                                                <p className="order__date text-body-s cl-text-5">
                                                                    {formatDate(order.createdAt)}
                                                                </p>
                                                            </div>
                                                            <div className="dash-order_status text-end">
                                                                <p className={`order__tag ${order.deliveryStatus?.toLowerCase() || 'pending'} text-body-s mb-8 text-capitalize`}>
                                                                    {order.deliveryStatus || 'Pending'}
                                                                </p>
                                                                <p className="order__price fw-normal">
                                                                    ₹{(order.totalPrice || 0).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </li>
                                                        {index < orders.length - 1 && <li className="br-line bg-line-5"></li>}
                                                    </div>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div className="box-dashboard_item dashboard-address">
                                    <div className="dash_title">
                                        <h6 className="font-instrument_serif">
                                            Default Address
                                        </h6>
                                        <Link to="/accountsettings" className="tf-btn-line">
                                            <span className="fw-normal">
                                                EDIT
                                            </span>
                                            <i className="icon icon-Edit fs-20"></i>
                                        </Link>
                                    </div>
                                    <div className="dash_content">
                                        {loading ? (
                                            <p>Loading addresses...</p>
                                        ) : defaultAddress ? (
                                            <div className="address-item">
                                                <i className="icon icon-DotLocation fs-20"></i>
                                                <div className="address-info">
                                                    <p className="info_name fw-normal mb-8">{defaultAddress.fullName}</p>
                                                    <p className="info_more text-body-s cl-text-5">
                                                        {defaultAddress.phone} <br />
                                                        {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>No address found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Account */}
        </>
    )
}
