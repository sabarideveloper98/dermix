import express from 'express';
import { 
  getRefundSettings, 
  updateRefundSettings, 
  cancelOrder, 
  processRefund, 
  getRefundStats, 
  getAllRefunds 
} from '../controllers/refund.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/settings', protect, admin, getRefundSettings);
router.put('/settings', protect, admin, updateRefundSettings);
router.put('/order/:id/cancel', protect, admin, cancelOrder);
router.post('/process', protect, admin, processRefund);
router.get('/stats', protect, admin, getRefundStats);
router.get('/', protect, admin, getAllRefunds);

export default router;
