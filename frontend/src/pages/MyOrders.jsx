import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import Orders from "../components/Orders.jsx";





export default function MyOrders() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <Orders />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}