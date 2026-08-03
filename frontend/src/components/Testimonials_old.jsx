const testimonials = [
    {
      image: "tes-1.jpg",
      quote:
        '"Nothing compares to Rosaline Serum. The silky texture feels indulgent, and after just a few uses, my skin looks brighter, smoother, and refreshed."',
      author: "- Alina M., 32, New York",
      purchased: "Purchased: Soothing Daily Cleanser",
      delay: null,
    },
    {
      image: "tes-2.jpg",
      quote:
        '"What I love most is how balanced my skin feels. The texture is lightweight, absorbs beautifully, and never leaves that tight or heavy finish. It\'s become part of my everyday ritual."',
      author: "— Elena R., 29, London",
      purchased: "Purchased: Barrier Repair Cream",
      delay: "0.1s",
    },
    {
      image: "tes-3.jpg",
      quote:
        '"The texture alone convinced me. It feels refined, almost silky, but still deeply nourishing. After a few weeks, my skin looks calmer and more even."',
      author: "- Alina M., 32, New York",
      purchased: "Purchased: Active Treatment Serum",
      delay: null,
    },
  ];
  
  export default function Testimonials_old() {
    return (
      <div className="section-testimonial flat-spacing overflow-hidden">
        <div className="sect-image">
          <img loading="lazy" width="1920" height="982" src="/assets/images/testimonial/tes-1.jpg" alt="Image" />
          <img loading="lazy" width="1920" height="982" src="/assets/images/testimonial/tes-2.jpg" alt="Image" />
          <img loading="lazy" width="1920" height="982" src="/assets/images/testimonial/tes-3.jpg" alt="Image" />
        </div>
  
        <div className="container position-relative z-2">
          <div className="sect-heading wow fadeInUp">
            <div className="">
              <p className="eyebrow-label mb-24 text-white">
                <span className="br-dot"></span>
                OUR COMMUNITY
              </p>
              <h3 className="s-title font-instrument_serif text-white">Real Skin. Real Rituals.</h3>
            </div>
            <a href="/reviews" className="tf-btn-line style-white">
              READ MORE REVIEWS
            </a>
          </div>
  
          <div
            dir="ltr"
            className="swiper tf-swiper overflow-visible"
            data-preview="1"
            data-tablet="1.1"
            data-mobile-sm="1.1"
            data-mobile="1.1"
            data-space="16"
            data-speed="1500"
          >
            <div className="swiper-wrapper cs-drag">
              {testimonials.map((t, i) => (
                <div className="swiper-slide" key={t.image}>
                  <div className={`testimonial-v02${i < 2 ? " wow fadeInRight" : ""}`} data-wow-delay={t.delay || undefined}>
                    <div className="tes-image">
                      <img
                        className="wow fadeZoomOut"
                        loading="lazy"
                        width="490"
                        height="572"
                        src={`/assets/images/testimonial/${t.image}`}
                        alt="Image"
                      />
                    </div>
                    <div className="tes-content">
                      <div className="tes_rate">
                        <div className="star-wrap fs-20">
                          <i className="icon icon-Star-Sharp"></i>
                          <i className="icon icon-Star-Sharp"></i>
                          <i className="icon icon-Star-Sharp"></i>
                          <i className="icon icon-Star-Sharp"></i>
                          <i className="icon icon-Star-Sharp"></i>
                        </div>
                        <span className="text-body-s cl-text-5">5.0</span>
                      </div>
                      <p className="tes_text h5 font-instrument_serif lh-xl-40">{t.quote}</p>
                      <p className="tes_author fw-normal">{t.author}</p>
                      <div className="tes_prd">
                        <div className="ic-wrap">
                          <i className="icon icon-Box"></i>
                        </div>
                        <a href="/product" className="fw-normal link text-decoration-underline">
                          {t.purchased}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  