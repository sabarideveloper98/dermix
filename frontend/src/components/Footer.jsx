import dermfix_whi from "../assets/images/logo/derfix_logo_wt.png";
import { Link } from "react-router-dom";

const footerColumns = [
    {
      heading: "Shop by Category",
      links: [
        { label: "Cleansers", href: "/shop" },
        { label: "Serums", href: "/shop" },
        { label: "Moisturizers", href: "/shop" },
        { label: "SPF / Sun Care", href: "/shop" },
        { label: "Skincare Sets", href: "/shop" },
      ],
    },
    {
      heading: "Customer Care",
      links: [
        { label: "FAQs", href: "/faq" },
        { label: "Shipping & Returns", href: "/terms" },
        { label: "Track Order", href: "/terms" },
        { label: "Contact Us", href: "/contact" },
        { label: "How to Use", href: "/faq" },
      ],
    },
    
  ];
  
  const socialLinks = [
    { icon: "icon-LogoFacebook", href: "https://www.facebook.com/" },
    { icon: "icon-LogoInstagram", href: "https://www.instagram.com/" },
    { icon: "icon-LogoX", href: "https://x.com/" },
    { icon: "icon-LogoThread", href: "https://www.threads.com/" },
    { icon: "fa-brands fa-youtube", href: "https://www.tiktok.com/" },
  ];
  
  export default function Footer() {
    return (
      <footer className="tf-footer footer-v5 bg-black">
        <div className="footer-inner flat-spacing">
          <div className="container">
            <div className="row gy-24">
              <div className="col-lg-4 col-xl-5">
                <div className="ft-contact">
                <img width="236" height="62" src={dermfix_whi} alt="Dermfix Logo" /> 
                  <ul className="tf-list vertical">
                    <li>
                      <i className="icon icon-Phone fs-20 cl-text-2"></i>
                      <Link to="tel:+919080386770" className="fw-normal cl-text-2 link-white text-uppercase">
                        Phone: +91 90803 86770
                      </Link>
                    </li>

                    <li>
                    <i className="icon fa-brands fa-whatsapp fs-20 cl-text-2"></i>
                      
                      <Link to="tel:+18005552390" className="fw-normal cl-text-2 link-white text-uppercase">
                        WhatsApp: +91 90803 86770
                      </Link>
                    </li>



                    <li>
                      <i className="icon icon-Envelope fs-20 cl-text-2"></i>
                      <Link to="mailto:support@glowlyskin.com" className="fw-normal cl-text-2 link-white text-uppercase">
                        Email: support@dermfix.in
                      </Link>
                    </li>
                    <li className="align-items-start">
                      <i className="icon icon-DotLocation fs-20 cl-text-2"></i>
                      <Link
                        to="https://www.google.com/maps?q=456+Blooming+Lane,+Suite+9A+Los+Angeles,+CA+90025,+USA"
                        target="_blank"
                        rel="noreferrer"
                        className="fw-normal cl-text-2 link-white text-uppercase"
                      >
                        Chennai <br className="d-none d-lg-block" />
                        
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
  
              <div className="col-lg-8 col-xl-7">
                <div className="footer-inner_wrap">
                  {footerColumns.map((col, i) => (
                    <div className={`footer-col-block footer-wrap-${i + 1}${i === 1 ? " lg-pe-none" : ""}`} key={col.heading}>
                      <p className="footer-heading footer-heading-mobile h6 font-instrument_serif text-white">
                        {col.heading}
                      </p>
                      <div className="tf-collapse-content">
                        <ul className="footer-menu-list">
                          {col.links.map((link, j) => (
                            <li key={`${col.heading}-${j}`}>
                              <Link to={link.href} className="fw-normal cl-text-2 link-white text-uppercase">
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div className="footer-bottom">
          {/* <div className="logo-large wow fadeZoom">
            <img loading="lazy" width="1920" height="514" src="/Linkssets/images/logo/logo-large.svg" alt="Image" />
          </div> */}
          <div className="container">
            <div className="footer-bottom_wrap">
              <div className="ft-text-nocopy cl-text-6 text-uppercase">© 2026 DERMFIX . All rights reserved.</div>
              <ul className="tf-list gap-16 social">
                {socialLinks.map((s) => (
                  <li key={s.icon}>
                    <Link to={s.href} target="_blank" rel="noreferrer" className="cl-text-2 link-white fs-20">
                      <i className={`icon ${s.icon}`}></i>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="tf-list justify-content-end privacy">
                <li>
                  <Link to="/privacy-policy" className="fw-normal cl-text-2 link-white text-uppercase">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="fw-normal cl-text-2 link-white text-uppercase">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  