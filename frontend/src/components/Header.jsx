import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import dermfix_log from "../assets/images/logo/derfix_logo.png";

export default function Header() {
    const { user, logout } = useAuth();
    const { cart } = useCart();

    const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const getAccountLink = () => {
        if (!user) return "/login";
        if (user.role === "admin") return "/admin";
        return "/myaccount";
    };

    return (
        <div>
        <header className="tf-header">
        <div className="header-inner">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-3 col-md-4 col-lg-5">
                        <div className="header-left">
                            <div className="box-btn-open-menu d-flex">
                                <a href="#mobileMenu" data-bs-toggle="offcanvas" className="d-xl-none">
                                    <i className="icon icon-OpenMenu fs-24"></i>
                                </a>
                            </div>
                            <nav className="box-navigation d-none d-xl-block">
                                <ul className="box-nav-menu">
                                    <li className="menu-item">
                                        <Link to="/" className="item-link">
                                            <span className="text">Home</span>
                                        </Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to="/about" className="item-link">
                                            <span className="text">About</span>
                                        </Link>
                                    </li>
                                    
                                    <li className="menu-item">
                                        <Link to="/" className="item-link">
                                            <span className="text">
                                                Product
                                            </span>
                                        </Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={user ? "/myaccount" : "/login"} className="item-link">
                                            <span className="text">
                                                Track Order
                                            </span>
                                        </Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to="/contact" className="item-link">
                                            <span className="text">Contact</span>
                                        </Link>
                                    </li>
                                  
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                        <div className="header-center d-flex justify-content-center">
                            <Link to="/" className="logo-site">
                                <img width="200" height="32" src={dermfix_log} alt="Dermfix Logo" />    
                            </Link>
                        </div>
                    </div>
                    <div className="col-3 col-md-4 col-lg-5">
                        <div className="header-right">
                            <ul className="tf-list nav-icon-list justify-content-end">
                                <li>
                                    <Link to={getAccountLink()} className="nav-icon-item fw-normal is-text">
                                        <i className="icon icon-UserCircle"></i>
                                        <span className="lg-d-none">
                                            {user ? (user.role === "admin" ? "ADMIN" : "DASHBOARD") : "ACCOUNT"}
                                        </span>
                                    </Link>
                                </li>
                                {user && (
                                    <li>
                                        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="nav-icon-item fw-normal is-text">
                                            <span className="lg-d-none">LOGOUT</span>
                                        </a>
                                    </li>
                                )}
                                <li>
                                    <a href="#shoppingCart" data-bs-toggle="offcanvas"
                                        className="nav-icon-item fw-normal is-text">
                                        <i className="icon icon-ShoppingCart"></i>
                                        <span className="lg-d-none">
                                            CART | <span className="number-order">{String(cartCount).padStart(2, '0')}</span>
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    <div className="br-line bg-line-2"></div>
    </div>
    );
}