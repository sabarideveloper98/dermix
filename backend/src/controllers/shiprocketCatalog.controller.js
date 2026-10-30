import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ShiprocketCatalogId from "../models/ShiprocketCatalogId.js";
import ShiprocketCatalogCounter from "../models/ShiprocketCatalogCounter.js";

// ======================================================
// GENERATE / GET NUMERIC ID
// ======================================================

const getNumericId = async (entityType, sourceId) => {
  const source = String(sourceId);

  let mapping = await ShiprocketCatalogId.findOne({
    entityType,
    sourceId: source,
  }).lean();

  if (mapping) {
    return mapping.numericId;
  }

  const counter = await ShiprocketCatalogCounter.findOneAndUpdate(
    { key: entityType },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  try {
    mapping = await ShiprocketCatalogId.create({
      entityType,
      sourceId: source,
      numericId: counter.seq,
    });

    return mapping.numericId;
  } catch (error) {
    if (error.code === 11000) {
      mapping = await ShiprocketCatalogId.findOne({
        entityType,
        sourceId: source,
      }).lean();

      if (mapping) {
        return mapping.numericId;
      }
    }

    throw error;
  }
};

// ======================================================
// PAGINATION
// Supports Headers and Query Parameters
// ======================================================

const getPagination = (req) => {
  const page = Math.max(
    1,
    parseInt(req.get("x-page") ?? req.query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      parseInt(req.get("x-limit") ?? req.query.limit, 10) || 100
    )
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const imageObject = (url) => {
  return url ? { src: url } : null;
};

const getVariantTitle = (variant) => {
  const size = variant.size;

  if (size && typeof size === "object") {
    return size.name || size.title || size.label || "Default";
  }

  return "Default";
};

// ======================================================
// TAG FORMAT FIX
//
// Shiprocket expects:
// "tags": ""
//
// NOT:
// "tags": []
// ======================================================

const formatTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags
      .filter((tag) => tag !== null && tag !== undefined)
      .map((tag) => String(tag))
      .join(", ");
  }

  if (tags === null || tags === undefined) {
    return "";
  }

  return String(tags);
};

// ======================================================
// FORMAT PRODUCT FOR SHIPROCKET
// ======================================================

const formatProduct = async (product) => {
  const productId = String(product._id);

  const collectionId = product.categoryId?._id
    ? await getNumericId(
        "collection",
        product.categoryId._id
      )
    : null;

  // Product Images
  const images = (product.images || [])
    .filter(Boolean)
    .map((src) => ({
      src,
    }));

  // Product Variants
  const variants = product.sizes?.length
    ? product.sizes
    : [
        {
          _id: "default",
          mrpPrice: product.mrpPrice,
          salePrice: product.salePrice,
          size: null,
        },
      ];

  const formattedVariants = await Promise.all(
    variants.map(async (variant) => {
      const variantSourceId = `${productId}:${
        variant._id || "default"
      }`;

      const variantId = await getNumericId(
        "variant",
        variantSourceId
      );

      const variantTitle = getVariantTitle(variant);

      return {
        id: variantId,

        title: variantTitle,

        price: Number(
          variant.salePrice ??
          product.salePrice ??
          0
        ),

        compare_at_price: Number(
          variant.mrpPrice ??
          product.mrpPrice ??
          0
        ),

        sku: "",

        quantity: Number(product.qty || 0),

        taxable: false,

        option_values: [
          {
            option_name: "Size",
            value: variantTitle,
          },
        ],

        grams: 0,

        weight: 0,

        weight_unit: "g",

        image: imageObject(product.images?.[0]),
      };
    })
  );

  return {
    id: await getNumericId(
      "product",
      product._id
    ),

    title: product.name,

    body_html: product.description || "",

    vendor: "",

    product_type: product.categoryId?.name || "",

    created_at: product.createdAt
      ? new Date(product.createdAt).toISOString()
      : null,

    handle: slugify(product.name),

    updated_at: product.updatedAt
      ? new Date(product.updatedAt).toISOString()
      : null,

    // IMPORTANT FIX:
    // Always return a STRING instead of an ARRAY.
    tags: formatTags(product.tags),

    status: product.status,

    collection_id: collectionId,

    variants: formattedVariants,

    image: imageObject(product.images?.[0]),

    images,

    options: [
      {
        name: "Size",

        values: [
          ...new Set(
            formattedVariants.map(
              (variant) => variant.title
            )
          ),
        ],
      },
    ],
  };
};

// ======================================================
// GET ALL PRODUCTS
//
// GET /api/shiprocket/catalog/products
//
// Optional:
// ?page=1&limit=100
// ?collection_id=1
//
// Headers:
// x-page
// x-limit
// x-collection-id
// ======================================================

export const fetchShiprocketProducts = async (req, res) => {
  try {
    const { limit, skip } = getPagination(req);

    const filter = {
      status: "active",
    };

    const requestedCollectionId =
      req.get("x-collection-id") ??
      req.query.collection_id;

    if (requestedCollectionId !== undefined) {
      const numericId = Number(requestedCollectionId);

      if (
        !Number.isSafeInteger(numericId) ||
        numericId < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "collection_id must be a valid numeric ID",
        });
      }

      const mapping =
        await ShiprocketCatalogId.findOne({
          entityType: "collection",
          numericId,
        }).lean();

      if (!mapping) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      filter.categoryId = mapping.sourceId;
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),

      Product.find(filter)
        .populate("categoryId", "name")
        .populate("sizes.size")
        .sort({
          createdAt: -1,
          _id: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const formattedProducts = await Promise.all(
      products.map(formatProduct)
    );

    return res.status(200).json({
      data: {
        total,
        products: formattedProducts,
      },
    });
  } catch (error) {
    console.error(
      "Shiprocket products API error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// ======================================================
// GET ALL COLLECTIONS
//
// GET /api/shiprocket/catalog/collections
//
// Optional:
// ?page=1&limit=100
// ======================================================

export const fetchShiprocketCollections = async (
  req,
  res
) => {
  try {
    const { limit, skip } = getPagination(req);

    const filter = {
      status: "active",
    };

    const [total, categories] = await Promise.all([
      Category.countDocuments(filter),

      Category.find(filter)
        .sort({
          createdAt: 1,
          _id: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const collections = await Promise.all(
      categories.map(async (category) => {
        return {
          id: await getNumericId(
            "collection",
            category._id
          ),

          title: category.name,

          body_html: category.description || "",

          handle: slugify(category.name),

          created_at: category.createdAt
            ? new Date(
                category.createdAt
              ).toISOString()
            : null,

          image: imageObject(category.image),
        };
      })
    );

    return res.status(200).json({
      data: {
        total,
        collections,
      },
    });
  } catch (error) {
    console.error(
      "Shiprocket collections API error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
    });
  }
};

// ======================================================
// GET COLLECTION PRODUCTS
//
// Supported:
//
// GET /api/shiprocket/catalog/collection-products
//
// GET /api/shiprocket/catalog/collections/1/products
//
// GET /api/shiprocket/catalog/collection-products?collection_id=1
//
// Header:
// x-collection-id: 1
// ======================================================

export const fetchShiprocketCollectionProducts = async (
  req,
  res
) => {
  try {
    const requestedCollectionId =
      req.get("x-collection-id") ??
      req.params.collectionId ??
      req.query.collection_id;

    if (
      requestedCollectionId === undefined ||
      String(requestedCollectionId).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Collection ID is required",
      });
    }

    const collectionId = Number(
      requestedCollectionId
    );

    if (
      !Number.isSafeInteger(collectionId) ||
      collectionId < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Collection ID must be a valid positive integer",
      });
    }

    // Find Numeric Collection Mapping

    const mapping =
      await ShiprocketCatalogId.findOne({
        entityType: "collection",
        numericId: collectionId,
      }).lean();

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    // Find Actual Category

    const category = await Category.findById(
      mapping.sourceId
    ).lean();

    if (
      !category ||
      category.status !== "active"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Collection not found or inactive",
      });
    }

    const { limit, skip } = getPagination(req);

    const filter = {
      categoryId: category._id,
      status: "active",
    };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),

      Product.find(filter)
        .populate("categoryId", "name")
        .populate("sizes.size")
        .sort({
          createdAt: -1,
          _id: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const formattedProducts = await Promise.all(
      products.map(formatProduct)
    );

    return res.status(200).json({
      data: {
        collection: {
          id: collectionId,
          title: category.name,
        },

        total,

        products: formattedProducts,
      },
    });
  } catch (error) {
    console.error(
      "Shiprocket collection products API error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch collection products",
    });
  }
};
