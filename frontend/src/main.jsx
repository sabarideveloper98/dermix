import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import "animate.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Customer Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
// Removed old Dashboard
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";

import MyAccount from "./pages/MyAccount";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import AccountSetting from "./pages/AccountSetting";


// import MyAccount1 from "./pages/Account1";
import MyOrders1 from "./pages/Orders1";
import OrderDetails1 from "./pages/OrderDetailsCon1";
import AccountSetting1 from "./pages/AccountSett1";

// Admin Portal Shell
import AdminApp from "./admin/AdminApp";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            {/* <Route path="/orders" element={<MyOrders />} /> */}
            <Route path="/track-order/:orderId" element={<TrackOrder />} />

            <Route path="/myaccount" element={<MyAccount />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/orderdetails" element={<OrderDetails />} />
            <Route path="/accountsettings" element={<AccountSetting />} />


            <Route path="/myorders1" element={<MyOrders1 />} />
            <Route path="/orderdetails1" element={<OrderDetails1 />} />
            <Route path="/accountsettings1" element={<AccountSetting1 />} />




            {/* Support both casings for product details link matching */}
            <Route path="/productdetails" element={<ProductDetails />} />
            <Route path="/ProductDetails" element={<ProductDetails />} />

            {/* Admin Portal Routes */}
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);