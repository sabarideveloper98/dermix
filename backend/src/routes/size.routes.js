import express from 'express';
import {
  getSizes,
  createSize,
  updateSize,
  deleteSize,
} from '../controllers/size.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getSizes)
  .post(protect, admin, createSize);

router.route('/:id')
  .put(protect, admin, updateSize)
  .patch(protect, admin, updateSize)
  .delete(protect, admin, deleteSize);

export default router;
