import express from "express";
import {
  processCheckout,
  getShiprocketOrderDetails,
  verifyPaymentAndOrder,
  handleOrderWebhook
} from "../controllers/shiprocketCheckout.controller.js";
import { protectOptional } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Process checkout workflow: fetch-products -> generate -> test-checkout
router.post("/process", protectOptional, processCheckout);

// Compatibility alias for headless token generation
router.post("/headless/access-token", protectOptional, processCheckout);

// Query Order Details from Shiprocket
router.post("/order-details", getShiprocketOrderDetails);
router.get("/order-details", getShiprocketOrderDetails);

// Verify Payment and Order Status
router.get("/verify-payment", verifyPaymentAndOrder);
router.post("/verify-payment", verifyPaymentAndOrder);

// Ingest Order Webhook
router.post("/order-webhook", handleOrderWebhook);
router.post("/webhook", handleOrderWebhook);

export default router;
