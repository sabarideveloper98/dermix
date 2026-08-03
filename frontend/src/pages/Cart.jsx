import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import CartContent from "../components/CartContent.jsx";






export default function Cart() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <CartContent />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}