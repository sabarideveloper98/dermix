import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import LoginContent from "../components/LoginContent.jsx";







import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const redirectRoute = localStorage.getItem("redirectAfterLogin");
      if (redirectRoute) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectRoute);
      } else {
        navigate("/myaccount");
      }
    }
  }, [user, navigate]);

  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <LoginContent />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}