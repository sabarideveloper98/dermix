import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import CheckoutContent from "../components/CheckoutContent.jsx";





export default function Checkout() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <CheckoutContent />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}