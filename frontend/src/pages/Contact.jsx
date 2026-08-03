import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import ContactContent from "../components/ContactContent.jsx";
import ContactFaq from "../components/ContactFaq.jsx";




export default function About() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <ContactContent />
      <ContactFaq />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}