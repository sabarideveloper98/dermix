export default function OrderDetailsCon() {
    return (
    <>
        {/* Page Title */}
        <section className="tf-page-heading_account flat-spacing">
            <div className="container">
                <a href="account-orders.html" className="content d-inline-flex">
                    <div className="account-icon d-flex">
                        <i className="icon icon-ArrowLeft fs-24"></i>
                    </div>
                    <div className="account-infor">
                        <h3 className="info_name font-instrument_serif mb-8">
                            Order #GW-2024001
                        </h3>
                        <p className="info_more cl-text-5">
                            Placed on Jan 15, 2026
                        </p>
                    </div>
                </a>
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
                                        <p className="text-body-s cl-text-5">Tracking Number: GW1234567890</p>
                                    </div>
                                    <p className="order__tag shipping text-body-s">
                                        Shipping
                                    </p>
                                </div>
                                <div className="order-content">
                                    <div className="timeline-wrap">
                                        <div className="timeline-item step-done">
                                            <span className="step-line"></span>
                                            <span className="ic-wrap">
                                                <i className="icon icon-Box"></i>
                                            </span>
                                            <div className="tl-content">
                                                <div className="info_left">
                                                    <p className="tl_title fw-normal mb-6">
                                                        Order Placed
                                                    </p>
                                                    <p className="tl_desc text-body-s cl-text-5">
                                                        Your order has been placed successfully
                                                    </p>
                                                </div>
                                                <p className="tl-date text-body-s cl-text-5">
                                                    Jan 15, 2025 at 10:30 AM
                                                </p>
                                            </div>
                                        </div>
                                        <div className="timeline-item step-done">
                                            <span className="step-line"></span>
                                            <span className="ic-wrap">
                                                <i className="icon icon-Timer"></i>
                                            </span>
                                            <div className="tl-content">
                                                <div className="info_left">
                                                    <p className="tl_title fw-normal mb-6">
                                                        Processing
                                                    </p>
                                                    <p className="tl_desc text-body-s cl-text-5">
                                                        Your order is being prepared for shipment
                                                    </p>
                                                </div>
                                                <p className="tl-date text-body-s cl-text-5">
                                                    Jan 15, 2025 at 02:45 PM
                                                </p>
                                            </div>
                                        </div>
                                        <div className="timeline-item step-done">
                                            <span className="step-line"></span>
                                            <span className="ic-wrap">
                                                <i className="icon icon-Truck"></i>
                                            </span>
                                            <div className="tl-content">
                                                <div className="info_left">
                                                    <p className="tl_title fw-normal mb-6">
                                                        Shipped
                                                    </p>
                                                    <p className="tl_desc text-body-s cl-text-5">
                                                        Your order has been shipped via Express Delivery
                                                    </p>
                                                </div>
                                                <p className="tl-date text-body-s cl-text-5">
                                                    Jan 16, 2025 at 09:15 AM
                                                </p>
                                            </div>
                                        </div>
                                        <div className="timeline-item step-done">
                                            <span className="step-line"></span>
                                            <span className="ic-wrap">
                                                <i className="icon icon-DotLocation"></i>
                                            </span>
                                            <div className="tl-content">
                                                <div className="info_left">
                                                    <p className="tl_title fw-normal mb-6">
                                                        In Transit
                                                    </p>
                                                    <p className="tl_desc text-body-s cl-text-5">
                                                        Package is on the way to your location
                                                    </p>
                                                </div>
                                                <p className="tl-date text-body-s cl-text-5">
                                                    Jan 17, 2025 at 11:30 AM
                                                </p>
                                            </div>
                                        </div>
                                        <div className="timeline-item">
                                            <span className="step-line"></span>
                                            <span className="ic-wrap">
                                                <i className="icon icon-Truck"></i>
                                            </span>
                                            <div className="tl-content">
                                                <div className="info_left">
                                                    <p className="tl_title fw-normal mb-6">
                                                        Out for Delivery
                                                    </p>
                                                    <p className="tl_desc text-body-s cl-text-5">
                                                        Package will be delivered today
                                                    </p>
                                                </div>
                                                <p className="tl-date text-body-s cl-text-5">
                                                    Jan 18, 2025
                                                </p>
                                            </div>
                                        </div>
                                        <div className="timeline-item">
                                            <span className="step-line"></span>
                                            <span className="ic-wrap">
                                                <i className="icon icon-CircleCheck"></i>
                                            </span>
                                            <div className="tl-content">
                                                <div className="info_left">
                                                    <p className="tl_title fw-normal mb-6">
                                                        Delivered
                                                    </p>
                                                    <p className="tl_desc text-body-s cl-text-5">
                                                        Package delivered to recipient
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="account-order_item type-2">
                                <div className="order-content">
                                    <h6 className="font-instrument_serif">
                                        Order Items
                                    </h6>
                                    <ul className="list-prd">
                                        <li className="prd-item">
                                            <div className="prd_image">
                                                <img loading="lazy" width="74" height="88"
                                                    src="assets/images/product/product-13.jpg" alt="Image"/>
                                            </div>
                                            <div className="prd_infor">
                                                <div className="infor-wr">
                                                    <a href="product-detail.html"
                                                        className="info__name fw-normal link-underline mb-6">
                                                        Radiance Serum
                                                    </a>
                                                    <p className="info__qty text-body-s cl-text-5">
                                                        Qty: 1
                                                    </p>
                                                </div>
                                                <p className="info__price fw-normal">
                                                    $85.00
                                                </p>
                                            </div>
                                        </li>
                                        <li className="prd-item">
                                            <div className="prd_image">
                                                <img loading="lazy" width="74" height="88"
                                                    src="assets/images/product/product-13.jpg" alt="Image"/>
                                            </div>
                                            <div className="prd_infor">
                                                <div className="infor-wr">
                                                    <a href="product-detail.html"
                                                        className="info__name fw-normal link-underline mb-6">
                                                        Hydrating Cream
                                                    </a>
                                                    <p className="info__qty text-body-s cl-text-5">
                                                        Qty: 1
                                                    </p>
                                                </div>
                                                <p className="info__price fw-normal">
                                                    $40.00
                                                </p>
                                            </div>
                                        </li>
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
                                        <span>$115.00</span>
                                    </li>
                                    <li className="text-body-s">
                                        <span className="cl-text-5">Shipping</span>
                                        <span>$10.00</span>
                                    </li>
                                    <li className="br-line bg-line-5"></li>
                                    <li className="fw-normal">
                                        <span>Total</span>
                                        <span>$125.00</span>
                                    </li>
                                    <li className="br-line bg-line-5"></li>
                                    <li className="text-body-s">
                                        <span className="cl-text-5">Payment</span>
                                        <span>Visa ending in <span className="fw-normal">4242</span></span>
                                    </li>
                                </ul>
                            </div>
                            <div className="box-shipping">
                                <h6 className="title font-instrument_serif">Shipping Address</h6>
                                <div className="">
                                    <p className="fw-normal mb-8">Sarah Johnson</p>
                                    <p className="text-body-s cl-text-5">
                                        +1 (555) 123-4567 <br/>
                                        123 Beauty Lane, Suite 100 <br/>
                                        Los Angeles, CA 90001 <br/>
                                        United States
                                    </p>
                                </div>
                            </div>
                            <div className="box-btn tf-list vertical gap-20">
                                <a href="#" className="tf-btn type-2 style-2 w-100">
                                    Contact support
                                </a>
                                <a href="#" className="tf-btn-line">
                                    <span className="fw-normal text-uppercase">
                                        Request return
                                    </span>
                                </a>
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