export default function Routine() {
    return (
      <div className="section-rountine-look section-split flat-animate-tab-2">
        <div className="col-media tab-content order-md-2">
          <div className="tab-pane active show" id="routine" role="tabpanel">
            <div className="banner-lookbook wrap-lookbook_hover">
              <div className="overflow-hidden w-100 h-100">
                <img
                  className="img-banner wow fadeZoomOut"
                  loading="lazy"
                  width="960"
                  height="960"
                  src="/assets/images/lookbook/look-1.jpg"
                  alt="Image"
                />
              </div>
              <div className="lookbook-item position1 open-drop">
                <div className="dropdown dropup-center dropdown-custom dropstart">
                  <div role="dialog" className="tf-pin-btn-2 bundle-pin-item" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="ic-wrap">
                      <i className="icon icon-Plus"></i>
                      <i className="icon icon-Minus"></i>
                    </span>
                    <span className="wave"></span>
                  </div>
                  <div className="dropdown-menu">
                    <div className="lookbook-product">
                      <a href="/product" className="prd-image">
                        <img width="88" height="88" src="/assets/images/product/product-13.jpg" alt="Product" />
                      </a>
                      <div className="prd-content">
                        <div className="prd_info">
                          <a href="/product" className="prd__name link-underline fw-normal text-line-clamp-1">
                            Hydra Shine Lip Gloss
                          </a>
                          <div className="price-wrap gap-6 fw-normal">
                            <span className="price-new text-primary">$32.00</span>
                            <span className="price-old cl-text-6">$40.00</span>
                          </div>
                        </div>
                        <a href="#shoppingCart" data-bs-toggle="offcanvas" className="tf-btn type-3 style-2">
                          Add
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="tab-pane" id="routine2" role="tabpanel">
            <div className="banner-lookbook wrap-lookbook_hover">
              <img className="img-banner" loading="lazy" width="960" height="960" src="/assets/images/lookbook/look-2.jpg" alt="Image" />
              <div className="lookbook-item position2 open-drop">
                <div className="dropdown dropup-center dropdown-custom dropstart">
                  <div role="dialog" className="tf-pin-btn-2 bundle-pin-item" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="ic-wrap">
                      <i className="icon icon-Plus"></i>
                      <i className="icon icon-Minus"></i>
                    </span>
                    <span className="wave"></span>
                  </div>
                  <div className="dropdown-menu">
                    <div className="lookbook-product">
                      <a href="/product" className="prd-image">
                        <img width="88" height="88" src="/assets/images/product/product-13.jpg" alt="Product" />
                      </a>
                      <div className="prd-content">
                        <div className="prd_info">
                          <a href="/product" className="prd__name link-underline fw-normal text-line-clamp-1">
                            Hydra Shine Lip Gloss
                          </a>
                          <div className="price-wrap gap-6 fw-normal">
                            <span className="price-new text-primary">$32.00</span>
                            <span className="price-old cl-text-6">$40.00</span>
                          </div>
                        </div>
                        <a href="#shoppingCart" data-bs-toggle="offcanvas" className="tf-btn type-3 style-2">
                          Add
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div className="tab-pane" id="routine3" role="tabpanel">
            <div className="banner-lookbook wrap-lookbook_hover">
              <img className="img-banner" loading="lazy" width="960" height="960" src="/assets/images/lookbook/look-3.jpg" alt="Image" />
              <div className="lookbook-item position3 open-drop">
                <div className="dropdown dropup-center dropdown-custom dropstart">
                  <div role="dialog" className="tf-pin-btn-2 bundle-pin-item" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="ic-wrap">
                      <i className="icon icon-Plus"></i>
                      <i className="icon icon-Minus"></i>
                    </span>
                    <span className="wave"></span>
                  </div>
                  <div className="dropdown-menu">
                    <div className="lookbook-product">
                      <a href="/product" className="prd-image">
                        <img width="88" height="88" src="/assets/images/product/product-13.jpg" alt="Product" />
                      </a>
                      <div className="prd-content">
                        <div className="prd_info">
                          <a href="/product" className="prd__name link-underline fw-normal text-line-clamp-1">
                            Hydra Shine Lip Gloss
                          </a>
                          <div className="price-wrap gap-6 fw-normal">
                            <span className="price-new text-primary">$32.00</span>
                            <span className="price-old cl-text-6">$40.00</span>
                          </div>
                        </div>
                        <a href="#shoppingCart" data-bs-toggle="offcanvas" className="tf-btn type-3 style-2">
                          Add
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div className="col-content bg-main-4 justify-content-between order-md-1">
          <div className="sect-heading-v2 start wow fadeInUp">
            <p className="eyebrow-label text-white">
              <span className="br-dot"></span>
              SHOP BY ROUTINE
            </p>
            <h3 className="s-title font-instrument_serif text-white">Your Routine, Reimagined</h3>
          </div>
          <ul className="d-grid auto-tab" role="tablist" id="mainRoutine">
            <li className="nav-tab-item wow fadeInUp" role="presentation">
              <div className="tf-btn-tab active" data-bs-target="#routine" data-bs-toggle="tab" role="tab">
                <div className="accordion-item">
                  <div
                    className="accordion-action h5 font-instrument_serif text-white pt-0"
                    data-bs-target="#mainRoutine1"
                    data-bs-toggle="collapse"
                    aria-expanded="true"
                    aria-controls="mainRoutine1"
                    role="button"
                  >
                    <span className="text">Clean Start</span>
                  </div>
                  <div id="mainRoutine1" className="collapse show" data-bs-parent="#mainRoutine">
                    <div className="accordion-content">
                      <p className="accor_desc cl-text-6">
                        Start with a gentle reset. Our cleansers remove impurities without disrupting your skin
                        barrier — leaving skin balanced, comfortable, and ready for treatment.
                      </p>
                      <a href="/shop" className="tf-btn-line style-white">
                        SHOP CLEANSERS
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-tab-item wow fadeInUp" role="presentation">
              <div className="tf-btn-tab" data-bs-target="#routine2" data-bs-toggle="tab" role="tab">
                <div className="accordion-item">
                  <div
                    className="accordion-action h5 font-instrument_serif text-white collapsed"
                    data-bs-target="#mainRoutine2"
                    data-bs-toggle="collapse"
                    aria-expanded="true"
                    aria-controls="mainRoutine2"
                    role="button"
                  >
                    <span className="text">Targeted Care</span>
                  </div>
                  <div id="mainRoutine2" className="collapse" data-bs-parent="#mainRoutine">
                    <div className="accordion-content">
                      <p className="accor_desc cl-text-6">
                        Concentrated serums powered by proven actives help address specific concerns while
                        maintaining skin balance.
                      </p>
                      <a href="/shop" className="tf-btn-line style-white">
                        SHOP SERUMS
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-tab-item wow fadeInUp" role="presentation">
              <div className="tf-btn-tab" data-bs-target="#routine3" data-bs-toggle="tab" role="tab">
                <div className="accordion-item">
                  <div
                    className="accordion-action h5 font-instrument_serif text-white collapsed"
                    data-bs-target="#mainRoutine3"
                    data-bs-toggle="collapse"
                    aria-expanded="true"
                    aria-controls="mainRoutine3"
                    role="button"
                  >
                    <span className="text">Daily Protect</span>
                  </div>
                  <div id="mainRoutine3" className="collapse" data-bs-parent="#mainRoutine">
                    <div className="accordion-content">
                      <p className="accor_desc cl-text-6">
                        Barrier-supporting moisturizers designed to lock in hydration and promote long-lasting
                        comfort.
                      </p>
                      <a href="/shop" className="tf-btn-line style-white">
                        SHOP MOISTURIZERS
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }
  