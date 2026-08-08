import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WOW from "wow.js";
import "animate.css";
import "swiper/css";
import "swiper/css/navigation";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../config";

export default function ProductTabs() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize scroll-reveal animations after content is fully loaded
  useEffect(() => {
    if (!loading && !error) {
      // Small timeout to guarantee DOM paint before WOW scans
      const timer = setTimeout(() => {
        try {
          new WOW({ live: false }).init();
        } catch (e) {
          console.error("Failed to init WOW:", e);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?limit=50`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          throw new Error(data.message || "Failed to load products");
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products for tabs
  const featuredProducts = products.filter((p) => p.mrpPrice > p.salePrice);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderProductSlider = (items) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="cl-text-5">No products found in this collection.</p>
        </div>
      );
    }

    return (
      <div className="position-relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={4}
          loop={items.length >= 4}
          navigation={{
            nextEl: ".product-next",
            prevEl: ".product-prev",
          }}
          breakpoints={{
            320: { slidesPerView: 1.3 },
            576: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
          }}
          className="tf-swiper overflow-visible"
        >
          {items.map((prod) => {
            const discount = prod.mrpPrice > prod.salePrice
              ? Math.round(((prod.mrpPrice - prod.salePrice) / prod.mrpPrice) * 100)
              : 0;

            return (
              <SwiperSlide key={prod._id}>
                <div className="card-product card-s2 s2-type_2 wow fadeInUp">
                  <div className="card-product_wrapper square">
                    <Link
                      to={`/ProductDetails?id=${prod._id}`}
                      className="product-img"
                      onClick={() => localStorage.setItem('selectedProductId', prod._id)}
                    >
                      <img
                        className="img-product"
                        loading="lazy"
                        width="332"
                        height="332"
                        src={prod.images[0] || "assets/images/products/serum_product.png"}
                        alt={prod.name}
                      />
                    </Link>
                    <ul className="product-badge_list">
                      {discount > 0 && (
                        <li className="product-badge_item style-2 text-body-xs fw-normal type-cl-2">
                          {discount}% OFF
                        </li>
                      )}
                      {prod.qty <= 0 ? (
                        <li className="product-badge_item style-2 text-body-xs fw-normal type-cl-4">
                          OUT OF STOCK
                        </li>
                      ) : (
                        prod.qty < 10 && (
                          <li className="product-badge_item style-2 text-body-xs fw-normal type-cl-3">
                            LOW STOCK
                          </li>
                        )
                      )}
                    </ul>

                    {prod.qty > 0 && (
                      <div className="product-action_bot">
                        <a
                          href="#shoppingCart"
                          data-bs-toggle="offcanvas"
                          className="tf-btn hv-black btn-white type-2 w-100"
                          onClick={() => addToCart(prod, 1)}
                        >
                          Add to cart
                          <i className="icon icon-ShoppingCart"></i>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="card-product_info">
                    <span className="product-info__type text-body-xs fw-normal text-uppercase cl-text-5">
                      {prod.categoryId?.name || "Skin Care"}
                    </span>
                    <Link
                      to={`/ProductDetails?id=${prod._id}`}
                      className="name-product fw-normal link-underline"
                      onClick={() => localStorage.setItem('selectedProductId', prod._id)}
                    >
                      {prod.name}
                    </Link>
                    <div className="price-wrap gap-6">
                      <span className="price-new text-primary">₹{prod.salePrice}</span>
                      {prod.mrpPrice > prod.salePrice && (
                        <span className="price-old cl-text-6">₹{prod.mrpPrice}</span>
                      )}
                    </div>
                    <p className="product-info__avaiable text-body-xs text-has_dot cl-text-5">
                      <span className={`br-dot small ${prod.qty <= 0 ? 'bg-main_500' : ''}`}></span>
                      {prod.qty > 0 ? `${prod.qty} items available` : "No items available"}
                    </p>
                    <div className="product-info__rate">
                      <div className="star-wrap style-yellow fs-12">
                        <i className="icon icon-Star"></i>
                        <i className="icon icon-Star"></i>
                        <i className="icon icon-Star"></i>
                        <i className="icon icon-Star"></i>
                        <i className="icon icon-Star"></i>
                      </div>
                      <span className="rate-number text-body-xs cl-text-5">
                        4.9 (120 reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Floating Custom Navigation Buttons */}
        <button
          className="product-prev btn-nav-swiper-custom"
          aria-label="Previous slide"
        >
          <i className="icon icon-ArrowLeft"></i>
        </button>
        <button
          className="product-next btn-nav-swiper-custom"
          aria-label="Next slide"
        >
          <i className="icon icon-ArrowRight"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="flat-spacing flat-animate-tab">
      <style>{`
        .btn-nav-swiper-custom {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 1px solid #e5e5e5;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .btn-nav-swiper-custom:hover {
          background-color: #f8f8f8;
          border-color: #cccccc;
          box-shadow: 0 6px 16px rgba(0,0,0,0.16);
        }
        .btn-nav-swiper-custom .icon {
          font-size: 20px;
          line-height: 1;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-nav-swiper-custom.swiper-button-disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }
        @media (min-width: 1024px) {
          .product-prev { left: -24px; }
          .product-next { right: -24px; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .product-prev { left: -16px; }
          .product-next { right: -16px; }
        }
        @media (max-width: 767px) {
          .product-prev { left: 8px; }
          .product-next { right: 8px; }
        }
      `}</style>
      <div className="container">
        <div className="sect-heading wow fadeInUp">
          <div>
            <h3 className="s-title font-instrument_serif mb-24">
              Freshly Picked For You
            </h3>
            <p className="desc cl-text-5">
              Discover our newest formulas made to nourish, hydrate, and glow.
            </p>
          </div>
          <ul className="list-tab-btn-1" role="tablist">
            <li className="nav-tab-item" role="presentation">
              <a href="#tabFeatured" data-bs-toggle="tab" className="tf-btn-tab active" role="tab">
                FEATURED COLLECTION
              </a>
            </li>
            <li className="nav-tab-item" role="presentation">
              <a href="#tabNew" data-bs-toggle="tab" className="tf-btn-tab" role="tab">
                NEW ARRIVALS
              </a>
            </li>
          </ul>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <p>Loading catalog...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">
            <p>Error loading catalog: {error}</p>
          </div>
        ) : (
          <div className="tab-content">
            <div className="tab-pane active show" id="tabFeatured" role="tabpanel">
              {renderProductSlider(featuredProducts)}
            </div>
            <div className="tab-pane" id="tabNew" role="tabpanel">
              {renderProductSlider(newArrivals)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}