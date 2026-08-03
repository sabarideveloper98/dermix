import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";
import HeroSlider from "../components/HeroSlider.jsx";
import Philosophy from "../components/Philosophy.jsx";
import Collection from "../components/Collection.jsx";
import Routine from "../components/Routine.jsx";
import ProductTabs from "../components/ProductTabs.jsx";
import Ingredients from "../components/Ingredients.jsx";
// import Testimonials_new from "../components/Testimonials_new.jsx";
import FAQ from "../components/FAQ.jsx";
// import Newsletter from "../components/Newsletter.jsx";
import Gallery from "../components/Gallery.jsx";
import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import MobileMenu from "../components/MobileMenu.jsx";
import MarqueeTop from "../components/MarqueeTop.jsx";


export default function Home() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <HeroSlider />
      <MarqueeTop />
      <Philosophy />
      <ProductTabs />
      <Collection />
      <Ingredients />
      <FAQ />
      <Gallery />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}