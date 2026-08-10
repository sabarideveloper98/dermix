import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import OrderDetailsCon from "../components/OrderDetailsCon.jsx";





export default function OrderDetails() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <OrderDetailsCon />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}