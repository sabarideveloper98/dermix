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

import { API_BASE } from "../config";

export default function ProductDetailsContent() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("30ml");

  const productId = searchParams.get("id") || localStorage.getItem("selectedProductId");

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${productId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProduct(data.product);
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

  const handleBuyItNow = async () => {
    if (!product) return;
    try {
      await addToCart(product, quantity, selectedSize);
      if (user) {
        navigate("/checkout");
      } else {
        localStorage.setItem("redirectAfterLogin", "/checkout");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
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

  const discount = product.mrpPrice > product.salePrice
    ? Math.round(((product.mrpPrice - product.salePrice) / product.mrpPrice) * 100)
    : 0;

  const productImages = product.images.length > 0 ? product.images : ["assets/images/products/serum_product.png"];

  return (
    <>
      <section className="section-product-single tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            {/* Left side: Images Slider */}
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="product-thumbs-slider style-row row_left">
                  <div className="flat-wrap-media-product">
                    <Swiper
                      modules={[Navigation, Thumbs]}
                      thumbs={{ swiper: thumbsSwiper }}
                      navigation={{
                        nextEl: ".thumbs-next",
                        prevEl: ".thumbs-prev",
                      }}
                      className="tf-product-media-main"
                    >
                      {productImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <a href={img} className="item" onClick={(e) => e.preventDefault()}>
                            <img src={img} className="tf-image-zoom" alt={product.name} />
                          </a>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
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
                        <div className="item">
                          <img src={img} alt="" />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>

            {/* Right side: Product Information */}
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative mt-md-0" id="tfProductInfoWrap">
                <div className="tf-zoom-main sticky-top"></div>
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-heading">
                    <ul className="product-infor-badge d-flex">
                      {product.qty <= 0 ? (
                        <li className="product-badge_item text-body-s" style={{ backgroundColor: '#ff4d4f', color: '#fff' }}>Out of Stock</li>
                      ) : (
                        discount > 0 && <li className="product-badge_item text-body-s new">Sale</li>
                      )}
                    </ul>
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
                    <h5 className="product-infor-name font-instrument_serif fw-normal">
                      {product.name}
                    </h5>
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
                          ₹{product.salePrice}
                        </span>
                        {product.mrpPrice > product.salePrice && (
                          <>
                            <span className="price-on-old text-body-l cl-text-6 text-decoration-line-through">
                              ₹{product.mrpPrice}
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
                        {["30ml", "50ml", "75ml"].map((size) => (
                          <span
                            key={size}
                            className={`size-btn text-body-s fw-normal ${selectedSize === size ? "active" : ""}`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

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
                      <button onClick={handleBuyItNow} className="tf-btn style-2 type-2 w-100 mt-12">
                        Buy It Now
                      </button>
                    </div>
                  )}

                  <div className="tf-product-description mt-30">
                    <h6 className="title mb-8 font-instrument_serif text-body-l">Description</h6>
                    <p className="cl-text-5 text-body-s">{product.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <InfiniteText />
    </>
  );
}