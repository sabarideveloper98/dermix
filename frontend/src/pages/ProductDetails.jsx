import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import LoginContent from "../components/LoginContent.jsx";
import ProductDetailsContent from "../components/ProductDetailsContent.jsx";







export default function ProductDetails() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <ProductDetailsContent />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}