import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "../config";
import RefundModal from "./RefundModal";
import { toast } from 'react-toastify';

export default function OrderDetailsCon() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tracking, setTracking] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setOrder(data.order);

                    setLoadingTracking(true);
                    const trackRes = await fetch(`${API_BASE}/api/orders/${orderId}/shiprocket-tracking`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const trackData = await trackRes.json();
                    if (trackData.success && trackData.tracking) {
                        setTracking(trackData.tracking);
                    }
                    setLoadingTracking(false);
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
                setLoadingTracking(false);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    if (loading) return <div className="container flat-spacing"><p>Loading order details...</p></div>;
    if (!order) return <div className="container flat-spacing"><p>Order not found.</p></div>;

    const subtotal = order.products?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
    const shipping = order.totalPrice - subtotal > 0 ? order.totalPrice - subtotal : 0;

    return (
        <>
            {/* Page Title */}
            <section className="tf-page-heading_account flat-spacing">
                <div className="container">
                    <Link to="/myorders" className="content d-inline-flex">
                        <div className="account-icon d-flex">
                            <i className="icon icon-ArrowLeft fs-24"></i>
                        </div>
                        <div className="account-infor">
                            <h3 className="info_name font-instrument_serif mb-8">
                                Order #{order.orderNumber}
                            </h3>
                            <p className="info_more cl-text-5">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                    </Link>
                </div>
            </section>
            {/* Page Title */}
            {/* Account */}
            <div className="account-order-detail flat-spacing-2">
                <div className="container">
                    <div className="row gy-24">
                        <div className="col-lg-8">
                            <div className="col-left">
                                <div className="order-detail-timeline account-order_item mb-24">
                                    <div className="order-heading">
                                        <div>
                                            <h6 className="font-instrument_serif mb-8">Tracking Timeline</h6>
                                            <p className="text-body-s cl-text-5">Tracking Number: {order.shiprocketAwbCode || 'Pending'}</p>
                                        </div>
                                        <p className={`order__tag ${order.deliveryStatus?.toLowerCase() || 'pending'} text-body-s text-capitalize`}>
                                            {order.deliveryStatus || 'Pending'}
                                        </p>
                                    </div>
                                    <div className="order-content">
                                        {(() => {
                                            if (loadingTracking) {
                                                return <p>Loading tracking information...</p>;
                                            }

                                            if (!tracking || !tracking.tracking_data || tracking.tracking_data.error || !tracking.tracking_data.shipment_track_activities || tracking.tracking_data.shipment_track_activities.length === 0) {
                                                return (
                                                    <div className="timeline-wrap">
                                                        <div className="timeline-item step-done">
                                                            <span className="step-line"></span>
                                                            <span className="ic-wrap"><i className="icon icon-Box"></i></span>
                                                            <div className="tl-content">
                                                                <div className="info_left">
                                                                    <p className="tl_title fw-normal mb-6">Order Placed</p>
                                                                    <p className="tl_desc text-body-s cl-text-5">Your order has been placed successfully</p>
                                                                </div>
                                                                <p className="tl-date text-body-s cl-text-5">{formatDate(order.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const activities = tracking.tracking_data.shipment_track_activities;
                                            return (
                                                <div className="timeline-wrap">
                                                    {activities.map((act, index) => (
                                                        <div key={index} className="timeline-item step-done">
                                                            <span className="step-line"></span>
                                                            <span className="ic-wrap">
                                                                <i className="icon icon-DotLocation"></i>
                                                            </span>
                                                            <div className="tl-content">
                                                                <div className="info_left">
                                                                    <p className="tl_title fw-normal mb-6">{act.status}</p>
                                                                    <p className="tl_desc text-body-s cl-text-5">{act.activity} {act.location ? `- ${act.location}` : ''}</p>
                                                                </div>
                                                                <p className="tl-date text-body-s cl-text-5">{act.date}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="account-order_item type-2">
                                    <div className="order-content">
                                        <h6 className="font-instrument_serif">
                                            Order Items
                                        </h6>
                                        <ul className="list-prd">
                                            {(order.products || []).map((item, idx) => (
                                                <li className="prd-item" key={idx}>
                                                    <div className="prd_image">
                                                        <img loading="lazy" width="74" height="88"
                                                            src={item.productId?.images?.[0] || "/assets/images/product/product-13.jpg"} alt={item.productId?.name || "Image"}/>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="col-right">
                                <div className="box-est">
                                    <div className="ic-wrap">
                                        <i className="icon icon-Clock"></i>
                                    </div>
                                    <div className="est-info">
                                        <p className="text-body-s cl-text-5 mb-6">Estimated Delivery</p>
                                        <p className="fw-normal">Jan 20, 2025</p>
                                    </div>
                                </div>
                                <div className="box-summary">
                                    <h6 className="title font-instrument_serif">Order Summary</h6>
                                    <ul className="tf-list vertical gap-16">
                                        <li className="text-body-s">
                                            <span className="cl-text-5">Subtotal</span>
                                            <span>₹{subtotal.toFixed(2)}</span>
                                        </li>
                                        <li className="text-body-s">
                                            <span className="cl-text-5">Shipping</span>
                                            <span>₹{shipping.toFixed(2)}</span>
                                        </li>
                                        <li className="br-line bg-line-5"></li>
                                        <li className="fw-normal">
                                            <span>Total</span>
                                            <span>₹{(order.totalPrice || 0).toFixed(2)}</span>
                                        </li>
                                        <li className="br-line bg-line-5"></li>
                                        <li className="text-body-s">
                                            <span className="cl-text-5">Payment</span>
                                            <span>{order.paymentStatus || "Pending"}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="box-shipping">
                                    <h6 className="title font-instrument_serif">Shipping Address</h6>
                                    <div className="">
                                        <p className="fw-normal mb-8">{order.addressId?.firstName} {order.addressId?.lastName}</p>
                                        <p className="text-body-s cl-text-5">
                                            {order.addressId?.phone} <br/>
                                            {order.addressId?.address} {order.addressId?.apartment ? `, ${order.addressId.apartment}` : ""} <br/>
                                            {order.addressId?.city}, {order.addressId?.state} {order.addressId?.zipCode} <br/>
                                            {order.addressId?.country}
                                        </p>
                                    </div>
                                </div>
                                <div className="box-btn tf-list vertical gap-20">
                                    <Link to="/contact" className="tf-btn type-2 style-2 w-100">
                                        Contact support
                                    </Link>
                                    <button 
                                        type="button" 
                                        className="tf-btn-line bg-transparent border-0 p-0" 
                                        onClick={() => setShowRefundModal(true)}
                                    >
                                        <span className="fw-normal text-uppercase">
                                            Request return
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showRefundModal && (
                <RefundModal 
                    order={order} 
                    onClose={() => setShowRefundModal(false)} 
                    onSuccess={(msg) => {
                        toast.success(msg);
                        setShowRefundModal(false);
                    }} 
                />
            )}
        </>
    )
}