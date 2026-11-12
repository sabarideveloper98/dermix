import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getStockHistory,
  toggleProductStatus,
  updateProductContent,
  getProductTabImages,
  updateProductTabImages,
} from '../controllers/product.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id/tab-images', getProductTabImages);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.patch('/:id/stock', protect, admin, updateStock);
router.get('/:id/stock-history', protect, admin, getStockHistory);
router.patch('/:id/status', protect, admin, toggleProductStatus);
router.patch('/:id/content', protect, admin, upload.single('ingredientsImage'), updateProductContent);
router.put('/:id/content', protect, admin, upload.single('ingredientsImage'), updateProductContent);
router.patch(
  '/:id/tab-images',
  protect,
  admin,
  upload.fields([
    { name: 'howToUseImage', maxCount: 1 },
    { name: 'whatItDoesImage', maxCount: 1 },
    { name: 'ingredientsImage', maxCount: 1 },
  ]),
  updateProductTabImages
);
router.put(
  '/:id/tab-images',
  protect,
  admin,
  upload.fields([
    { name: 'howToUseImage', maxCount: 1 },
    { name: 'whatItDoesImage', maxCount: 1 },
    { name: 'ingredientsImage', maxCount: 1 },
  ]),
  updateProductTabImages
);

export default router;
