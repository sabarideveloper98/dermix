import Product from "../models/Product.js";
import Category from "../models/Category.js";

// GET /api/shiprocket/catalog/products?page=1&limit=100
export const fetchShiprocketProducts = async (req, res) => {
  try {
    console.log("Shiprocket products API called");

    const products = await Product.find({})
      .populate("categoryId", "name")
      .populate("sizes.size")
      .limit(100)
      .lean();

    console.log("Total products found:", products.length);
    console.log("First product:", products[0]);

    return res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error("Shiprocket product sync error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/shiprocket/catalog/collections?page=1&limit=100
export const fetchShiprocketCollections = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 100)
    );

    // Assumes categories use the same active/inactive status values
    // as products. Adjust this filter to match your Category schema.
    const filter = { status: "active" };

    const total = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const collections = categories.map((category) => ({
      id: String(category._id),
      title: category.name,
    }));

    return res.status(200).json({
      success: true,
      collections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Shiprocket collections sync error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch catalog collections",
    });
  }
};

// GET /api/shiprocket/catalog/collections/:collectionId/products
// Example: ?page=1&limit=100
export const fetchShiprocketCollectionProducts = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 100)
    );

    if (!/^[a-f\d]{24}$/i.test(collectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection ID",
      });
    }

    const category = await Category.findById(collectionId).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    const filter = {
      status: "active",
      categoryId: category._id,
    };

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("categoryId", "name")
      .populate("sizes.size")
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const data = products.map((product) => ({
      id: String(product._id),
      title: product.name,
      description: product.description || "",
      category_id: String(product.categoryId?._id || category._id),
      category_name: product.categoryId?.name || category.name,
      price: Number(product.salePrice || 0),
      mrp: Number(product.mrpPrice || 0),
      inventory_quantity: Number(product.qty || 0),
      images: Array.isArray(product.images) ? product.images : [],
      status: product.status,
    }));

    return res.status(200).json({
      success: true,
      collection: {
        id: String(category._id),
        title: category.name,
      },
      products: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Shiprocket collection products error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch collection products",
    });
  }
};