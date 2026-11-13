import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import InfiniteText from "./InfiniteText";
import ProductInfo from "./ProductInfo";
import ProductDetailsTabs from "./ProductDetailsTabs";
import { triggerCheckoutWorkflow } from "../utils/checkoutWorkflow";

import { API_BASE } from "../config";

export default function ProductDetailsContent() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const productId = searchParams.get("id")?.trim() || localStorage.getItem("selectedProductId")?.trim();

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${productId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProduct(data.product);
          if (data.product.sizes && data.product.sizes.length > 0) {
            const firstSize = data.product.sizes[0];
            setSelectedSize(firstSize.size ? firstSize.size.name : firstSize.name);
          }
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (product && quantity < product.qty) {
      setQuantity(quantity + 1);
    }
  };

  const handleBuyItNow = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!product || buyNowLoading) return;

    if (product.status === "inactive") {
      alert("This product is currently unavailable.");
      return;
    }

    if (product.qty <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    if (quantity < 1 || quantity > product.qty) {
      alert(`Please select a valid quantity between 1 and ${product.qty}.`);
      return;
    }

    // Determine current effective price based on selected size variant
    let effectivePrice = product.salePrice || product.mrpPrice || 0;
    let effectiveMrp = product.mrpPrice || effectivePrice;
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      const sizeObj = product.sizes.find(s => (s.size ? s.size.name : s.name) === selectedSize);
      if (sizeObj && sizeObj.salePrice) {
        effectivePrice = sizeObj.salePrice;
        effectiveMrp = sizeObj.mrpPrice || effectiveMrp;
      }
    }

    // Standalone Buy Now item (independent of customer cart)
    const buyNowItem = {
      productId: product._id,
      quantity,
      size: selectedSize || "Standard",
      product: {
        _id: product._id,
        name: product.name,
        salePrice: effectivePrice,
        price: effectivePrice,
        mrpPrice: effectiveMrp,
        images: product.images,
        image: product.images && product.images[0] ? product.images[0] : "",
        sizes: product.sizes,
        qty: product.qty,
      }
    };

    await triggerCheckoutWorkflow({
      event: e,
      items: [buyNowItem],
      user,
      navigate,
      setLoading: setBuyNowLoading,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <h4 className="font-instrument_serif">Loading product details...</h4>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-5">
        <h4 className="font-instrument_serif">Product not found</h4>
        <button onClick={() => navigate("/")} className="tf-btn mt-24">Back to home</button>
      </div>
    );
  }

  // Calculate price based on selected size
  let displayMrpPrice = product.mrpPrice;
  let displaySalePrice = product.salePrice;

  if (product.sizes && product.sizes.length > 0 && selectedSize) {
    const sizeObj = product.sizes.find(s => (s.size ? s.size.name : s.name) === selectedSize);
    if (sizeObj && sizeObj.salePrice) {
      displayMrpPrice = sizeObj.mrpPrice || displayMrpPrice;
      displaySalePrice = sizeObj.salePrice;
    }
  }

  const discount = displayMrpPrice > displaySalePrice
    ? Math.round(((displayMrpPrice - displaySalePrice) / displayMrpPrice) * 100)
    : 0;

  const productImages = (product?.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : (typeof product?.images === "string" && product.images ? [product.images] : ["/assets/images/products/serum_product.png"]);

  return (
    <>
      <section className="section-product-single tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            {/* Left side: Images Slider */}
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className={`product-thumbs-slider style-row row_left ${productImages.length <= 1 ? "single-image-gallery" : ""}`}>
                  <div className="flat-wrap-media-product" style={productImages.length <= 1 ? { width: "100%", maxWidth: "100%" } : {}}>
                    <Swiper
                      modules={[Navigation, Thumbs]}
                      thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                      navigation={{
                        nextEl: ".thumbs-next",
                        prevEl: ".thumbs-prev",
                      }}
                      onSwiper={setMainSwiper}
                      onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                      className="tf-product-media-main"
                    >
                      {productImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <a href={img} className="item" onClick={(e) => e.preventDefault()}>
                            <img
                              src={img}
                              className="tf-image-zoom"
                              alt={`${product.name} - ${idx + 1}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/images/products/serum_product.png";
                              }}
                            />
                          </a>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  {productImages.length > 1 && (
                    <Swiper
                      direction="vertical"
                      slidesPerView={5}
                      spaceBetween={10}
                      watchSlidesProgress
                      onSwiper={setThumbsSwiper}
                      modules={[Thumbs]}
                      className="tf-product-media-thumbs"
                      breakpoints={{
                        320: { direction: "horizontal", slidesPerView: 4 },
                        768: { direction: "vertical", slidesPerView: 5 }
                      }}
                    >
                      {productImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <div
                            className={`item ${activeImageIndex === idx ? "active" : ""}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setActiveImageIndex(idx);
                              if (mainSwiper && !mainSwiper.destroyed) {
                                mainSwiper.slideTo(idx);
                              }
                            }}
                          >
                            <img
                              src={img}
                              alt={`${product.name} thumbnail ${idx + 1}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/images/products/serum_product.png";
                              }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Product Information */}
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative mt-md-0" id="tfProductInfoWrap">
                <div className="tf-zoom-main sticky-top"></div>
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-heading" style={{ gap: 15 }}>

                    <ul className="product-infor-badge d-flex">
                      {product.qty <= 0 ? (
                        <li className="product-badge_item text-body-s" style={{ backgroundColor: '#ff4d4f', color: '#fff' }}>Out of Stock</li>
                      ) : (
                        discount > 0 && <li className="product-badge_item text-body-s new">Sale</li>
                      )}
                    </ul>
                    <h3 className="product-infor-name font-instrument_serif" style={{ fontSize: 28, fontWeight: 800 }}>
                      {product.name}
                    </h3>
                    <div className="product-infor-meta meta_rate">
                      <div className="star-wrap">
                        <i className="icon icon-Star-Sharp"></i>
                        <i className="icon icon-Star-Sharp"></i>
                        <i className="icon icon-Star-Sharp"></i>
                        <i className="icon icon-Star-Sharp"></i>
                        <i className="icon icon-Star-Sharp"></i>
                      </div>
                      <span className="text-body-s cl-text-5">4.9/5 (120 reviews)</span>
                    </div>

                    {product.benefit && (
                      <ul className="product-infor-list-tag">
                        <li>
                          <i className="icon icon-Check"></i>
                          <span className="text-body-s fw-normal">{product.benefit}</span>
                        </li>
                      </ul>
                    )}
                    <div className="product-infor-price">
                      <div className="mb-4 d-flex align-items-center gap-6">
                        <span className="price-on-sale text-body-l fw-normal text-primary">
                          ₹{displaySalePrice}
                        </span>
                        {displayMrpPrice > displaySalePrice && (
                          <>
                            <span className="price-on-old text-body-l cl-text-6 text-decoration-line-through">
                              ₹{displayMrpPrice}
                            </span>
                            <span className="badge-sale text-body-xs">Save {discount}%</span>
                          </>
                        )}
                      </div>
                      <p className="text-body-xs cl-text-5">Shipping calculated at checkout.</p>
                    </div>
                  </div>

                  <div className="tf-product-progress-sale">
                    <p className="title text-body-s fw-normal mb-8">
                      {product.qty <= 0
                        ? "Currently Out of Stock."
                        : `Hurry up, only ${product.qty} items left in stock.`}
                    </p>
                    <div className="progress-cart">
                      <div
                        className="value"
                        style={{ width: `${product.qty > 0 ? Math.min(100, (product.qty / 50) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="tf-product-variant">
                      <div className="variant-picker-item variant-size">
                        <div className="variant-picker-label">
                          <div>
                            <span className="fw-normal">Size: </span>
                            <span className="variant-picker-label-value value-currentSize text-capitalize">
                              {selectedSize}
                            </span>
                          </div>
                        </div>
                        <div className="variant-picker-values">
                          {product.sizes.map((sizeObj) => {
                            const name = sizeObj.size ? sizeObj.size.name : sizeObj.name;
                            const id = sizeObj.size ? sizeObj.size._id : sizeObj._id;
                            return (
                              <span
                                key={id}
                                className={`size-btn text-body-s fw-normal ${selectedSize === name ? "active" : ""}`}
                                onClick={() => setSelectedSize(name)}
                              >
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {product.qty > 0 && (
                    <div className="tf-product-total-quantity">
                      <div className="group-action">
                        <div className="wg-quantity">
                          <button className="btn-quantity btn-decrease" onClick={handleDecrease}>
                            <i className="icon icon-Minus"></i>
                          </button>
                          <input className="quantity-product" type="text" name="number" value={quantity} readOnly />
                          <button className="btn-quantity btn-increase" onClick={handleIncrease}>
                            <i className="icon icon-Plus"></i>
                          </button>
                        </div>
                        <a
                          href="#shoppingCart"
                          data-bs-toggle="offcanvas"
                          className="btn-action-price tf-btn style-2 type-2 btn-light w-100"
                          onClick={() => addToCart(product, quantity, selectedSize)}
                        >
                          Add To Cart
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={handleBuyItNow}
                        disabled={buyNowLoading || product.qty <= 0}
                        className="tf-btn style-2 type-2 w-100 mt-12 d-flex align-items-center justify-content-center gap-2"
                      >
                        {buyNowLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Redirecting to Checkout...
                          </>
                        ) : (
                          "Buy It Now"
                        )}
                      </button>
                    </div>
                  )}

                  <div className="tf-product-description mt-30">
                    <h6 className="title mb-8 font-instrument_serif text-body-l">Description</h6>
                    <div className="cl-text-5 text-body-s ck-content" dangerouslySetInnerHTML={{ __html: product.description }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductDetailsTabs product={product} />

      <ProductInfo product={product} />

      <InfiniteText />


    </>
  );
}