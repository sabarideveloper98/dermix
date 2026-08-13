export default function AccountSett() {
    return (
    <>
        {/* Page Title */}
        <section classNameName="tf-page-heading_account flat-spacing">
            <div classNameName="container">
                <a href="account-page.html" classNameName="content d-inline-flex">
                    <div classNameName="account-icon d-flex">
                        <i classNameName="icon icon-ArrowLeft fs-24"></i>
                    </div>
                    <div classNameName="account-infor">
                        <h3 classNameName="info_name font-instrument_serif mb-8">
                            Account Settings
                        </h3>
                        <p classNameName="info_more cl-text-5">
                            Manage your account preferences
                        </p>
                    </div>
                </a>
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
                        <form className="col-right">
                            <div className="form-content">
                                <div className="tf-grid-layout gap-8 sm-col-2">
                                    <fieldset className="tf-field">
                                        <label for="f-nameInfor" className="text-body-xs">Firsr name</label>
                                        <input type="text" id="f-nameInfor" className="style-4" value="Sarah"
                                            placeholder="Enter Your First Name" required />
                                    </fieldset>
                                    <fieldset className="tf-field">
                                        <label for="l-nameInfor" className="text-body-xs">Last name</label>
                                        <input type="text" id="l-nameInfor" className="style-4" value="Johnson"
                                            placeholder="Enter You Last Name" required />
                                    </fieldset>
                                </div>
                                <fieldset className="tf-field">
                                    <label for="phoneInfor1" className="text-body-xs">Your email</label>
                                    <input type="email" id="phoneInfor1" className="style-4" value="sarah.johnson@email.com"
                                        placeholder="Enter Your Email" required />
                                </fieldset>
                                <fieldset className="tf-field">
                                    <label for="phoneInfor2" className="text-body-xs">Phone number</label>
                                    <input type="text" id="phoneInfor2" className="style-4" value="+1 (555) 123-4567"
                                        placeholder="Enter Your Phone" required />
                                </fieldset>
                            </div>
                            <div className="br-line bg-line-5"></div>
                            <button type="submit" className="btn-action_submit tf-btn type-4 align-self-end">
                                SAVE CHANGES
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
                        <form className="col-right">
                            <div className="form-content">
                                <fieldset className="tf-field">
                                    <label for="currentPass" className="text-body-xs">Current Password</label>
                                    <div className="password-wrapper w-100">
                                        <input className="password-field style-4" type="password" id="currentPass"
                                            placeholder="Enter current password" required />
                                        <span className="toggle-pass icon-EyeSlash cl-text-5"></span>
                                    </div>
                                </fieldset>
                                <fieldset className="tf-field">
                                    <label for="newPass" className="text-body-xs">New Password</label>
                                    <div className="password-wrapper w-100">
                                        <input className="password-field style-4" type="password" id="newPass"
                                            placeholder="Enter new password" required/>
                                        <span className="toggle-pass icon-EyeSlash cl-text-5"></span>
                                    </div>
                                </fieldset>
                                <fieldset className="tf-field">
                                    <label for="confirmPass" className="text-body-xs">Confirm New Password</label>
                                    <div className="password-wrapper w-100">
                                        <input className="password-field style-4" type="password" id="confirmPass"
                                            placeholder="Confirm new password" required/>
                                        <span className="toggle-pass icon-EyeSlash cl-text-5"></span>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="br-line bg-line-5"></div>
                            <button type="submit" className="btn-action_submit tf-btn type-4 align-self-end">
                                Update password
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
                            <button type="submit" className="btn-delete_account tf-btn type-4 align-self-start">
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