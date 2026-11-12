import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";

export default function ProductDetailsTabs({ product }) {
  // Read tab configuration with defaults
  const descriptionEnabled = product?.tabConfig?.descriptionEnabled !== false;
  const ingredientsEnabled = product?.tabConfig?.ingredientsEnabled !== false;
  const reviewsEnabled = product?.tabConfig?.reviewsEnabled !== false;

  // Build array of available enabled tab IDs
  const enabledTabs = [];
  if (descriptionEnabled) enabledTabs.push("tabDesc");
  if (ingredientsEnabled) enabledTabs.push("tabIngredient");
  if (reviewsEnabled) enabledTabs.push("tabReview");

  // Determine initial active tab based on URL hash or first enabled tab
  const getInitialTab = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && enabledTabs.includes(hash)) {
      return hash;
    }
    return enabledTabs[0] || "";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Synchronize active tab when tabConfig or hash changes
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && enabledTabs.includes(hash)) {
      setActiveTab(hash);
    } else if (!enabledTabs.includes(activeTab)) {
      setActiveTab(enabledTabs[0] || "");
    }
  }, [descriptionEnabled, ingredientsEnabled, reviewsEnabled, product?._id]);

  // Handle URL hash changes from browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && enabledTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [enabledTabs]);

  // Switch tab and update URL hash
  const switchTab = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, null, `#${tabId}`);
  };

  // Reviews state (only fetched when reviews are enabled)
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 5.0,
    breakdown: {
      5: { count: 0, percent: 0 },
      4: { count: 0, percent: 0 },
      3: { count: 0, percent: 0 },
      2: { count: 0, percent: 0 },
      1: { count: 0, percent: 0 },
    },
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Write Review form state
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSkinType, setReviewSkinType] = useState("Normal");
  const [reviewSkinConcerns, setReviewSkinConcerns] = useState([]);
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  // Fetch approved reviews for the product
  useEffect(() => {
    if (!reviewsEnabled || !product?._id) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/reviews/product/${product._id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setReviewsData({
            reviews: data.reviews || [],
            totalReviews: data.totalReviews || 0,
            averageRating: data.averageRating || 5.0,
            breakdown: data.breakdown || {
              5: { count: 0, percent: 0 },
              4: { count: 0, percent: 0 },
              3: { count: 0, percent: 0 },
              2: { count: 0, percent: 0 },
              1: { count: 0, percent: 0 },
            },
          });
        }
      } catch (err) {
        console.error("Error fetching product reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [reviewsEnabled, product?._id]);

  // Handle Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewsEnabled) {
      alert("Reviews are currently disabled for this product.");
      return;
    }

    if (!reviewName.trim() || !reviewTitle.trim() || !reviewBody.trim()) {
      alert("Please fill in your name, review title, and review description.");
      return;
    }

    setSubmittingReview(true);
    setSubmitFeedback(null);

    const formData = new FormData();
    formData.append("productId", product._id);
    formData.append("name", reviewName.trim());
    formData.append("title", reviewTitle.trim());
    formData.append("review", reviewBody.trim());
    formData.append("rating", reviewScore);
    formData.append("skinType", reviewSkinType);
    formData.append("skinConcerns", JSON.stringify(reviewSkinConcerns));

    if (reviewImages && reviewImages.length > 0) {
      Array.from(reviewImages).forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitFeedback({
          type: "success",
          message: "Thank you! Your review has been submitted.",
        });
        // Reset form
        setReviewTitle("");
        setReviewBody("");
        setReviewImages([]);
      } else {
        setSubmitFeedback({
          type: "danger",
          message: data.message || "Failed to submit review. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setSubmitFeedback({
        type: "danger",
        message: "An error occurred while submitting your review. Please try again.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // If all three tabs are disabled, do not render any tab navigation or container
  if (!descriptionEnabled && !ingredientsEnabled && !reviewsEnabled) {
    return null;
  }

  const rawIngredientsList = (product?.ingredients && product.ingredients.length > 0)
    ? product.ingredients
    : (product?.keyIngredients || []);

  const ingredientsList = [...rawIngredientsList].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

  return (
    <>
      <div className="flat-spacing flat-animate-tab pb-0">
        <div className="container">
          <div className="overflow-auto text-nowrap">
            <ul className="tab-btn-wrap-v1 justify-content-center" role="tablist">
              <li className="br-line fake-class bottom-0"></li>

              {/* 1. Description Tab Link */}
              {descriptionEnabled && (
                <li className="nav-tab-item" role="presentation">
                  <a
                    href="#tabDesc"
                    onClick={(e) => {
                      e.preventDefault();
                      switchTab("tabDesc");
                    }}
                    className={`tf-btn-tab ${activeTab === "tabDesc" ? "active" : ""}`}
                    role="tab"
                    aria-selected={activeTab === "tabDesc"}
                  >
                    <span className="h6 font-instrument_serif fw-normal">Description</span>
                  </a>
                </li>
              )}

              {/* 2. Key Ingredients Tab Link */}
              {ingredientsEnabled && (
                <li className="nav-tab-item" role="presentation">
                  <a
                    href="#tabIngredient"
                    onClick={(e) => {
                      e.preventDefault();
                      switchTab("tabIngredient");
                    }}
                    className={`tf-btn-tab ${activeTab === "tabIngredient" ? "active" : ""}`}
                    role="tab"
                    aria-selected={activeTab === "tabIngredient"}
                  >
                    <span className="h6 font-instrument_serif fw-normal">Key Ingredients</span>
                  </a>
                </li>
              )}

              {/* 3. Reviews Tab Link */}
              {reviewsEnabled && (
                <li className="nav-tab-item" role="presentation">
                  <a
                    href="#tabReview"
                    onClick={(e) => {
                      e.preventDefault();
                      switchTab("tabReview");
                    }}
                    className={`tf-btn-tab ${activeTab === "tabReview" ? "active" : ""}`}
                    role="tab"
                    aria-selected={activeTab === "tabReview"}
                  >
                    <span className="h6 font-instrument_serif fw-normal">
                      Reviews ({reviewsData.totalReviews})
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="tab-content">
            {/* Description Tab Content */}
            {descriptionEnabled && (
              <div
                className={`tab-pane ${activeTab === "tabDesc" ? "active show" : ""}`}
                id="tabDesc"
                role="tabpanel"
              >
                {product?.description ? (
                  <div
                    className="cl-text-5 ck-content"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="cl-text-5">No description available for this product.</p>
                )}
              </div>
            )}

            {/* Key Ingredients Tab Content */}
            {ingredientsEnabled && (
              <div
                className={`tab-pane ${activeTab === "tabIngredient" ? "active show" : ""}`}
                id="tabIngredient"
                role="tabpanel"
              >
                {ingredientsList.length > 0 || product?.ingredientsImage ? (
                  <>
                    {ingredientsList.length > 0 && (
                      <ul className="product-desc_ingredients">
                        <li className="desc__heading">
                          <p className="h7 fw-normal text-white mb-8">Ingredient Facts</p>
                          <p className="text-body-s cl-text-6">Active &amp; Key Ingredients Breakdown</p>
                        </li>
                        {ingredientsList.map((item, index) => (
                          <li className="fw-normal" key={item._id || index} style={{ display: "block" }}>
                            <div className="d-flex justify-content-between align-items-center w-100">
                              <span className="fw-medium">{item.name}</span>
                              {item.percentage ? (
                                <span className="fw-medium ms-auto text-end">{item.percentage}</span>
                              ) : null}
                            </div>
                            {item.description ? (
                              <div
                                className="mt-1"
                                style={{
                                  fontSize: "13px",
                                  lineHeight: "1.55",
                                  opacity: 0.88,
                                }}
                              >
                                {item.description}
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}

                    {product?.ingredientsImage && (
                      <div className="mt-4 text-center">
                        <img
                          src={product.ingredientsImage}
                          alt={`${product?.name || "Product"} Ingredients`}
                          className="rounded img-fluid"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "520px",
                            objectFit: "contain",
                            borderRadius: "10px",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="cl-text-5">No key ingredients listed for this product.</p>
                )}
              </div>
            )}

            {/* Reviews Tab Content */}
            {reviewsEnabled && (
              <div
                className={`tab-pane ${activeTab === "tabReview" ? "active show" : ""}`}
                id="tabReview"
                role="tabpanel"
              >
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
                        <span className="h2">{reviewsData.averageRating}</span>
                        <div className="star-wrap">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              className="icon icon-Star-Sharp"
                              key={star}
                              style={{
                                color: star <= Math.round(reviewsData.averageRating) ? "#f59e0b" : "#e2e8f0",
                              }}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="rate__text">
                        Average rating ({reviewsData.totalReviews} review{reviewsData.totalReviews === 1 ? "" : "s"})
                      </p>
                    </div>

                    <div className="br-line xl-d-none"></div>

                    <div className="rating_progress-list">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const item = reviewsData.breakdown[star] || { count: 0, percent: 0 };
                        return (
                          <div className="rate_progress-item" key={star}>
                            <span className="number-star">
                              {star}
                              <i className="icon icon-Star-Sharp" style={{ color: "#f59e0b" }}></i>
                            </span>

                            <div
                              className="progress"
                              role="progressbar"
                              aria-label={`${star} star reviews`}
                              aria-valuenow={item.percent}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              <div
                                className="progress-bar"
                                style={{ width: `${item.percent}%` }}
                              ></div>
                            </div>

                            <span className="number-percent text-body-s">{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="br-line bg-line-5"></div>

                  <div className="desc_review__comment">
                    {reviewsLoading ? (
                      <div className="text-center py-5">
                        <p className="text-muted">Loading customer reviews...</p>
                      </div>
                    ) : reviewsData.reviews.length === 0 ? (
                      <div className="text-center py-5">
                        <h5 className="font-instrument_serif fw-normal mb-2">No reviews yet</h5>
                        <p className="text-muted cl-text-5">
                          Be the first to share your experience with {product?.name}!
                        </p>
                      </div>
                    ) : (
                      <div className="list-comment">
                        {reviewsData.reviews.map((rev) => (
                          <div className="box-comment" key={rev._id}>
                            <div className="col-left">
                              <div className="comment-author">
                                <div className="author-avt">
                                  <div
                                    className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle fw-bold"
                                    style={{ width: "48px", height: "48px", fontSize: "18px" }}
                                  >
                                    {(rev.name || "C").charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="more">
                                  <p className="author-name text-body-l fw-normal">{rev.name}</p>
                                  <div className="author-verified fw-me">
                                    <i className="icon icon-Verified"></i>
                                    Verified buyer
                                  </div>
                                </div>
                              </div>

                              {(rev.skinType || (rev.skinConcerns && rev.skinConcerns.length > 0)) && (
                                <div className="comment-tag">
                                  {rev.skinType && (
                                    <span className="tag-item text-body-s">{rev.skinType}</span>
                                  )}
                                  {rev.skinConcerns?.map((concern, idx) => (
                                    <span className="tag-item text-body-s" key={idx}>
                                      {concern}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="col-center comment-review">
                              <div className="star-wrap fs-24 gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    className={star <= rev.rating ? "icon icon-Star-Sharp" : "icon icon-Star-Sharp-Stroke"}
                                    key={star}
                                    style={{ color: star <= rev.rating ? "#f59e0b" : "#94a3b8" }}
                                  ></i>
                                ))}
                              </div>

                              <div className="review_text">
                                <p className="text-1 h7 fw-normal">&ldquo;{rev.title}&rdquo;</p>
                                <p className="text-2 cl-text-5">{rev.review}</p>
                              </div>

                              {rev.images && rev.images.length > 0 && (
                                <div className="review_image">
                                  {rev.images.map((imgUrl, idx) => (
                                    <div className="image-item" key={idx}>
                                      <img
                                        loading="lazy"
                                        width="148"
                                        height="148"
                                        src={imgUrl}
                                        alt="Customer review photo"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              <p className="review_prd text-body-s cl-text-5">
                                Review for{" "}
                                <span className="text-decoration-underline">
                                  {product?.name}
                                </span>
                              </p>
                            </div>

                            <div className="col-right comment-action">
                              <p className="review_date text-ssm-end text-body-s cl-text-5">
                                {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal (Rendered only when Reviews tab is enabled) */}
      {reviewsEnabled && (
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
                <h5 id="modalWriteReviewTitle" className="font-instrument_serif fw-normal">
                  Write a Review
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

              {submitFeedback && (
                <div
                  className={`alert alert-${submitFeedback.type} m-3`}
                  role="alert"
                >
                  {submitFeedback.message}
                </div>
              )}

              <form className="form-write-review" onSubmit={handleSubmitReview}>
                <div className="form-content">
                  <fieldset className="tf-field">
                    <p className="text-body-xs">Score*</p>
                    <div className="star-wrap fs-24 gap-4 rate-click cs-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={star <= reviewScore ? "icon icon-Star-Sharp" : "icon icon-Star-Sharp-Stroke"}
                          style={{ color: star <= reviewScore ? "#f59e0b" : "#94a3b8", cursor: "pointer" }}
                          onClick={() => setReviewScore(star)}
                        ></i>
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
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
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
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
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
                      placeholder="Tell us about your experience with this product..."
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      required
                    ></textarea>
                    <label htmlFor="yourReview_review" className="text-body-xs cl-text-5">
                      Please note: Reviews are reviewed and approved by admin before they appear on the site.
                    </label>
                  </fieldset>

                  <fieldset className="tf-field">
                    <p className="text-body-xs">Upload photos (optional)</p>
                    <div className="box-uploadImage">
                      <div className="group-action">
                        <label
                          htmlFor="reviewImageUpload"
                          className="btn-action_upload tf-btn type-3 style-2 btn-stroke-2"
                          style={{ cursor: "pointer" }}
                        >
                          Choose Photos <i className="icon icon-Upload"></i>
                        </label>
                        <input
                          type="file"
                          id="reviewImageUpload"
                          name="reviewImageUpload"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) => setReviewImages(e.target.files)}
                        />
                        {reviewImages && reviewImages.length > 0 && (
                          <span className="small text-success ms-2">
                            {reviewImages.length} photo(s) selected
                          </span>
                        )}
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
                            checked={reviewSkinType === label}
                            onChange={() => setReviewSkinType(label)}
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
                      ].map(([id, label]) => {
                        const isChecked = reviewSkinConcerns.includes(label);
                        return (
                          <div className="checkbox-wrap" key={id}>
                            <input
                              type="checkbox"
                              id={id}
                              name="skin-concerns"
                              value={label}
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setReviewSkinConcerns([...reviewSkinConcerns, label]);
                                } else {
                                  setReviewSkinConcerns(reviewSkinConcerns.filter((c) => c !== label));
                                }
                              }}
                              className="tf-check"
                            />
                            <label htmlFor={id}>{label}</label>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>

                <button
                  type="submit"
                  className="tf-btn style-2 type-2 w-100"
                  disabled={submittingReview}
                >
                  {submittingReview ? "Submitting review..." : "Submit review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
