export default function Orders() {
    return (
    <>
        {/* Page Title */}
        <section className="tf-page-heading_account flat-spacing">
            <div className="container">
                <a href="account-page.html" className="content d-inline-flex">
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
                </a>
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
                                <a href="account-page.html" className="link-account active">
                                    <i className="icon icon-Dashboard fs-20"></i>
                                    <span className="text fw-normal">
                                        Dashboard
                                    </span>
                                    <span className="order-number text-body-xs">
                                        3
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </a>
                                <a href="account-orders.html" className="link-account">
                                    <i className="icon icon-Box fs-20"></i>
                                    <span className="text fw-normal">
                                        My Orders
                                    </span>
                                    <span className="order-number text-body-xs">
                                        12
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </a>
                                <a href="wishlist.html" className="link-account">
                                    <i className="icon icon-Hearth fs-20"></i>
                                    <span className="text fw-normal">
                                        Wishlist
                                    </span>
                                    <span className="order-number text-body-xs">
                                        2
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </a>
                                <a href="account-addresses.html" className="link-account">
                                    <i className="icon icon-DotLocation fs-20"></i>
                                    <span className="text fw-normal">
                                        Addresses
                                    </span>
                                    <span className="order-number text-body-xs">
                                        1
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </a>
                                <a href="account-payment.html" className="link-account">
                                    <i className="icon icon-Payment fs-20"></i>
                                    <span className="text fw-normal">
                                        Payment Methods
                                    </span>
                                    <span className="order-number text-body-xs">
                                        5
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </a>
                                <a href="account-payment.html" className="link-account">
                                    <i className="icon icon-Setting fs-20"></i>
                                    <span className="text fw-normal">
                                        Account Settings
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </a>
                                <a href="login.html" className="link-account">
                                    <i className="icon icon-Logout fs-20"></i>
                                    <span className="text fw-normal">
                                        Log Out
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="my-account-order tf-grid-layout md-col-2 gap-24">
                            <div className="account-order_item">
                                <div className="order-heading">
                                    <div className="left">
                                        <i className="icon icon-Box fs-20"></i>
                                        <div className="order_info">
                                            <p className="order__code fw-normal mb-6">
                                                #GW-2024001
                                            </p>
                                            <p className="order__date text-body-s cl-text-5">
                                                Jan 15, 2024
                                            </p>
                                        </div>
                                    </div>
                                    <div className="right">
                                        <p className="order__tag shipping text-body-s">
                                            Shipping
                                        </p>
                                        <p className="order__price text-body-l fw-normal">
                                            $125.00
                                        </p>
                                    </div>
                                </div>
                                <div className="order-content">
                                    <ul className="list-prd">
                                        <li className="prd-item">
                                            <div className="prd_image">
                                                <img loading="lazy" width="74" height="88"
                                                    src="assets/images/product/product-13.jpg" alt="Image" />
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
                                                    src="assets/images/product/product-13.jpg" alt="Image" />
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
                                    <span className="br-line bg-line-5 mt-auto"></span>
                                    <a href="account-order-detail.html" className="tf-btn type-4 align-self-end">
                                        <i className="icon icon-EyeOpen"></i>
                                        VIEW DETAILS
                                    </a>
                                </div>
                            </div>
                            <div className="account-order_item">
                                <div className="order-heading">
                                    <div className="left">
                                        <i className="icon icon-Box fs-20"></i>
                                        <div className="order_info">
                                            <p className="order__code fw-normal mb-6">
                                                #GW-2024002
                                            </p>
                                            <p className="order__date text-body-s cl-text-5">
                                                Jan 10, 2024
                                            </p>
                                        </div>
                                    </div>
                                    <div className="right">
                                        <p className="order__tag delivered text-body-s">
                                            Delivered
                                        </p>
                                        <p className="order__price text-body-l fw-normal">
                                            $89.00
                                        </p>
                                    </div>
                                </div>
                                <div className="order-content">
                                    <ul className="list-prd">
                                        <li className="prd-item">
                                            <div className="prd_image">
                                                <img loading="lazy" width="74" height="88"
                                                    src="assets/images/product/product-13.jpg" alt="Image" />
                                            </div>
                                            <div className="prd_infor">
                                                <div className="infor-wr">
                                                    <a href="product-detail.html"
                                                        className="info__name fw-normal link-underline mb-6">
                                                        Vitamin C Brightening Toner
                                                    </a>
                                                    <p className="info__qty text-body-s cl-text-5">
                                                        Qty: 1
                                                    </p>
                                                </div>
                                                <p className="info__price fw-normal">
                                                    $89.00
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                    <span className="br-line bg-line-5 mt-auto"></span>
                                    <a href="account-order-detail.html" className="tf-btn type-4 align-self-end">
                                        <i className="icon icon-EyeOpen"></i>
                                        VIEW DETAILS
                                    </a>
                                </div>
                            </div>
                            <div className="account-order_item">
                                <div className="order-heading">
                                    <div className="left">
                                        <i className="icon icon-Box fs-20"></i>
                                        <div className="order_info">
                                            <p className="order__code fw-normal mb-6">
                                                #GW-2024003
                                            </p>
                                            <p className="order__date text-body-s cl-text-5">
                                                Jan 05, 2024
                                            </p>
                                        </div>
                                    </div>
                                    <div className="right">
                                        <p className="order__tag delivered text-body-s">
                                            Delivered
                                        </p>
                                        <p className="order__price text-body-l fw-normal">
                                            $125.00
                                        </p>
                                    </div>
                                </div>
                                <div className="order-content">
                                    <ul className="list-prd">
                                        <li className="prd-item">
                                            <div className="prd_image">
                                                <img loading="lazy" width="74" height="88"
                                                    src="assets/images/product/product-13.jpg" alt="Image" />
                                            </div>
                                            <div className="prd_infor">
                                                <div className="infor-wr">
                                                    <a href="product-detail.html"
                                                        className="info__name fw-normal link-underline mb-6">
                                                        Complete Skincare Set
                                                    </a>
                                                    <p className="info__qty text-body-s cl-text-5">
                                                        Qty: 1
                                                    </p>
                                                </div>
                                                <p className="info__price fw-normal">
                                                    $125.00
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                    <span className="br-line bg-line-5 mt-auto"></span>
                                    <a href="account-order-detail.html" className="tf-btn type-4 align-self-end">
                                        <i className="icon icon-EyeOpen"></i>
                                        VIEW DETAILS
                                    </a>
                                </div>
                            </div>
                            <div className="account-order_item">
                                <div className="order-heading">
                                    <div className="left">
                                        <i className="icon icon-Box fs-20"></i>
                                        <div className="order_info">
                                            <p className="order__code fw-normal mb-6">
                                                #GW-2023050
                                            </p>
                                            <p className="order__date text-body-s cl-text-5">
                                                Dec 20, 2023
                                            </p>
                                        </div>
                                    </div>
                                    <div className="right">
                                        <p className="order__tag cancelled text-body-s">
                                            Cancelled
                                        </p>
                                        <p className="order__price text-body-l fw-normal">
                                            $65.00
                                        </p>
                                    </div>
                                </div>
                                <div className="order-content">
                                    <ul className="list-prd">
                                        <li className="prd-item">
                                            <div className="prd_image">
                                                <img loading="lazy" width="74" height="88"
                                                    src="assets/images/product/product-13.jpg" alt="Image" />
                                            </div>
                                            <div className="prd_infor">
                                                <div className="infor-wr">
                                                    <a href="product-detail.html"
                                                        className="info__name fw-normal link-underline mb-6">
                                                        Night Repair Mask
                                                    </a>
                                                    <p className="info__qty text-body-s cl-text-5">
                                                        Qty: 1
                                                    </p>
                                                </div>
                                                <p className="info__price fw-normal">
                                                    $65.00
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                    <span className="br-line bg-line-5 mt-auto"></span>
                                    <a href="account-order-detail.html" className="tf-btn type-4 align-self-end">
                                        <i className="icon icon-EyeOpen"></i>
                                        VIEW DETAILS
                                    </a>
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