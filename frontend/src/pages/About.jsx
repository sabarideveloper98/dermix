import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";

import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import AboutContent from "../components/AboutContent.jsx";
import Team from "../components/Team.jsx";



export default function About() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <AboutContent />
      <Team />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}