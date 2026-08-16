import express from 'express';
import { 
  requestRefund,
  getMyRefundRequests
} from '../controllers/refund.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/request', protect, upload.array('images', 5), requestRefund);
router.get('/my-requests', protect, getMyRefundRequests);

export default router;
