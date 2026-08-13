import express from 'express';
import { body } from 'express-validator';
import { getUserProfile, updateUserProfile, updateUserPassword } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('mobile').optional().notEmpty().withMessage('Mobile number cannot be empty'),
  ],
  validateRequest,
  updateUserProfile
);

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  ],
  validateRequest,
  updateUserPassword
);

export default router;
