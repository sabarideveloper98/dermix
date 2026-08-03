import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";

export default function TopBar() {
    return (
      <div className="tf-topbar bg-laven_500 ssm-d-none">
          <div className="container">
              <div className="row align-items-center">
                  <div className="col-2 d-none d-xl-flex">
                      <div className="topbar-left">
                          <ul className="tf-list gap-16">
                              <li>
                                  <Link to="https://www.facebook.com/profile.php?id=61592060139036" target="_blank" className="text-white fs-20 link">
                                      <i className="icon icon-LogoFacebook"></i>
                                  </Link>
                              </li>
                              <li>
                                  <Link to="https://www.instagram.com/dermfix.in" target="_blank" className="text-white fs-20 link">
                                      <i className="icon icon-LogoInstagram"></i>
                                  </Link>
                              </li>
                              <li>
                                  <Link to="https://x.com/" target="_blank" className="text-white fs-20 link">
                                      <i className="icon icon-LogoX"></i>
                                  </Link>
                              </li>
                              <li>
                                  <Link to="https://www.threads.com/" target="_blank" className="text-white fs-20 link">
                                      <i className="icon icon-LogoThread"></i>
                                  </Link>
                              </li>
                              <li>
                                  <Link to="https://www.tiktok.com/" target="_blank" className="text-white fs-20 link">
                                      <i className="fa-brands fa-youtube"></i>
                                  </Link>
                              </li>
                          </ul>
                      </div>
                  </div>
                  <div className="col-12 col-xl-8">
                        <Swiper
                        modules={[Autoplay]}
                        direction="vertical"
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        speed={1000}
                        className="swiper-topbar"
                        >
                        <SwiperSlide>
                            <p className="topbar-center text-white text-uppercase text-center font_bold">
                            🚀 Sales Are Live
                            </p>
                        </SwiperSlide>

                        <SwiperSlide>
                            <p className="topbar-center text-white text-uppercase text-center font_bold">
                            🎉 Founder's Launch Offer – 20% OFF Every Purchase
                            </p>
                        </SwiperSlide>
                        <SwiperSlide>
                            <p className="topbar-center text-white text-uppercase text-center font_bold">
                            ⏳ Limited-Time Launch Offer
                            </p>
                        </SwiperSlide>
                        <SwiperSlide>
                            <p className="topbar-center text-white text-uppercase text-center font_bold">
                            🧪 Formulated by a Clinical Pharmacist (PharmD)
                            </p>
                        </SwiperSlide>
                        <SwiperSlide>
                            <p className="topbar-center text-white text-uppercase text-center font_bold">
                            Prevention is better than cure
                            </p>
                        </SwiperSlide>
                        </Swiper>
                    </div>
                  {/* <div className="col-2 col-2 d-none d-xl-block">
                      <div className="tf-list justify-content-end">
                          <div className="tf-languages">
                              <select className="tf-dropdown-select style-default color-white type-languages">
                                  <option>ENGLISH</option>
                                  <option>VIETNAM</option>
                                  <option>简体中文</option>
                                  <option>اردو</option>
                              </select>
                          </div>
                          <div className="tf-currencies">
                              <select className="tf-dropdown-select style-default color-white type-currencies">
                                  <option selected data-thumbnail="assets/images/country/united-state.png">USD
                                  </option>
                                  <option data-thumbnail="assets/images/country/vietnam.png">VND</option>
                              </select>
                          </div>
                      </div>
                  </div> */}
              </div>
          </div>
      </div>
    );
  }
  