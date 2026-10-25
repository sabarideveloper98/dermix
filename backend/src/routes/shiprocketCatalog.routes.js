import express from "express";

import {
  fetchShiprocketProducts,
  fetchShiprocketCollections,
  fetchShiprocketCollectionProducts,
} from "../controllers/shiprocketCatalog.controller.js";

const router = express.Router();

router.get("/products", fetchShiprocketProducts);
router.get("/collections", fetchShiprocketCollections);
router.get(
  "/collections/:collectionId/products",
  fetchShiprocketCollectionProducts
);

export default router;