import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginContent() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");
        setLoading(true);

        try {
            const res = await login(email, password);
            // If API indicated unverified, route to OTP verification
            if (res && res.unverified) {
                navigate("/verify-otp", { state: { email: res.email, otp: res.otp } });
            } else if (res && res.role === "admin") {
                navigate("/admin");
            } else {
                navigate(from);
            }
        } catch (err) {
            setLocalError(err.message || "Invalid credentials. Please try again.");
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
                    <h3 className="title font-instrument_serif">Login</h3>
                    <form onSubmit={handleSubmit} className="form-log">
                        <div className="form-content">
                            {localError && (
                                <div className="alert alert-danger" style={{ padding: '10px', fontSize: '14px', borderRadius: '4px' }}>
                                    {localError}
                                </div>
                            )}
                            <fieldset className="tf-field">
                                <label className="text-body-xs" htmlFor="logName">Your email*</label>
                                <input
                                    className="style-3"
                                    type="email"
                                    id="logName"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </fieldset>
                            <fieldset className="tf-field">
                                <label className="text-body-xs" htmlFor="logPass">Password*</label>
                                <div className="password-wrapper w-100">
                                    <input
                                        className="password-field style-3"
                                        type="password"
                                        id="logPass"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </fieldset>
                        </div>
                        <div className="form-btn">
                            <button type="submit" className="tf-btn type-2 style-2 w-100" disabled={loading}>
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                            <Link to="/register" className="tf-btn-line">
                                <span className="fw-normal text-uppercase">
                                    Create an account
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </>
    )
}