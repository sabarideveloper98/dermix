import express from 'express';
import { body } from 'express-validator';
import {
  createRazorpayOrder,
  verifyPayment,
  getPaymentsHistory,
} from '../controllers/payment.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Customer payment routes (accessible without login)
router.post(
  '/razorpay/create-order',
  [body('orderId').optional().isMongoId().withMessage('Invalid order ID')],
  validateRequest,
  createRazorpayOrder
);

router.post(
  '/razorpay/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID from Razorpay is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID from Razorpay is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature from Razorpay is required'),
    body('orderId').optional().isMongoId().withMessage('Invalid internal order ID'),
  ],
  validateRequest,
  verifyPayment
);

// Admin-only payment history
router.get('/history', protect, admin, getPaymentsHistory);

export default router;
