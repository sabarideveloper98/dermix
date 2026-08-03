import express from 'express';
import { body } from 'express-validator';
import { signup, verifyOtp, login, logout, refreshToken } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Signup route
router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  signup
);

// OTP Verification route
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  ],
  validateRequest,
  verifyOtp
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

// Logout route
router.post('/logout', logout);

// Refresh token route
router.post('/refresh-token', refreshToken);

export default router;
