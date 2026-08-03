export default function ContactContent() {
    return (
    <>
         <div className="section-split section-contact">
            <div className="col-content bg-main">
                <ul className="tf-breadcrumb">
                    <li>
                        <a href="index.html" className="link">
                            HOME
                        </a>
                    </li>
                    <li>
                        <i className="icon icon-ArrowCaretRight"></i>
                    </li>
                    <li>
                        CONTACT
                    </li>
                </ul>
                <div className="sect-heading-v2 start my-auto">
                    <p className="eyebrow-label cl-text-5">
                        <span className="br-dot"></span>
                        GET IN TOUCH
                    </p>
                    <h3 className="s-title font-instrument_serif">
                        We'd Love to Hear From You
                    </h3>
                    <p className="s-desc cl-text-5">
                        Have a question about our products or need skincare advice? Our team is here to help.
                    </p>
                </div>
            </div>
            <div className="col-media">
                <img loading="lazy" width="960" height="952" src="assets/images/section/hero-contact.jpg" alt="Image" />
                <div className="col-media_inner">
                    <h5 className="font-instrument_serif lh-xl-40 mb-24">
                        Send Us a Message
                    </h5>
                    <form action="contact.html">
                        <div className="form-content mb-24">
                            <fieldset className="tf-field">
                                <label for="messName" className="text-body-xs">Your name*</label>
                                <input className="style-3" type="text" name="messName" id="messName"
                                    placeholder="Enter your name" required/>
                            </fieldset>
                            <fieldset className="tf-field">
                                <label for="messEmail2" className="text-body-xs">Your email*</label>
                                <input className="style-3" type="email" name="messEmail2" id="messEmail2"
                                    placeholder="Enter your email" required/>
                            </fieldset>
                            <fieldset className="tf-field">
                                <label for="messEmail" className="text-body-xs">Your subject*</label>
                                <input className="style-3" type="text" name="messEmail" id="messEmail"
                                    placeholder="How can we help?" required/>
                            </fieldset>
                            <fieldset className="tf-field">
                                <label for="messFied" className="text-body-xs">Your message*</label>
                                <textarea className="style-3" name="messFied" id="messFied"
                                    placeholder="Tell us more about your inquiry..." required></textarea>
                            </fieldset>
                        </div>
                        <button type="submit" className="tf-btn type-2 style-2 w-100">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </>
    )
}