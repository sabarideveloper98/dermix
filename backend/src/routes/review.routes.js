import express from 'express';
import {
  createReview,
  getProductReviews,
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect, admin, protectOptional } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public / Customer routes
router.post('/', protectOptional, upload.array('images', 5), createReview);
router.get('/product/:productId', getProductReviews);

// Admin-only routes
router.get('/admin', protect, admin, getAdminReviews);
router.patch('/admin/:id/status', protect, admin, updateReviewStatus);
router.delete('/admin/:id', protect, admin, deleteReview);

export default router;
