export default function MobileMenu() {
    return(
<div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
        <div className="canvas-header">
            <span className="flex-1 d-flex">
                <i className="icon icon-Close link-rotate fs-20" data-bs-dismiss="offcanvas"></i>
            </span>
            <a href="index.html" className="logo-site">
                <img loading="lazy" width="102" height="24" src="assets/images/logo/logo.svg" alt="Image" />
            </a>
            <ul className="tf-list nav-icon-list justify-content-end flex-1">
                <li data-bs-dismiss="offcanvas">
                    <a href="#modalSearch" data-bs-toggle="modal" className="nav-icon-item fw-normal">
                        <i className="icon icon-Search"></i>
                    </a>
                </li>
                <li>
                    <a href="#shoppingCart" data-bs-toggle="offcanvas" className="nav-icon-item fw-normal">
                        <i className="icon icon-ShoppingCart"></i>
                        <span className="number-order text-body-s">
                            (03)
                        </span>
                    </a>
                </li>
            </ul>
        </div>
        <div className="br-line bg-line-5"></div>
        <div className="canvas-body">
            <div className="mb-content-top">
                <ul className="nav-ul-mb-2" id="wrapper-menu-navigation-v2"></ul>
            </div>
            <div className="group-action">
                <a href="login.html" className="tf-btn style-2 type-4 w-100">
                    Sign In
                </a>
                <a href="register.html" className="btn-action_create tf-btn-line">
                    <span className="fw-normal text-uppercase">
                        Create an account
                    </span>
                </a>
            </div>
        </div>
        <div className="br-line bg-line-5"></div>
        <div className="canvas-footer">
            <ul className="tf-list gap-12">
                <li>
                    <a href="https://www.facebook.com/" target="_blank" className="link fs-20">
                        <i className="icon icon-LogoFacebook"></i>
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/" target="_blank" className="link fs-20">
                        <i className="icon icon-LogoInstagram"></i>
                    </a>
                </li>
                <li>
                    <a href="https://x.com/" target="_blank" className="link fs-20">
                        <i className="icon icon-LogoX"></i>
                    </a>
                </li>
                <li>
                    <a href="https://www.threads.com/" target="_blank" className="link fs-20">
                        <i className="icon icon-LogoThread"></i>
                    </a>
                </li>
                <li>
                    <a href="https://www.tiktok.com/" target="_blank" className="link fs-20">
                        <i className="icon icon-LogoTiktok"></i>
                    </a>
                </li>
            </ul>
            <div className="tf-list justify-content-end gap-16 group-curency-language">
                <div className="tf-languages text-body-s">
                    <select className="tf-dropdown-select style-default type-languages">
                        <option>ENGLISH</option>
                        <option>VIETNAM</option>
                        <option>简体中文</option>
                        <option>اردو</option>
                    </select>
                </div>
                <div className="tf-currencies text-body-s">
                    <select className="tf-dropdown-select style-default type-currencies">
                        <option selected data-thumbnail="assets/images/country/united-state.png">USD
                        </option>
                        <option data-thumbnail="assets/images/country/vietnam.png">VND</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

);
}