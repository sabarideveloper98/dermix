import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import slider101 from "../assets/images/slider/slide1.png";
import dermfix_log from "../assets/images/logo/derfix_logo.png";
import shield from "../assets/images/svg/shield-star.svg";

import { API_BASE } from "../config";

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/banners`);
        const data = await res.json();
        if (res.ok && data.success && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch (err) {
        console.error("Error loading banners:", err);
      }
    };
    fetchBanners();
  }, []);

  // Standard fallback slider if no banners seeded
  const slides = banners.length > 0 ? banners : [{ _id: "default", title: "Preventive skin science", image: slider101 }];

  return (
    <div className="tf-slideshow style-2 tf-btn-swiper-main">
      <Swiper
        modules={[Navigation, Pagination, EffectFade, Autoplay]}
        effect="fade"
        loop={slides.length > 1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: ".nav-next-swiper",
          prevEl: ".nav-prev-swiper",
        }}
        pagination={{
          el: ".tf-sw-pagination",
          type: "fraction",
        }}
        className="swiper-type-number-2 slider_effect_fade"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="slideshow-v02">
              <div className="sld-image">
                <img 
                  className="scale-item scale-item-1" 
                  loading="lazy"  
                  src={slide.image || slider101} 
                  alt={slide.title} 
                />
              </div>

              <div className="sld-content">
                <div className="container">
                  <div className="row gy-24">
                    <div className="col-sm-7 col-md-8">
                      <div className="sld-content_inner wow fadeInUp">
                        <div className="sld__tag text-has_dot fade-item fade-item-1">
                          <img src={dermfix_log} style={{ width: "25%" }} alt="logo" />
                        </div>
                        <div className="sld__tag text-has_dot fade-item fade-item-1 slider_top_head">
                          <span className="br-dot"></span>
                          India's
                        </div>

                        <h1 className="sld__title font-instrument_serif fw-normal fade-item fade-item-2 slider_top_main">
                          {slide.title}
                        </h1>

                        <h4 className="slide_sub_head">crafted by <span className="laven_high">clinical minds</span></h4>

                        <p className="sld__desc fw-light text-body-l cl-text-5 fade-item fade-item-3 mt-4 slide_para">
                          Advanced preventive skincare to <span className="laven_high">repair, recovery</span> and <span className="laven_high">protect</span> your skin every day. 
                        </p>

                        <div className="d-flex slide_feature gap-3">
                          <div className="d-flex feature_flex">
                            <img src={shield} alt="feature" />
                            <h6>Repair <br /> Barrier</h6>
                          </div>
                          <div className="d-flex feature_flex">
                            <img src={shield} alt="feature" />
                            <h6>Deeply <br /> Hydrate</h6>
                          </div>
                          <div className="d-flex feature_flex">
                            <img src={shield} alt="feature" />
                            <h6>Soothe <br /> Irritation</h6>
                          </div>
                          <div className="d-flex feature_flex">
                            <img src={shield} alt="feature" />
                            <h6>Protect against<br /> UV Damage</h6>
                          </div>
                          <div className="d-flex feature_flex">
                            <img src={shield} alt="feature" />
                            <h6>Support <br /> Even Tone</h6>
                          </div>
                        </div>

                        <div className="group-btn gap-12 flex-wrap fade-item fade-item-4 mt-5">
                          <Link to="/ProductDetails" className="tf-btn">
                            Shop Now
                            <i className="icon icon-ShoppingBag"></i>
                          </Link>

                          <Link to="/ProductDetails" className="tf-btn btn-trans">
                            Explore Collection
                            <i className="icon icon-ArrowRight"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="group-nav_wrap">
        <div className="container">
          <div className="group-nav_number justify-content-lg-start">
            <div className="btn-nav_direc fs-20 nav-prev-swiper">
              <i className="icon icon-ArrowLeft"></i>
            </div>

            <div className="sw-number-default tf-sw-pagination"></div>

            <div className="btn-nav_direc fs-20 nav-next-swiper">
              <i className="icon icon-ArrowRight"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}