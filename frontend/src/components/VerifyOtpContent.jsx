import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtpContent() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(location.state?.otp || '');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      await verifyOtp(email, otp);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="section-log tf-grid-layout gap-0 md-col-2">
        <div className="image-left">
          <img loading="lazy" width="960" height="952" src="assets/images/section/log.jpg" alt="Image" />
          <div className="infiniteSlide-text-icon">
            <div className="infiniteSlide infiniteSlide-wrapper" data-clone="3">
              <div className="infiniteSlide-item">
                <p className="text h1 font-instrument_serif text-white">
                  Beauty That Feels Like You
                </p>
              </div>
              <div className="infiniteSlide-item">
                <div className="br-dot stroke-white"></div>
              </div>
              <div className="infiniteSlide-item">
                <p className="text h1 font-instrument_serif troke-text_white">
                  Naturally Radiant
                </p>
              </div>
              <div className="infiniteSlide-item">
                <div className="br-dot stroke-white"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-right">
          <div className="content_inner">
            <h3 className="title font-instrument_serif">Verify Account</h3>
            <p className="desc cl-text-5 mb-24">
              We have sent a verification code to your email/mobile. Enter it below to activate your account.
            </p>
            <form onSubmit={handleSubmit} className="form-log">
              <div className="form-content">
                {localError && (
                  <div className="alert alert-danger" style={{ padding: '10px', fontSize: '14px', borderRadius: '4px' }}>
                    {localError}
                  </div>
                )}
                <fieldset className="tf-field">
                  <label className="text-body-xs" htmlFor="verifyEmail">Your Email*</label>
                  <input
                    className="style-3"
                    type="email"
                    id="verifyEmail"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </fieldset>
                <fieldset className="tf-field">
                  <label className="text-body-xs" htmlFor="verifyOtpCode">6-Digit OTP*</label>
                  <input
                    className="style-3"
                    type="text"
                    id="verifyOtpCode"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </fieldset>
              </div>
              <div className="form-btn mt-24">
                <button type="submit" className="tf-btn type-2 style-2 w-100" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Log In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
