import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterContent() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");
        setLoading(true);

        try {
            const fullName = `${firstName} ${lastName}`.trim();
            const res = await signup(fullName, email, mobile, password);
            // Redirect to OTP verify with the sent OTP details
            navigate("/verify-otp", { state: { email, otp: res.otp } });
        } catch (err) {
            setLocalError(err.message || "Failed to register account.");
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
        <div className="section-log tf-grid-layout gap-0 md-col-2">
            <div className="image-left">
                <img loading="lazy" width="960" height="952" src="assets/images/section/log.jpg" alt="Image"/>
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
                    <h3 className="title font-instrument_serif">Create an Account</h3>
                    <form onSubmit={handleSubmit} className="form-log">
                        <div className="form-content">
                            {localError && (
                                <div className="alert alert-danger" style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', gridColumn: 'span 2' }}>
                                    {localError}
                                </div>
                            )}
                            <fieldset className="tf-field">
                                <label className="text-body-xs" htmlFor="registerFirstname">First name*</label>
                                <input
                                    className="style-3"
                                    type="text"
                                    id="registerFirstname"
                                    placeholder="Your first name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </fieldset>
                            <fieldset className="tf-field">
                                <label className="text-body-xs" htmlFor="registerLastname">Last name*</label>
                                <input
                                    className="style-3"
                                    type="text"
                                    id="registerLastname"
                                    placeholder="Your last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </fieldset>
                            <fieldset className="tf-field">
                                <label className="text-body-xs" htmlFor="registerEmail">Your email*</label>
                                <input
                                    className="style-3"
                                    type="email"
                                    id="registerEmail"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </fieldset>
                            <fieldset className="tf-field">
                                <label className="text-body-xs" htmlFor="registerMobile">Mobile Number*</label>
                                <input
                                    className="style-3"
                                    type="tel"
                                    id="registerMobile"
                                    placeholder="Enter your mobile number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
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
                        <div className="tf-grid-layout mb-24 mt-24">
                            <div className="checkbox-wrap">
                                <input type="checkbox" id="registerTerm" className="tf-check" defaultChecked required/>
                                <label htmlFor="registerTerm" className="text-body-s text-start">
                                    By clicking here, i agree to the
                                    <a href="#" className="link-underline ml-4">Terms of use</a>
                                    and
                                    <a href="#" className="link-underline ml-4">Privacy policy.</a>
                                </label>
                            </div>
                        </div>
                        <div className="form-btn">
                            <button type="submit" className="tf-btn type-2 style-2 w-100" disabled={loading}>
                                {loading ? "Creating..." : "Create an account"}
                            </button>
                            <Link to="/login" className="tf-btn-line">
                                <span className="fw-normal text-uppercase">
                                    Back to login
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