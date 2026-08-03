import express from 'express';
import { body } from 'express-validator';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/', getAddresses);

router.post(
  '/',
  [
    body('street1').notEmpty().withMessage('Street address is required'),
    body('district').notEmpty().withMessage('District/City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('pincode').notEmpty().withMessage('Pincode is required'),
  ],
  validateRequest,
  createAddress
);

router.put(
  '/:id',
  [
    body('street1').optional().notEmpty().withMessage('Street address cannot be empty'),
    body('district').optional().notEmpty().withMessage('District/City cannot be empty'),
    body('state').optional().notEmpty().withMessage('State cannot be empty'),
    body('pincode').optional().notEmpty().withMessage('Pincode cannot be empty'),
  ],
  validateRequest,
  updateAddress
);

router.delete('/:id', deleteAddress);

export default router;
