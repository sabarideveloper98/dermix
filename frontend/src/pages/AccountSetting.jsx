import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import AccountSett from "../components/AccountSett.jsx";





export default function AccountSetting() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <AccountSett />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}