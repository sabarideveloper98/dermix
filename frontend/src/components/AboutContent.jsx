export default function AboutContent() {
    return (
    <>
         <section className="section-hero-about flat-spacing-4">
            <div className="about-image">
                <img loading="lazy" width="1920" height="952" src="assets/images/section/hero-about.jpg" alt="Image"/>
            </div>
            <div className="about-content">
                <div className="container-3">
                    <ul className="tf-breadcrumb text-white">
                        <li>
                            <a href="index.html" className="text-white link">
                                HOME
                            </a>
                        </li>
                        <li>
                            <i className="icon icon-ArrowCaretRight"></i>
                        </li>
                        <li>
                            ABOUT
                        </li>
                    </ul>
                    
                </div>
            </div>
        </section>
        <div className="flat-spacing">
            <div className="container">
                <div className="sect-heading-v2">
                    <p className="eyebrow-label">
                        <span className="br-dot"></span>
                        FORMULATED WITH INTENTION
                    </p>
                    <h3 className="s-title font-instrument_serif">
                    Dermfix believes prevention is  <br className="d-none d-lg-block" />
                    better than cure
                    </h3>
                </div>
                {/* <div className="wg-box-author justify-content-center">
                    <div className="author-image">
                        <img loading="lazy" width="64" height="64" src="assets/images/avatar/avt-4.jpg" alt="Image" />
                    </div>
                    <div className="author-info">
                        <a href="#" className="info_name fw-normal link-underline mb-4">Dr. Elena Martinez</a>
                        <p className="info_duty text-body-s cl-text-5">
                            Rosaline Co-Founder
                        </p>
                    </div>
                </div> */}
            </div>
        </div>
    </>
    )
}