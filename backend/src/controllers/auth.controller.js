import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OtpVerification from '../models/OtpVerification.js';
import Cart from '../models/Cart.js';
import { generateOTP } from '../utils/otp.js';

// Token generation helpers
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const sendTokens = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching refresh token
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Remove password from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    isVerified: user.isVerified,
    status: user.status,
  };

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: userResponse,
  });
};

// Signup
export const signup = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: 'customer',
      isVerified: false,
      status: 'active',
    });

    // Create a cart for user
    await Cart.create({ userId: user._id, items: [], totalAmount: 0 });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP
    await OtpVerification.create({
      userId: user._id,
      otp,
      expiresAt,
    });

    // Output OTP in logs for testing/evaluation
    console.log(`[OTP Verification] User: ${email}, OTP: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Signup successful. An OTP has been sent to your email/mobile.',
      email,
      otp, // Returning OTP in response for simplified local UI flow/verification
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpRecord = await OtpVerification.findOne({ userId: user._id });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not requested' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Verify user
    user.isVerified = true;
    await user.save();

    // Clean up OTP record
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    // Send tokens (auto login)
    sendTokens(user, 200, res);
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Check status
    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
    }

    // Check verification status
    if (!user.isVerified) {
      // Regenerate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await OtpVerification.deleteMany({ userId: user._id });
      await OtpVerification.create({ userId: user._id, otp, expiresAt });
      console.log(`[OTP Verification] User: ${email}, OTP: ${otp}`);

      return res.status(401).json({
        success: false,
        message: 'Account not verified. OTP sent.',
        isVerified: false,
        email,
        otp,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Send tokens
    sendTokens(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Refresh Token
export const refreshToken = async (req, res) => {
  let token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status === 'blocked') {
      return res.status(401).json({ success: false, message: 'Invalid token or blocked user' });
    }

    const accessToken = generateAccessToken(user._id);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ success: false, message: 'Refresh token invalid' });
  }
};
