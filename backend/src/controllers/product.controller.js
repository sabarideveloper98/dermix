import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';
import Category from '../models/Category.js';
import { uploadBuffer, deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

// Get products (public lists active, supports pagination, filtering, search)
export const getProducts = async (req, res) => {
  const { categoryId, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  try {
    const filter = {};

    // Standard public status is active
    if (!req.query.admin || req.query.admin !== 'true') {
      filter.status = 'active';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    // Category filter
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { benefit: { $regex: search, $options: 'i' } },
      ];
    }

    // Price filters
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOptions = { salePrice: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { salePrice: -1 };
    } else if (sort === 'name-asc') {
      sortOptions = { name: 1 };
    } else if (sort === 'name-desc') {
      sortOptions = { name: -1 };
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .populate('sizes.size')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      products,
      page: Number(page),
      pages: Math.ceil(totalProducts / Number(limit)),
      totalProducts,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name').populate('sizes.size');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
};

// Create Product (Admin)
export const createProduct = async (req, res) => {
  const { name, categoryId, mrpPrice, salePrice, benefit, description, qty, sizes, isShippingPaid } = req.body;

  try {
    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBuffer(file.buffer, 'products');
        imageUrls.push(result.secure_url);
      }
    }

    // parse sizes
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      } catch (err) {
        console.error('Error parsing sizes:', err);
      }
    }

    const product = await Product.create({
      name,
      categoryId,
      mrpPrice: Number(mrpPrice),
      salePrice: Number(salePrice),
      benefit,
      description,
      images: imageUrls,
      sizes: parsedSizes,
      qty: Number(qty) || 0,
      status: 'active',
      isShippingPaid: isShippingPaid === 'true' || isShippingPaid === true,
    });

    // Create Initial Stock History
    if (Number(qty) > 0) {
      await StockHistory.create({
        productId: product._id,
        previousQty: 0,
        updatedQty: Number(qty),
        reason: 'Initial Stock Creation',
      });
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

// Update Product (Admin)
export const updateProduct = async (req, res) => {
  const { name, categoryId, mrpPrice, salePrice, benefit, description, status, sizes, isShippingPaid } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate category if updating
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
    }
    
    // parse sizes
    let parsedSizes = undefined;
    if (sizes !== undefined) {
      try {
        parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      } catch (err) {
        console.error('Error parsing sizes:', err);
      }
    }

    const updates = {
      name,
      categoryId,
      mrpPrice: mrpPrice ? Number(mrpPrice) : undefined,
      salePrice: salePrice ? Number(salePrice) : undefined,
      benefit,
      description,
      status,
      sizes: parsedSizes,
      isShippingPaid: isShippingPaid !== undefined ? (isShippingPaid === 'true' || isShippingPaid === true) : undefined
    };

    // Filter out undefined fields
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    // Handle Image upload / updates
    let updatedImages = [...product.images];

    // If remainingImages is sent as a JSON string or array, parse it
    if (req.body.remainingImages) {
      try {
        const remaining = Array.isArray(req.body.remainingImages)
          ? req.body.remainingImages
          : JSON.parse(req.body.remainingImages);
        
        // Find images to delete
        const toDelete = product.images.filter((img) => !remaining.includes(img));
        for (const img of toDelete) {
          const publicId = extractPublicId(img);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }
        updatedImages = remaining;
      } catch (err) {
        console.error('Error parsing remainingImages:', err);
      }
    }

    // Add new files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBuffer(file.buffer, 'products');
        updatedImages.push(result.secure_url);
      }
    }

    updates.images = updatedImages;

    product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// Delete Product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      const publicId = extractPublicId(img);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await Product.deleteOne({ _id: req.params.id });
    // Cleanup stock history
    await StockHistory.deleteMany({ productId: req.params.id });

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

// Update stock manually (Admin)
export const updateStock = async (req, res) => {
  const { qty, reason } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousQty = product.qty;
    const updatedQty = Number(qty);

    product.qty = updatedQty;
    await product.save();

    // Create Stock History record
    const stockHistory = await StockHistory.create({
      productId: product._id,
      previousQty,
      updatedQty,
      reason: reason || 'Manual Admin Stock Adjustment',
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      qty: product.qty,
      stockHistory,
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ success: false, message: 'Server error updating stock' });
  }
};

// Get product stock history
export const getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find({ productId: req.params.id })
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stock history' });
  }
};

// Toggle product status (Admin)
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
};
