export default function Account() {
    return (
    <>
        <section classNameName="tf-page-heading_account flat-spacing">
            <div classNameName="container">
                <div classNameName="content">
                    <div classNameName="account-image">
                        <img loading="lazy" width="96" height="96" src="assets/images/avatar/avt-10.jpg" alt="Image"/>
                    </div>
                    <div classNameName="account-infor">
                        <h3 classNameName="info_name font-instrument_serif mb-8">
                            Hello, Sarah Johnson!
                        </h3>
                        <p classNameName="info_more cl-text-5">
                            sarah.johnson@email.com · Member since June 2023
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
                                        Dashboard
                                    </span>
                                    <span className="order-number text-body-xs">
                                        3
                                    </span>
                                    <i className="icon icon-ArrowCaretRight"></i>
                                </Link>
                                <Link to="/myorders" className="link-account">
                                    <i className="icon icon-Box fs-20"></i>
                                    <span className="text fw-normal">
                                        My Orders
                                    </span>
                                    <span className="order-number text-body-xs">
                                        12
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
                                <Link to="/login" className="link-account">
                                    <i className="icon icon-Logout fs-20"></i>
                                    <span className="text fw-normal">
                                        Log Out
                                    </span>
                                </Link>
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
                                    <a href="#modalEdit" data-bs-toggle="modal" className="tf-btn-line">
                                        <span className="fw-normal">
                                            EDIT
                                        </span>
                                        <i className="icon icon-Edit fs-20"></i>
                                    </a>
                                </div>
                                <div className="dash_content">
                                    <div className="tf-grid-layout gap-24">
                                        <div className="infor-item">
                                            <p className="text-body-s cl-text-5 mb-8">
                                                Full Name
                                            </p>
                                            <p className="fw-normal">
                                                Sarah Johnson
                                            </p>
                                        </div>
                                        <div className="infor-item">
                                            <p className="text-body-s cl-text-5 mb-8">
                                                Phone Number
                                            </p>
                                            <p className="fw-normal">
                                                +1 (555) 123-4567
                                            </p>
                                        </div>
                                    </div>
                                    <div className="tf-grid-layout gap-24">
                                        <div className="infor-item">
                                            <p className="text-body-s cl-text-5 mb-8">
                                                Email
                                            </p>
                                            <p className="fw-normal">
                                                sarah.johnson@email.com
                                            </p>
                                        </div>
                                        <div className="infor-item">
                                            <p className="text-body-s cl-text-5 mb-8">
                                                Date of Birth
                                            </p>
                                            <p className="fw-normal">
                                                June 15, 1995
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
                                    <a href="account-orders.html" className="tf-btn-line">
                                        <span className="fw-normal">
                                            VIEW ALL
                                        </span>
                                    </a>
                                </div>
                                <div className="dash_content">
                                    <ul className="list-order">
                                        <li className="item">
                                            <div className="dash-order_info">
                                                <p className="order__code fw-normal mb-8">
                                                    #GW-2024001
                                                </p>
                                                <p className="order__date text-body-s cl-text-5">
                                                    Jan 15, 2024
                                                </p>
                                            </div>
                                            <div className="dash-order_status text-end">
                                                <p className="order__tag shipping text-body-s mb-8">
                                                    Shipping
                                                </p>
                                                <p className="order__price fw-normal">
                                                    $125.00
                                                </p>
                                            </div>
                                        </li>
                                        <li className="br-line bg-line-5"></li>
                                        <li className="item">
                                            <div className="dash-order_info">
                                                <p className="order__code fw-normal mb-8">
                                                    #GW-2024002
                                                </p>
                                                <p className="order__date text-body-s cl-text-5">
                                                    Jan 10, 2024
                                                </p>
                                            </div>
                                            <div className="dash-order_status text-end">
                                                <p className="order__tag delivered text-body-s mb-8">
                                                    Delivered
                                                </p>
                                                <p className="order__price fw-normal">
                                                    $89.00
                                                </p>
                                            </div>
                                        </li>
                                        <li className="br-line bg-line-5"></li>
                                        <li className="item">
                                            <div className="dash-order_info">
                                                <p className="order__code fw-normal mb-8">
                                                    #GW-2024003
                                                </p>
                                                <p className="order__date text-body-s cl-text-5">
                                                    Jan 05, 2024
                                                </p>
                                            </div>
                                            <div className="dash-order_status text-end">
                                                <p className="order__tag delivered text-body-s mb-8">
                                                    Delivered
                                                </p>
                                                <p className="order__price fw-normal">
                                                    $215.00
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="box-dashboard_item dashboard-address">
                                <div className="dash_title">
                                    <h6 className="font-instrument_serif">
                                        Default Address
                                    </h6>
                                    <a href="#modalEdit" data-bs-toggle="modal" className="tf-btn-line">
                                        <span className="fw-normal">
                                            EDIT
                                        </span>
                                        <i className="icon icon-Edit fs-20"></i>
                                    </a>
                                </div>
                                <div className="dash_content">
                                    <div className="address-item">
                                        <i className="icon icon-DotLocation fs-20"></i>
                                        <div className="address-info">
                                            <p className="info_name fw-normal mb-8">Sarah Johnson</p>
                                            <p className="info_more text-body-s cl-text-5">
                                                +1 (555) 123-4567 <br />
                                                123 Beauty Lane, Suite 100, Los Angeles, CA 90001
                                            </p>
                                        </div>
                                    </div>
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