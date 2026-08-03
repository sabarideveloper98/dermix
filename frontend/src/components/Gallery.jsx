import { useEffect, useState } from "react";

import { API_BASE } from "../config";

export default function Gallery() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/instagram-videos`);
        const data = await res.json();
        if (res.ok && data.success) {
          setVideos(data.videos);
        }
      } catch (err) {
        console.error("Error loading videos:", err);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="flat-spacing">
      <div className="infiniteSlide-gallery">
        <div className="infiniteSlide infiniteSlide-wrapper" data-clone="2" data-speed="100">
          {/* Clone 1 */}
          <div className="infiniteSlide-item">
            <div className="gallery-v01">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="gallery-icon hover-tooltip">
                <i className="icon icon-LogoInstagram"></i>
                <span className="tooltip">Instagram</span>
              </a>
              <div className="gallery-image">
                <img className="wow fadeZoomOut" width="469" height="585" src="assets/images/gallery/gallery-1.jpg" alt="Image" />
              </div>
            </div>
          </div>

          <div className="infiniteSlide-item">
            <div className="gallery-v01">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="gallery-icon hover-tooltip">
                <i className="icon icon-LogoInstagram"></i>
                <span className="tooltip">Instagram</span>
              </a>
              <div className="gallery-image">
                <img width="469" height="585" src="assets/images/gallery/gallery-2.jpg" alt="Image" />
              </div>
            </div>
          </div>

          <div className="infiniteSlide-item">
            <div className="gallery-v01">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="gallery-icon hover-tooltip">
                <i className="icon icon-LogoInstagram"></i>
                <span className="tooltip">Instagram</span>
              </a>
              <div className="gallery-image">
                <img width="469" height="585" src="assets/images/gallery/gallery-3.jpg" alt="Image" />
              </div>
            </div>
          </div>

          <div className="infiniteSlide-item">
            <div className="gallery-v01 style-3">
              <div className="gallery-image">
                <img width="469" height="585" src="assets/images/gallery/gallery-1.jpg" alt="Image" />
              </div>
              <div className="gallery-content">
                <h5 className="gallery_name font-instrument_serif lh-xl-40">
                  Real routines, natural <br className="d-none d-md-block" />
                  glow – shared by our community.
                </h5>
                <p className="gallery_desc cl-text-5">
                  Tag us @Dermix for a chance <br className="d-none d-md-block" />
                  to be featured!
                </p>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="tf-btn btn-white w-100 mt-auto">
                  Follow Us
                  <i className="icon icon-LogoInstagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Video Section */}
      {videos.length > 0 && (
        <div className="container mt-5">
          <div className="sect-heading text-center mb-4">
            <h3 className="s-title font-instrument_serif">Community Video Spotlights</h3>
            <p className="desc cl-text-5">Watch skin routines shared by clinical minds and our community.</p>
          </div>
          <div className="row gy-4 justify-content-center">
            {videos.map((vid) => (
              <div key={vid._id} className="col-12 col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm overflow-hidden h-100" style={{ borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={vid.videoLink}
                      title={vid.title}
                      allowFullScreen
                      loading="lazy"
                      style={{ border: 0 }}
                    ></iframe>
                  </div>
                  <div className="card-body p-3">
                    <h6 className="card-title text-center mb-0 font-instrument_serif fw-normal" style={{ fontSize: '18px' }}>
                      {vid.title}
                    </h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}