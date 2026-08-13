import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

export default function AccountSett() {
    const { user } = useAuth();
    
    // Personal Info State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Password Visibility State
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setMobile(user.mobile || "");
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMessage("");
        setProfileError("");
        setLoadingProfile(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/api/users/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ name, email, mobile })
            });
            const data = await res.json();
            if (data.success) {
                setProfileMessage("Profile updated successfully!");
                // Note: user object in context requires a reload or context update function to reflect immediately across app
            } else {
                setProfileError(data.message || "Failed to update profile");
            }
        } catch (error) {
            setProfileError("An error occurred");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage("");
        setPasswordError("");
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }
        setLoadingPassword(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/api/users/password`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                setPasswordMessage("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPasswordError(data.message || "Failed to update password");
            }
        } catch (error) {
            setPasswordError("An error occurred");
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
    <>
        {/* Page Title */}
        <section className="tf-page-heading_account flat-spacing">
            <div className="container">
                <Link to="/myaccount" className="content d-inline-flex">
                    <div className="account-icon d-flex">
                        <i className="icon icon-ArrowLeft fs-24"></i>
                    </div>
                    <div className="account-infor">
                        <h3 className="info_name font-instrument_serif mb-8">
                            Account Settings
                        </h3>
                        <p className="info_more cl-text-5">
                            Manage your account preferences
                        </p>
                    </div>
                </Link>
            </div>
        </section>
        {/* Page Title */}
        <div className="my-account-setting flat-spacing-mix-1">
            <div className="container">
                <div className="row gy-16">
                    <div className="col-lg-4">
                        <h6 className="font-instrument_serif mb-8">
                            Personal Information
                        </h6>
                        <p className="cl-text-5">
                            Update your personal details
                        </p>
                    </div>
                    <div className="col-lg-8">
                        <form className="col-right" onSubmit={handleProfileSubmit}>
                            {profileMessage && <p className="text-success mb-2">{profileMessage}</p>}
                            {profileError && <p className="text-danger mb-2">{profileError}</p>}
                            <div className="form-content">
                                <fieldset className="tf-field">
                                    <label htmlFor="f-nameInfor" className="text-body-xs">Full Name</label>
                                    <input type="text" id="f-nameInfor" className="style-4" value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter Your Full Name" required />
                                </fieldset>
                                <fieldset className="tf-field">
                                    <label htmlFor="phoneInfor1" className="text-body-xs">Your Email</label>
                                    <input type="email" id="phoneInfor1" className="style-4" value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter Your Email" required />
                                </fieldset>
                                <fieldset className="tf-field">
                                    <label htmlFor="phoneInfor2" className="text-body-xs">Phone Number</label>
                                    <input type="text" id="phoneInfor2" className="style-4" value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="Enter Your Phone" required />
                                </fieldset>
                            </div>
                            <div className="br-line bg-line-5"></div>
                            <button type="submit" disabled={loadingProfile} className="btn-action_submit tf-btn type-4 align-self-end">
                                {loadingProfile ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="row gy-16">
                    <div className="col-lg-4">
                        <h6 className="font-instrument_serif mb-8">
                            Change Password
                        </h6>
                        <p className="cl-text-5">
                            Update your account password
                        </p>
                    </div>
                    <div className="col-lg-8">
                        <form className="col-right" onSubmit={handlePasswordSubmit}>
                            {passwordMessage && <p className="text-success mb-2">{passwordMessage}</p>}
                            {passwordError && <p className="text-danger mb-2">{passwordError}</p>}
                            <div className="form-content">
                                <fieldset className="tf-field">
                                    <label htmlFor="currentPass" className="text-body-xs">Current Password</label>
                                    <div className="password-wrapper w-100">
                                        <input className="password-field style-4" type={showCurrentPassword ? "text" : "password"} id="currentPass"
                                            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password" required />
                                        <span className={`toggle-pass ${showCurrentPassword ? 'icon-Eye' : 'icon-EyeSlash'} cl-text-5`} style={{ cursor: "pointer" }} onClick={() => setShowCurrentPassword(!showCurrentPassword)}></span>
                                    </div>
                                </fieldset>
                                <fieldset className="tf-field">
                                    <label htmlFor="newPass" className="text-body-xs">New Password</label>
                                    <div className="password-wrapper w-100">
                                        <input className="password-field style-4" type={showNewPassword ? "text" : "password"} id="newPass"
                                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password" required/>
                                        <span className={`toggle-pass ${showNewPassword ? 'icon-Eye' : 'icon-EyeSlash'} cl-text-5`} style={{ cursor: "pointer" }} onClick={() => setShowNewPassword(!showNewPassword)}></span>
                                    </div>
                                </fieldset>
                                <fieldset className="tf-field">
                                    <label htmlFor="confirmPass" className="text-body-xs">Confirm New Password</label>
                                    <div className="password-wrapper w-100">
                                        <input className="password-field style-4" type={showConfirmPassword ? "text" : "password"} id="confirmPass"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password" required/>
                                        <span className={`toggle-pass ${showConfirmPassword ? 'icon-Eye' : 'icon-EyeSlash'} cl-text-5`} style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}></span>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="br-line bg-line-5"></div>
                            <button type="submit" disabled={loadingPassword} className="btn-action_submit tf-btn type-4 align-self-end">
                                {loadingPassword ? 'UPDATING...' : 'Update password'}
                            </button>
                        </form>
                    </div>
                </div>
               
                <div className="row gy-16">
                    <div className="col-lg-4">
                        <h6 className="font-instrument_serif mb-8 cl-text-error_800">
                            Delete Account
                        </h6>
                        <p className="cl-text-5">
                            Permanently delete your account & all data
                        </p>
                    </div>
                    <div className="col-lg-8">
                        <div className="col-right delete-account m-0">
                            <p className="text-notice">
                                *Once you delete your account, there is no going back. All your data, orders, and
                                preferences will be permanently removed.
                            </p>
                            <button type="button" className="btn-delete_account tf-btn type-4 align-self-start">
                                Delete my account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </>
    )
}