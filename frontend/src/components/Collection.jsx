export default function Collection() {
    return (
      <>
        <div className="section-skin-tab flat-spacing flat-animate-tab-2">
            <div className="container">
                <div className="sect-heading wow fadeInUp">
                    <div>
                        <h3 className="s-title font-instrument_serif mb-24">
                            Solutions For Every Skin Type
                        </h3>
                        <p className="desc cl-text-5">
                            We believe every skin is unique. Find the perfect care routine for your concern
                            <br className="d-none d-md-block" />
                            – whether it’s dryness, breakouts, sensitivity, or aging. Your glow starts here.
                        </p>
                    </div>
                    <a href="shop-collection-list.html" className="tf-btn-icon">
                        EXPLORE COLLECTION
                        <i className="icon icon-ArrowRight"></i>
                    </a>
                </div>
            </div>
            <div className="split-accordion-tabs wow fadeInUp">
                <div className="accordion-left">
                    <ul className="d-grid h-100 auto-tab" role="tablist" id="mainSkin">
                        <li className="nav-tab-item" role="presentation">
                            <div className="tf-btn-tab active" data-bs-target="#tabSkin1" data-bs-toggle="tab" role="tab">
                                <div className="accordion-item">
                                    <div className="accordion-action h5 font-instrument_serif" data-bs-target="#mainSkin1"
                                        data-bs-toggle="collapse" aria-expanded="true" aria-controls="mainSkin1"
                                        role="button">
                                        <span className="text lh-xl-40">1. Acne-Prone Skin</span>
                                        <span className="d-flex">
                                            <i className="icon icon-ArrowRightUp"></i>
                                        </span>
                                    </div>
                                    <div id="mainSkin1" className="collapse show" data-bs-parent="#mainSkin">
                                        <div className="accordion-content">
                                            <p className="accor_desc cl-text-5">
                                                Breakouts? We've got your back. Our clarifying collection helps reduce
                                                blemishes, unclog pores, and calm inflammation—without stripping your
                                                skin.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="br-line bg-line-5"></li>
                        <li className="nav-tab-item" role="presentation">
                            <div className="tf-btn-tab" data-bs-target="#tabSkin2" data-bs-toggle="tab" role="tab">
                                <div className="accordion-item">
                                    <div className="accordion-action h5 font-instrument_serif collapsed"
                                        data-bs-target="#mainSkin2" data-bs-toggle="collapse" aria-expanded="true"
                                        aria-controls="mainSkin2" role="button">
                                        <span className="text lh-xl-40">2. Dry & Dehydrated Skin</span>
                                        <span className="d-flex">
                                            <i className="icon icon-ArrowRightUp"></i>
                                        </span>
                                    </div>
                                    <div id="mainSkin2" className="collapse" data-bs-parent="#mainSkin">
                                        <div className="accordion-content">
                                            <p className="accor_desc cl-text-5">
                                                Feeling tight, flaky, or dull? Our deeply hydrating collection helps
                                                replenish moisture, restore softness, and strengthen your skin
                                                barrier—for a smooth, healthy-looking glow.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="br-line bg-line-5"></li>
                        <li className="nav-tab-item" role="presentation">
                            <div className="tf-btn-tab" data-bs-target="#tabSkin3" data-bs-toggle="tab" role="tab">
                                <div className="accordion-item">
                                    <div className="accordion-action h5 font-instrument_serif collapsed"
                                        data-bs-target="#mainSkin3" data-bs-toggle="collapse" aria-expanded="true"
                                        aria-controls="mainSkin3" role="button">
                                        <span className="text lh-xl-40">3. Sensitive Skin</span>
                                        <span className="d-flex">
                                            <i className="icon icon-ArrowRightUp"></i>
                                        </span>
                                    </div>
                                    <div id="mainSkin3" className="collapse" data-bs-parent="#mainSkin">
                                        <div className="accordion-content">
                                            <p className="accor_desc cl-text-5">
                                                Easily irritated or prone to redness? Our gentle, soothing collection
                                                helps calm discomfort, reduce sensitivity, and protect your skin—without
                                                causing further stress.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="br-line bg-line-5"></li>
                        <li className="nav-tab-item" role="presentation">
                            <div className="tf-btn-tab" data-bs-target="#tabSkin4" data-bs-toggle="tab" role="tab">
                                <div className="accordion-item">
                                    <div className="accordion-action h5 font-instrument_serif collapsed"
                                        data-bs-target="#mainSkin4" data-bs-toggle="collapse" aria-expanded="true"
                                        aria-controls="mainSkin4" role="button">
                                        <span className="text lh-xl-40">4. Mature / Aging Skin</span>
                                        <span className="d-flex">
                                            <i className="icon icon-ArrowRightUp"></i>
                                        </span>
                                    </div>
                                    <div id="mainSkin4" className="collapse" data-bs-parent="#mainSkin">
                                        <div className="accordion-content">
                                            <p className="accor_desc cl-text-5">
                                                Noticing fine lines or loss of firmness? Our age-defying collection
                                                helps improve elasticity, smooth wrinkles, and restore a more youthful,
                                                radiant appearance.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="tab-right">
                    <div className="tab-content">
                        <div className="tab-pane active show" id="tabSkin1" role="tabpanel">
                            <div className="collection-v10 hover-img5">
                                <a href="shop-default.html" className="cls-image img-style5">
                                    <img loading="lazy" width="444" height="547"
                                        src="assets/images/collection/v2/collect-9.jpg" alt="Image" />
                                </a>
                                <div className="cls-content">
                                    <a href="shop-default.html" className="tf-btn type-2 btn-white w-100">
                                        Explore Acne Care
                                        <i className="icon icon-ArrowRight"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="tab-pane" id="tabSkin2" role="tabpanel">
                            <div className="collection-v10 hover-img5">
                                <a href="shop-default.html" className="cls-image img-style5">
                                    <img loading="lazy" width="444" height="547"
                                        src="assets/images/collection/v2/collect-10.jpg" alt="Image"/>
                                </a>
                                <div className="cls-content">
                                    <a href="shop-default.html" className="tf-btn type-2 btn-white w-100">
                                        Explore Acne Care
                                        <i className="icon icon-ArrowRight"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="tab-pane" id="tabSkin3" role="tabpanel">
                            <div className="collection-v10 hover-img5">
                                <a href="shop-default.html" className="cls-image img-style5">
                                    <img loading="lazy" width="444" height="547"
                                        src="assets/images/collection/v2/collect-11.jpg" alt="Image" />
                                </a>
                                <div className="cls-content">
                                    <a href="shop-default.html" className="tf-btn type-2 btn-white w-100">
                                        Explore Acne Care
                                        <i className="icon icon-ArrowRight"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="tab-pane" id="tabSkin4" role="tabpanel">
                            <div className="collection-v10 hover-img5">
                                <a href="shop-default.html" className="cls-image img-style5">
                                    <img loading="lazy" width="444" height="547"
                                        src="assets/images/collection/v2/collect-12.jpg" alt="Image"/>
                                </a>
                                <div className="cls-content">
                                    <a href="shop-default.html" className="tf-btn type-2 btn-white w-100">
                                        Explore Acne Care
                                        <i className="icon icon-ArrowRight"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </>
    );
  }
  