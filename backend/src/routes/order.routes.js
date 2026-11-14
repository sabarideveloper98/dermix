import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
  getOrderTracking,
  calculateShippingRate,
  retryShiprocketSync,
} from '../controllers/order.controller.js';
import { protect, admin, protectOptional } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Public track route (accessible without login)
router.get('/track/:orderNumber', trackOrder);

// Customer routes
router.post(
  '/',
  protectOptional,
  [body('addressId').optional().isMongoId().withMessage('Invalid shipping address ID')],
  validateRequest,
  createOrder
);
router.post('/shiprocket/shipping-rate', calculateShippingRate);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/shiprocket-tracking', protect, getOrderTracking);

// Admin-only routes
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/sync-shiprocket', protect, admin, retryShiprocketSync);

export default router;