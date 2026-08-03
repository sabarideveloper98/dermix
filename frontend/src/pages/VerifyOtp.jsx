import Header from "../components/Header.jsx";
import TopBar from "../components/TopBar.jsx";
import Footer from "../components/Footer.jsx";
import ShoppingCart from "../components/ShoppingCart.jsx";
import Search from "../components/Search.jsx";
import VerifyOtpContent from "../components/VerifyOtpContent.jsx";

export default function VerifyOtp() {
  return (
    <main id="wrapper">
      <TopBar /> 
      <Header />
      <VerifyOtpContent />
      <Footer />
      <Search />
      <ShoppingCart />
    </main>
  );
}
