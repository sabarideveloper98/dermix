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
        const res = await fetch(`${API_BASE}/banners?_t=${Date.now()}`);
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
  const slides = banners.length > 0 ? banners : [{ _id: "default", title: "Preventive skin science", image: slider101, desktopImage: slider101, mobileImage: slider101 }];

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
                <picture className="w-100 h-100 d-block">
                  <source
                    media="(max-width: 767px)"
                    srcSet={slide.mobileImage || slide.desktopImage || slide.image || slider101}
                  />
                  <img
                    className="scale-item scale-item-1"
                    loading="lazy"
                    src={slide.desktopImage || slide.mobileImage || slide.image || slider101}
                    alt={slide.title || "Homepage banner"}
                  />
                </picture>
              </div>

              <div className="sld-content" style={{height:"78vh"}}>
                <div className="container">
                  <div className="row gy-24">
                    <div className="col-sm-7 col-md-8">
                      <div className="sld-content_inner wow fadeInUp ">
                        <div className="group-btn gap-12 flex-wrap fade-item fade-item-4 mt-5">                        
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