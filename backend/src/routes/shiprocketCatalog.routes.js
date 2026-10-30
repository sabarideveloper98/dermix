import express from "express";

import {
  fetchShiprocketProducts,
  fetchShiprocketCollections,
  fetchShiprocketCollectionProducts,
} from "../controllers/shiprocketCatalog.controller.js";

const router = express.Router();

// Fetch all products
router.get(
  "/products",
  fetchShiprocketProducts
);

// Fetch all collections
router.get(
  "/collections",
  fetchShiprocketCollections
);

// Fetch products belonging to a collection by URL ID
router.get(
  "/collections/:collectionId/products",
  fetchShiprocketCollectionProducts
);

// Fetch collection products using header or query parameter
router.get(
  "/collection-products",
  fetchShiprocketCollectionProducts
);

export default router;
