import express from 'express';
import {
  getDashboardStats,
  getCustomers,
  toggleCustomerStatus,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getInstagramVideos,
  addInstagramVideo,
  updateInstagramVideo,
  deleteInstagramVideo,
  getAdminOrders,
} from '../controllers/admin.controller.js';
import {
  getAdminRefunds,
  getRefundDetails,
  updateRefundStatus,
  getRefundSettings,
  updateRefundSettings
} from '../controllers/refund.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Publicly readable endpoints (no admin requirement, returns active records)
router.get('/public/banners', getBanners);
router.get('/public/instagram-videos', getInstagramVideos);

// Protected Admin Dashboard & Customer operations
router.get('/stats', protect, admin, getDashboardStats);
router.get('/customers', protect, admin, getCustomers);
router.patch('/customers/:id/status', protect, admin, toggleCustomerStatus);
router.get('/orders', protect, admin, getAdminOrders);

// Banner Management (Admin)
router.get('/banners', protect, admin, getBanners);
router.post('/banners', protect, admin, upload.single('image'), createBanner);
router.put('/banners/:id', protect, admin, upload.single('image'), updateBanner);
router.delete('/banners/:id', protect, admin, deleteBanner);

// Instagram Video Management (Admin)
router.get('/instagram-videos', protect, admin, getInstagramVideos);
router.post('/instagram-videos', protect, admin, addInstagramVideo);
router.put('/instagram-videos/:id', protect, admin, updateInstagramVideo);
router.delete('/instagram-videos/:id', protect, admin, deleteInstagramVideo);

// Refund Management (Admin)
router.get('/refunds', protect, admin, getAdminRefunds);
router.get('/refunds/:id', protect, admin, getRefundDetails);
router.put('/refunds/:id/status', protect, admin, updateRefundStatus);
router.get('/refund-settings', protect, admin, getRefundSettings);
router.put('/refund-settings', protect, admin, updateRefundSettings);

export default router;
