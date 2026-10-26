
import React from "react";

export default function ProductDetailsTabs() {
  return (
    <>
      <div className="flat-spacing flat-animate-tab pb-0">
        <div className="container">
          <div className="overflow-auto text-nowrap">
            <ul className="tab-btn-wrap-v1 justify-content-center" role="tablist">
              <li className="br-line fake-class bottom-0"></li>

              <li className="nav-tab-item" role="presentation">
                <a href="#tabDesc" data-bs-toggle="tab" className="tf-btn-tab active" role="tab">
                  <span className="h6 font-instrument_serif fw-normal">Description</span>
                </a>
              </li>

             

              <li className="nav-tab-item" role="presentation">
                <a href="#tabIngredient" data-bs-toggle="tab" className="tf-btn-tab" role="tab">
                  <span className="h6 font-instrument_serif fw-normal">Key Ingredients</span>
                </a>
              </li>

              <li className="nav-tab-item" role="presentation">
                <a href="#tabReview" data-bs-toggle="tab" className="tf-btn-tab" role="tab">
                  <span className="h6 font-instrument_serif fw-normal">Reviews (0)</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            {/* Description */}
            <div className="tab-pane active show" id="tabDesc" role="tabpanel">
              <p className="cl-text-5">
                Our AHA Rosaline Serum 10% gently exfoliates dead skin cells,
                unclogs pores, and boosts cell turnover for smoother, brighter
                skin. This lightweight formula absorbs quickly without
                stickiness, making it perfect for both day and night routines.
              </p>
            </div>

            

            {/* Key Ingredients */}
            <div className="tab-pane" id="tabIngredient" role="tabpanel">
              <ul className="product-desc_ingredients">
                <li className="desc__heading">
                  <p className="h7 fw-normal text-white mb-8">Ingredient Facts</p>
                  <p className="text-body-s cl-text-6">
                    Serving Size: 1 full dropper (approx. 0.5 ml)
                  </p>
                </li>

                <li className="fw-normal">
                  <span>Alpha Hydroxy Acid (AHA) Complex</span>
                  <span>10%</span>
                </li>
                <li className="fw-normal">
                  <span>Glycolic Acid</span>
                  <span>7%</span>
                </li>
                <li className="fw-normal">
                  <span>Lactic Acid</span>
                  <span>3%</span>
                </li>
                <li className="fw-normal">
                  <span>Niacinamide (Vitamin B3)</span>
                  <span>2%</span>
                </li>
                <li className="fw-normal">
                  <span>Hyaluronic Acid</span>
                  <span>1%</span>
                </li>
              </ul>
            </div>

            {/* Reviews */}
            <div className="tab-pane" id="tabReview" role="tabpanel">
              <div className="product-desc_review">
                <div className="heading">
                  <h3 className="font-instrument_serif">Customer Reviews</h3>

                  <a
                    href="#modalWriteReview"
                    data-bs-toggle="modal"
                    className="tf-btn type-2"
                  >
                    write a review
                    <i className="icon icon-Edit"></i>
                  </a>
                </div>

                <div className="review-rating">
                  <div className="rating_average">
                    <div className="rate__number">
                      <span className="h2">4.9</span>
                      <div className="star-wrap">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i className="icon icon-Star-Sharp" key={star}></i>
                        ))}
                      </div>
                    </div>
                    <p className="rate__text">Average rating (305 reviews)</p>
                  </div>

                  <div className="br-line xl-d-none"></div>

                  <div className="rating_progress-list">
                    {[
                      { star: 5, percent: 60, count: 290 },
                      { star: 4, percent: 15, count: 10 },
                      { star: 3, percent: 5, count: 5 },
                      { star: 2, percent: 0, count: 0 },
                      { star: 1, percent: 0, count: 0 },
                    ].map((item) => (
                      <div className="rate_progress-item" key={item.star}>
                        <span className="number-star">
                          {item.star}
                          <i className="icon icon-Star-Sharp"></i>
                        </span>

                        <div
                          className="progress"
                          role="progressbar"
                          aria-label={`${item.star} star reviews`}
                          aria-valuenow={item.percent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div
                            className="progress-bar"
                            style={{ width: `${item.percent}%` }}
                          ></div>
                        </div>

                        <span className="number-percent text-body-s">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rating_image-list">
                    {[1, 2, 3, 4, 5].map((image) => (
                      <div className="image-item" key={image}>
                        <img
                          loading="lazy"
                          width="148"
                          height="148"
                          src={`assets/images/section/review-${image}.jpg`}
                          alt="Customer review"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="br-line bg-line-5"></div>

                <div className="desc_review__comment">
                  <div className="head-comment-filter">
                    <form className="form-search small" onSubmit={(e) => e.preventDefault()}>
                      <fieldset>
                        <input
                          type="text"
                          className="text-body-m"
                          placeholder="Search"
                        />
                      </fieldset>
                      <button type="submit" className="btn-action cl-text-main link">
                        <i className="icon icon-Search"></i>
                      </button>
                    </form>

                    <div className="tf-select text-uppercase fw-normal">
                      <select defaultValue="latest">
                        <option value="latest">Sort by: Latest</option>
                        <option value="new">Sort by: New</option>
                      </select>
                    </div>

                    <div className="tf-select text-uppercase fw-normal">
                      <select defaultValue="all">
                        <option value="all">Rating</option>
                        <option value="1">Rating 1</option>
                        <option value="2">Rating 2</option>
                      </select>
                    </div>

                    <div className="checkbox-wrap">
                      <input type="checkbox" id="checkReview" className="tf-check" />
                      <label htmlFor="checkReview">Photos &amp; Videos only</label>
                    </div>

                    <a
                      href="#"
                      className="tf-btn-line fw-normal ms-xl-auto"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="icon icon-Close"></i>
                      CLEAR ALL FILTER
                    </a>
                  </div>

                  <div className="list-comment">
                    {/* Review 1 */}
                    <div className="box-comment">
                      <div className="col-left">
                        <div className="comment-author">
                          <div className="author-avt">
                            <img
                              loading="lazy"
                              width="64"
                              height="64"
                              src="assets/images/avatar/avt-1.jpg"
                              alt="Jamie L."
                            />
                          </div>
                          <div className="more">
                            <p className="author-name text-body-l fw-normal">Jamie L.</p>
                            <div className="author-verified fw-me">
                              <i className="icon icon-Verified"></i>
                              Verified buyer
                            </div>
                          </div>
                        </div>

                        <div className="comment-tag">
                          <a href="#" onClick={(e) => e.preventDefault()} className="tag-item text-body-s">Normal Skin</a>
                          <a href="#" onClick={(e) => e.preventDefault()} className="tag-item text-body-s">Dullness</a>
                        </div>
                      </div>

                      <div className="col-center comment-review">
                        <div className="star-wrap fs-24 gap-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i className="icon icon-Star-Sharp" key={star}></i>
                          ))}
                        </div>

                        <div className="review_text">
                          <p className="text-1 h7 fw-normal">
                            “Visible glow in under a week”
                          </p>
                          <p className="text-2 cl-text-5">
                            I’ve only been using this serum for a few days, but I can
                            already see a difference. My skin feels noticeably smoother,
                            and my pores look smaller, especially around my nose. No
                            stinging or irritation at all, which was my biggest concern
                            with AHA products. Will definitely keep using it.
                          </p>
                        </div>

                        <div className="review_image">
                          {[1, 2].map((image) => (
                            <div className="image-item" key={image}>
                              <img
                                loading="lazy"
                                width="148"
                                height="148"
                                src={`assets/images/section/review-${image}.jpg`}
                                alt="Customer review"
                              />
                            </div>
                          ))}
                        </div>

                        <p className="review_prd text-body-s cl-text-5">
                          Review for{" "}
                          <span className="text-decoration-underline">
                            AHA Rosaline Serum 10%
                          </span>
                        </p>
                      </div>

                      <div className="col-right comment-action">
                        <p className="review_date text-ssm-end text-body-s cl-text-5">Dec 22, 2025</p>
                        <div className="group-react">
                          <button type="button" className="react-btn like">
                            <i className="icon icon-Like"></i>
                            <span className="number_react">9</span>
                          </button>
                          <button type="button" className="react-btn dislike">
                            <i className="icon icon-Like"></i>
                            <span className="number_react">0</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Review 2 */}
                    <div className="box-comment">
                      <div className="col-left">
                        <div className="comment-author">
                          <div className="author-avt">
                            <img
                              loading="lazy"
                              width="64"
                              height="64"
                              src="assets/images/avatar/avt-2.jpg"
                              alt="JJ Samaluk"
                            />
                          </div>
                          <div className="more">
                            <p className="author-name text-body-l fw-normal">JJ Samaluk</p>
                            <div className="author-verified fw-me">
                              <i className="icon icon-Verified"></i>
                              Verified buyer
                            </div>
                          </div>
                        </div>

                        <div className="comment-tag">
                          <a href="#" onClick={(e) => e.preventDefault()} className="tag-item text-body-s">Oily Skin</a>
                          <a href="#" onClick={(e) => e.preventDefault()} className="tag-item text-body-s">Uneven skin tone</a>
                        </div>
                      </div>

                      <div className="col-center comment-review">
                        <div className="star-wrap fs-24 gap-4">
                          {[1, 2, 3, 4].map((star) => (
                            <i className="icon icon-Star-Sharp" key={star}></i>
                          ))}
                          <i className="icon icon-Star-Sharp-Stroke"></i>
                        </div>

                        <div className="review_text">
                          <p className="text-1 h7 fw-normal">
                            “Gentle but effective exfoliation”
                          </p>
                          <p className="text-2 cl-text-5">
                            I was influenced by skincare TikTok and honestly didn’t expect
                            much — but wow. I massage this into my skin at night and wake
                            up with clearer, brighter skin. I noticed less congestion and
                            fewer blackheads after the first week. It feels like a
                            professional exfoliation without the irritation.
                          </p>
                        </div>

                        <div className="review_image">
                          <div className="image-item">
                            <img
                              loading="lazy"
                              width="148"
                              height="148"
                              src="assets/images/section/review-3.jpg"
                              alt="Customer review"
                            />
                          </div>
                        </div>

                        <p className="review_prd text-body-s cl-text-5">
                          Review for{" "}
                          <span className="text-decoration-underline">
                            Multivitamin Body Serum
                          </span>
                        </p>
                      </div>

                      <div className="col-right comment-action">
                        <p className="review_date text-ssm-end text-body-s cl-text-5">Dec 10, 2025</p>
                        <div className="group-react">
                          <button type="button" className="react-btn like">
                            <i className="icon icon-Like"></i>
                            <span className="number_react">6</span>
                          </button>
                          <button type="button" className="react-btn dislike">
                            <i className="icon icon-Like"></i>
                            <span className="number_react">0</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Review 3 */}
                    <div className="box-comment">
                      <div className="col-left">
                        <div className="comment-author">
                          <div className="author-avt">
                            <img
                              loading="lazy"
                              width="64"
                              height="64"
                              src="assets/images/avatar/avt-3.jpg"
                              alt="Sophia K."
                            />
                          </div>
                          <div className="more">
                            <p className="author-name text-body-l fw-normal">Sophia K.</p>
                            <div className="author-verified fw-me">
                              <i className="icon icon-Verified"></i>
                              Verified buyer
                            </div>
                          </div>
                        </div>

                        <div className="comment-tag">
                          <a href="#" onClick={(e) => e.preventDefault()} className="tag-item text-body-s">Sensitive</a>
                          <a href="#" onClick={(e) => e.preventDefault()} className="tag-item text-body-s">Blackheads / congestion</a>
                        </div>
                      </div>

                      <div className="col-center comment-review">
                        <div className="star-wrap fs-24 gap-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i className="icon icon-Star-Sharp" key={star}></i>
                          ))}
                        </div>

                        <div className="review_text">
                          <p className="text-1 h7 fw-normal">
                            “Perfect addition to my nighttime routine”
                          </p>
                          <p className="text-2 cl-text-5">
                            This serum layers beautifully with the rest of my skincare.
                            It absorbs fast, doesn’t pill, and I wake up with glowing
                            skin. I’ve noticed makeup applies much more smoothly since
                            using this.
                          </p>
                        </div>

                        <div className="review_image">
                          <div className="image-item">
                            <img
                              loading="lazy"
                              width="148"
                              height="148"
                              src="assets/images/section/review-3.jpg"
                              alt="Customer review"
                            />
                          </div>
                        </div>

                        <p className="review_prd text-body-s cl-text-5">
                          Review for{" "}
                          <span className="text-decoration-underline">
                            Multivitamin Body Serum
                          </span>
                        </p>
                      </div>

                      <div className="col-right comment-action">
                        <p className="review_date text-ssm-end text-body-s cl-text-5">Dec 4, 2025</p>
                        <div className="group-react">
                          <button type="button" className="react-btn like">
                            <i className="icon icon-Like"></i>
                            <span className="number_react">11</span>
                          </button>
                          <button type="button" className="react-btn dislike">
                            <i className="icon icon-Like"></i>
                            <span className="number_react">0</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      <div
        className="modal modalCentered fade modal-write-review"
        id="modalWriteReview"
        tabIndex="-1"
        aria-labelledby="modalWriteReviewTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-heading">
              <h5
                id="modalWriteReviewTitle"
                className="font-instrument_serif fw-normal"
              >
                Write a Reviews
              </h5>
              <button
                type="button"
                className="btn-unstyled"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="icon icon-Close link-rotate"></i>
              </button>
            </div>

            <form
              className="form-write-review"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Your review has been submitted.");
              }}
            >
              <div className="form-content">
                <fieldset className="tf-field">
                  <p className="text-body-xs">Score*</p>
                  <div className="star-wrap fs-24 gap-4 rate-click cs-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i className="icon icon-Star-Sharp-Stroke" key={star}></i>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="tf-field">
                  <label htmlFor="yourName_review" className="text-body-xs">
                    Your name*
                  </label>
                  <input
                    type="text"
                    id="yourName_review"
                    name="yourName_review"
                    className="style-3"
                    placeholder="Your name*"
                    defaultValue="Patrick Dang"
                    required
                  />
                </fieldset>

                <fieldset className="tf-field">
                  <label htmlFor="yourTitle_review" className="text-body-xs">
                    Review title*
                  </label>
                  <input
                    type="text"
                    id="yourTitle_review"
                    name="yourTitle_review"
                    className="style-3"
                    placeholder="Review title*"
                    defaultValue="Visible glow in under a week"
                    required
                  />
                </fieldset>

                <fieldset className="tf-field">
                  <label htmlFor="yourReview_review" className="text-body-xs">
                    Your review*
                  </label>
                  <textarea
                    name="yourReview_review"
                    id="yourReview_review"
                    className="style-3"
                    placeholder="Tell us about your experience. How did it feel on your skin? What changes did you notice?"
                    required
                  ></textarea>
                  <label
                    htmlFor="yourReview_review"
                    className="text-body-xs cl-text-5"
                  >
                    Please note, comments need to be approved before they are published.
                  </label>
                </fieldset>

                <fieldset className="tf-field">
                  <p className="text-body-xs">Image review*</p>
                  <div className="box-uploadImage">
                    <ul className="image-upload_list">
                      <li className="image-upload_item">
                        <img
                          loading="lazy"
                          width="104"
                          height="104"
                          src="assets/images/section/review-1.jpg"
                          alt="Review upload preview"
                        />
                      </li>
                    </ul>

                    <div className="group-action">
                      <label
                        htmlFor="reviewImageUpload"
                        className="btn-action_upload tf-btn type-3 style-2 btn-stroke-2"
                      >
                        upload <i className="icon icon-Upload"></i>
                      </label>
                      <input
                        type="file"
                        id="reviewImageUpload"
                        name="reviewImageUpload"
                        accept="image/*"
                        hidden
                      />

                      <button type="button" className="tf-btn-rounded style-2">
                        <i className="icon icon-Refresh"></i>
                      </button>
                      <button type="button" className="btn-action_remove-upload tf-btn-rounded style-2">
                        <i className="icon icon-Trash"></i>
                      </button>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="tf-field">
                  <p className="text-body-xs">Skin type</p>
                  <div className="grid-choose tf-grid-layout sm-col-2 w-100">
                    {[
                      ["skinNormal", "Normal"],
                      ["skinCombination", "Combination"],
                      ["skinDry", "Dry"],
                      ["skinSensitive", "Sensitive"],
                      ["skinOily", "Oily"],
                    ].map(([id, label]) => (
                      <div className="checkbox-wrap" key={id}>
                        <input
                          type="radio"
                          id={id}
                          name="skin-type"
                          value={label}
                          className="tf-check"
                        />
                        <label htmlFor={id}>{label}</label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="tf-field">
                  <p className="text-body-xs">Skin concerns</p>
                  <div className="grid-choose tf-grid-layout sm-col-2 w-100">
                    {[
                      ["skinDullness", "Dullness"],
                      ["skinBlackheads", "Blackheads / congestion"],
                      ["skinUnevenTexture", "Uneven texture"],
                      ["skinUnevenSkinTone", "Uneven skin tone"],
                      ["skinEnlargedPores", "Enlarged pores"],
                      ["skinSensitivity", "Sensitivity"],
                    ].map(([id, label]) => (
                      <div className="checkbox-wrap" key={id}>
                        <input
                          type="radio"
                          id={id}
                          name="skin-concerns"
                          value={label}
                          className="tf-check"
                        />
                        <label htmlFor={id}>{label}</label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              <button type="submit" className="tf-btn style-2 type-2 w-100">
                Submit review
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* /Write Review */}
    </>
  );
}
