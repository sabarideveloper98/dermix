const popularSearches = ["SkinEra", "Cleansers", "Acne & Blemishes"];

const suggestions = ["cleanser", "face cleanser", "facial cleanser", "gentle cleanser", "foam cleanser"];

const searchResults = [
  { image: "product-14.jpg", name: "Deep Pore Cleanser", price: "22.00" },
  { image: "product-16.jpg", name: "Gentle Foam Cleanser", price: "17.00" },
  { image: "product-17.jpg", name: "Cylindrical Toner", price: "32.00" },
  { image: "product-18.jpg", name: "Kjaer Touch Concealer", price: "51.00" },
  { image: "product-19.jpg", name: "Mesoestetic Cosmelan", price: "34.00" },
  { image: "product-14.jpg", name: "Deep Pore Cleanser", price: "22.00" },
];

export default function Search() {
  return (
    <div className="modal fade modal-search" id="modalSearch">
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="ctn-wrap">
            <div className="container">
              <form action="#" className="form-search-prd">
                <button type="submit" className="btn-action_search link">
                  <i className="icon icon-Search"></i>
                </button>
                <fieldset>
                  <input type="text" placeholder="Search product" required />
                </fieldset>
                <i className="icon icon-Close btn-close-popup fs-20" data-bs-dismiss="modal"></i>
              </form>

              <div className="pupular-search">
                <span className="cl-text-5">Popular Searches:</span>
                <div className="list-search">
                  {popularSearches.map((term) => (
                    <a href="/shop" className="fw-normal link-underline" key={term}>
                      {term}
                    </a>
                  ))}
                </div>
              </div>

              <div className="row gy-30">
                <div className="col-md-2">
                  <div className="col-suggestion">
                    <p className="text-body-l fw-normal mb-24">Suggestions</p>
                    <div className="tf-list d-md-grid gap-16 flex-wrap">
                      {suggestions.map((s) => (
                        <a href="/shop" className="fw-normal link-underline" key={s}>
                          {s}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-md-10">
                  <div className="tf-btn-swiper-main">
                    <div className="d-flex align-items-center justify-content-between mb-24">
                      <p className="text-body-l fw-normal">Products</p>
                      <div className="d-flex align-items-center gap-8">
                        <div className="tf-sw-nav_icon fs-20 nav-prev-swiper">
                          <i className="icon icon-ArrowCaretLeft"></i>
                        </div>
                        <div className="thumbs-pagination"></div>
                        <div className="tf-sw-nav_icon fs-20 nav-next-swiper">
                          <i className="icon icon-ArrowCaretRight"></i>
                        </div>
                      </div>
                    </div>

                    <div
                      dir="ltr"
                      className="swiper tf-swiper swiper-type-number"
                      data-laptop="5"
                      data-preview="4"
                      data-tablet="3"
                      data-mobile-sm="3"
                      data-mobile="2"
                      data-space-lg="16"
                      data-space-md="16"
                      data-space="10"
                      data-pagination="2"
                      data-pagination-sm="3"
                      data-pagination-md="3"
                      data-pagination-lg="4"
                    >
                      <div className="swiper-wrapper">
                        {searchResults.map((product, i) => (
                          <div className="swiper-slide" key={`${product.image}-${i}`}>
                            <div className="card-product">
                              <div className="card-product_wrapper">
                                <a href="/product" className="product-img">
                                  <img
                                    className="img-product"
                                    loading="lazy"
                                    width="348"
                                    height="420"
                                    src={`/assets/images/product/${product.image}`}
                                    alt="Product"
                                  />
                                </a>
                                <ul className="product-action_list">
                                  <li data-bs-dismiss={i > 0 ? "offcanvas" : undefined}>
                                    <a href="#modalQuickView" data-bs-toggle="modal" className="hover-tooltip tooltip-left box-icon">
                                      <span className="icon icon-EyeOpen"></span>
                                      <span className="tooltip">Quick view</span>
                                    </a>
                                  </li>
                                  <li className="wishlist">
                                    <a href="#" className="hover-tooltip tooltip-left box-icon">
                                      <span className="icon icon-Hearth"></span>
                                      <span className="tooltip">Add to Wishlist</span>
                                    </a>
                                  </li>
                                  <li className="compare">
                                    <a href="#compare" data-bs-toggle="offcanvas" className="hover-tooltip tooltip-left box-icon">
                                      <span className="icon icon-Compare"></span>
                                      <span className="tooltip">Compare</span>
                                    </a>
                                  </li>
                                </ul>
                                <div className="product-action_bot">
                                  <a href="#shoppingCart" data-bs-toggle="offcanvas" className="tf-btn hv-black btn-white type-2 w-100">
                                    Add to cart
                                    <i className="icon icon-ShoppingCart"></i>
                                  </a>
                                </div>
                              </div>
                              <div className="card-product_info">
                                <div className="product-info__rate">
                                  <div className="star-wrap fs-12">
                                    <i className="icon icon-Star"></i>
                                    <i className="icon icon-Star"></i>
                                    <i className="icon icon-Star"></i>
                                    <i className="icon icon-Star"></i>
                                    <i className="icon icon-Star"></i>
                                  </div>
                                  <span className="rate-number text-body-xs">5.0</span>
                                </div>
                                <a href="/product" className="name-product fw-normal link-underline">
                                  {product.name}
                                </a>
                                <div className="price-wrap">
                                  <span className="price-new fw-normal">₹{product.price}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="box-btn_action text-center">
                <a href="/shop" className="tf-btn type-2">
                  See all Results
                </a>
              </div>
            </div>
          </div>
          <span className="close" data-bs-dismiss="modal"></span>
        </div>
      </div>
    </div>
  );
}
