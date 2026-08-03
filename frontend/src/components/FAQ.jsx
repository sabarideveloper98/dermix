// NOTE: every answer below is still the original template's placeholder
// text ("We recommend alternating nights..."), copied under all 6
// questions. Replace each `answer` with the real answer for that question.
const faqs = [
    {
      question: "Can I use this serum with retinol?",
      answer: "We recommend alternating nights. Use the serum on one night, and retinol on another, to avoid irritation.",
      open: true,
    },
    {
      question: "Is it safe for sensitive skin?",
      answer: "We recommend alternating nights. Use the serum on one night, and retinol on another, to avoid irritation.",
      open: false,
    },
    {
      question: "How soon will I see results?",
      answer: "We recommend alternating nights. Use the serum on one night, and retinol on another, to avoid irritation.",
      open: false,
    },
    {
      question: "Do I need to wear sunscreen with this product?",
      answer: "We recommend alternating nights. Use the serum on one night, and retinol on another, to avoid irritation.",
      open: false,
    },
    {
      question: "Will it cause purging or breakouts?",
      answer: "We recommend alternating nights. Use the serum on one night, and retinol on another, to avoid irritation.",
      open: false,
    },
    {
      question: "Is it pregnancy and breastfeeding safe?",
      answer: "We recommend alternating nights. Use the serum on one night, and retinol on another, to avoid irritation.",
      open: false,
    },
  ];
  
  export default function FAQ() {
    return (
      <div className="flat-spacing bg-main">
        <div className="container">
          <div className="row gy-30">
            <div className="col-lg-6">
              <div className="sect-heading-v2 start wow fadeInUp">
                <p className="eyebrow-label">
                  <span className="br-dot"></span>
                  GOT QUESTIONS?
                </p>
                <h3 className="s-title font-instrument_serif">Everything You Need to Know</h3>
              </div>
              <a href="/faq" className="tf-btn-line wow fadeInUp">
                EXPLORE MORE FAQ
              </a>
            </div>
  
            <div className="col-lg-6">
              <div className="wow fadeInUp" id="faqAccordion">
                {faqs.map((faq, i) => {
                  const id = `faqAccordion-${i + 1}`;
                  return (
                    <div className="accordion-item-2 style-2" key={id}>
                      <div
                        className={`accordion-action h7 font-instrument_serif${i === 0 ? " pt-0" : " collapsed"}`}
                        data-bs-target={`#${id}`}
                        data-bs-toggle="collapse"
                        aria-expanded="true"
                        aria-controls={id}
                        role="button"
                      >
                        <span className="text">{faq.question}</span>
                        <span className="icon ic-accordion-custom"></span>
                      </div>
                      <div id={id} className={`collapse${faq.open ? " show" : ""}`} data-bs-parent="#faqAccordion">
                        <div className="accordion-content">
                          <p className="cl-text-5">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  