import express from 'express';
import { body } from 'express-validator';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.use(protect); // Protect all cart routes

router.get('/', getCart);

router.post(
  '/add',
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  addToCart
);

router.put(
  '/update',
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  updateCartItem
);

router.delete(
  '/remove',
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
  ],
  validateRequest,
  removeFromCart
);

export default router;
