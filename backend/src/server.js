import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import addressRoutes from './routes/address.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Controller imports for root public routes
import { getBanners, getInstagramVideos } from './controllers/admin.controller.js';
import { body } from 'express-validator';
import { protect, protectOptional } from './middlewares/auth.middleware.js';
import { validateRequest } from './middlewares/validation.middleware.js';
import { createOrder, trackOrder } from './controllers/order.controller.js';
import { createRazorpayOrder, verifyPayment } from './controllers/payment.controller.js';

const app = express();

// Connect to Database
connectDB();

// CORS config
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body Parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging in dev
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting (Security check)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Public Root Routes
app.get('/api/banners', getBanners);
app.get('/api/instagram-videos', getInstagramVideos);

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Compatibility fallback endpoints matching requested API spec
app.post(
  '/api/checkout',
  [body('addressId').optional().isMongoId().withMessage('Invalid shipping address ID')],
  validateRequest,
  createOrder
);
app.post(
  '/api/payment/create-order',
  [body('orderId').optional().isMongoId().withMessage('Invalid order ID')],
  validateRequest,
  createRazorpayOrder
);
app.post(
  '/api/payment/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID from Razorpay is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID from Razorpay is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature from Razorpay is required'),
    body('orderId').optional().isMongoId().withMessage('Invalid internal order ID'),
  ],
  validateRequest,
  verifyPayment
);
app.get('/api/orders/track/:id', trackOrder);

// Base route health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Dermix API is healthy and running' });
});

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
