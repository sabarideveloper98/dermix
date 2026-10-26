import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ShiprocketCatalogId from "../models/ShiprocketCatalogId.js";
import ShiprocketCatalogCounter from "../models/ShiprocketCatalogCounter.js";

const getNumericId = async (entityType, sourceId) => {
  const source = String(sourceId);

  let mapping = await ShiprocketCatalogId.findOne({
    entityType,
    sourceId: source,
  }).lean();

  if (mapping) {
    return mapping.numericId;
  }

  // Reserve a new numeric ID for this entity type.
  const counter = await ShiprocketCatalogCounter.findOneAndUpdate(
    { key: entityType },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  try {
    mapping = await ShiprocketCatalogId.create({
      entityType,
      sourceId: source,
      numericId: counter.seq,
    });

    return mapping.numericId;
  } catch (error) {
    // If concurrent requests created the same mapping, reuse it.
    if (error.code === 11000) {
      mapping = await ShiprocketCatalogId.findOne({
        entityType,
        sourceId: source,
      }).lean();

      if (mapping) return mapping.numericId;
    }

    throw error;
  }
};

const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 100)
  );

  return { page, limit, skip: (page - 1) * limit };
};

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const imageObject = (url) => (url ? { src: url } : null);

const getVariantTitle = (variant) => {
  const size = variant.size;

  if (size && typeof size === "object") {
    return size.name || size.title || size.label || "Default";
  }

  return "Default";
};

const formatProduct = async (product) => {
  const productId = String(product._id);
  const collectionId = product.categoryId?._id
    ? await getNumericId("collection", product.categoryId._id)
    : null;

  const images = (product.images || [])
    .filter(Boolean)
    .map((src) => ({ src }));

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
      const variantSourceId = `${productId}:${variant._id || "default"}`;
      const variantId = await getNumericId("variant", variantSourceId);

      return {
        id: variantId,
        title: getVariantTitle(variant),
        price: Number(variant.salePrice ?? product.salePrice ?? 0),
        compare_at_price: Number(variant.mrpPrice ?? product.mrpPrice ?? 0),
        sku: "",
        quantity: Number(product.qty || 0),
        taxable: false,
        option_values: [
          {
            option_name: "Size",
            value: getVariantTitle(variant),
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
    id: await getNumericId("product", product._id),
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
    tags: [],
    status: product.status,
    collection_id: collectionId,
    variants: formattedVariants,
    image: imageObject(product.images?.[0]),
    images,
    options: [
      {
        name: "Size",
        values: [
          ...new Set(formattedVariants.map((variant) => variant.title)),
        ],
      },
    ],
  };
};

// GET /shiprocket/products?page=1&limit=100
// Optional: /shiprocket/products?collection_id=123
export const fetchShiprocketProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const filter = { status: "active" };

    if (req.query.collection_id !== undefined) {
      const numericId = Number(req.query.collection_id);

      if (!Number.isSafeInteger(numericId) || numericId < 1) {
        return res.status(400).json({
          success: false,
          message: "collection_id must be a valid numeric ID",
        });
      }

      const mapping = await ShiprocketCatalogId.findOne({
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
        .sort({ createdAt: -1, _id: 1 })
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
    console.error("Shiprocket products API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// GET /shiprocket/collections?page=1&limit=100
export const fetchShiprocketCollections = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const filter = { status: "active" };

    const [total, categories] = await Promise.all([
      Category.countDocuments(filter),
      Category.find(filter)
        .sort({ createdAt: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const collections = await Promise.all(
      categories.map(async (category) => ({
        id: await getNumericId("collection", category._id),
        title: category.name,
        body_html: category.description || "",
        handle: slugify(category.name),
        created_at: category.createdAt
          ? new Date(category.createdAt).toISOString()
          : null,
        image: imageObject(category.image),
      }))
    );

    return res.status(200).json({
      data: {
        total,
        collections,
      },
    });
  } catch (error) {
    console.error("Shiprocket collections API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
    });
  }
};

// GET /shiprocket/collections/:collectionId/products?page=1&limit=100
export const fetchShiprocketCollectionProducts = async (req, res) => {
  try {
    const collectionId = Number(req.params.collectionId);

    if (!Number.isSafeInteger(collectionId) || collectionId < 1) {
      return res.status(400).json({
        success: false,
        message: "Collection ID must be numeric",
      });
    }

    const mapping = await ShiprocketCatalogId.findOne({
      entityType: "collection",
      numericId: collectionId,
    }).lean();

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    const category = await Category.findById(mapping.sourceId).lean();

    if (!category || category.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Collection not found or inactive",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const filter = {
      categoryId: category._id,
      status: "active",
    };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate("categoryId", "name")
        .populate("sizes.size")
        .sort({ createdAt: -1, _id: 1 })
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
    console.error("Shiprocket collection products API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch collection products",
    });
  }
};