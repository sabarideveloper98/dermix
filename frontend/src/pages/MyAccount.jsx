import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import Account from "../components/Account.jsx";





export default function MyAccount() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <Account />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}