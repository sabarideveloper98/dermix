import mongoose from 'mongoose';
import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';
import Category from '../models/Category.js';
import { uploadBuffer, deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';
import { sanitizeHtml } from '../utils/sanitizeHtml.js';

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

    // Ensure images field is always a valid array of strings
    const sanitizedProducts = products.map((p) => {
      const prodObj = p.toObject ? p.toObject() : p;
      if (prodObj.images) {
        if (typeof prodObj.images === 'string') {
          prodObj.images = [prodObj.images];
        } else if (!Array.isArray(prodObj.images)) {
          prodObj.images = [];
        }
      } else {
        prodObj.images = [];
      }
      return prodObj;
    });

    res.status(200).json({
      success: true,
      products: sanitizedProducts,
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
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = await Product.findById(req.params.id).populate('categoryId', 'name').populate('sizes.size');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prodObj = product.toObject ? product.toObject() : product;

    // Ensure images field is always a valid array of strings
    if (prodObj.images) {
      if (typeof prodObj.images === 'string') {
        prodObj.images = [prodObj.images];
      } else if (!Array.isArray(prodObj.images)) {
        prodObj.images = [];
      }
    } else {
      prodObj.images = [];
    }

    if (!prodObj.tabConfig) {
      prodObj.tabConfig = {
        descriptionEnabled: true,
        ingredientsEnabled: true,
        reviewsEnabled: true,
      };
    } else {
      if (prodObj.tabConfig.descriptionEnabled === undefined) prodObj.tabConfig.descriptionEnabled = true;
      if (prodObj.tabConfig.ingredientsEnabled === undefined) prodObj.tabConfig.ingredientsEnabled = true;
      if (prodObj.tabConfig.reviewsEnabled === undefined) prodObj.tabConfig.reviewsEnabled = true;
    }
    if (!prodObj.ingredients) {
      prodObj.ingredients = [];
    }
    prodObj.whyChooseDermfix = prodObj.whyChooseDermfix || '';

    res.status(200).json({ success: true, product: prodObj });
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
};

// Create Product (Admin)
export const createProduct = async (req, res) => {
  const { name, categoryId, mrpPrice, salePrice, benefit, description, whyChooseDermfix, qty, sizes, isShippingPaid, tabConfig, ingredients } = req.body;

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

    // Support retaining any pre-selected image URLs if passed
    let existingUrls = [];
    if (req.body.remainingImages) {
      try {
        const parsed = Array.isArray(req.body.remainingImages)
          ? req.body.remainingImages
          : JSON.parse(req.body.remainingImages);
        if (Array.isArray(parsed)) existingUrls = parsed;
      } catch (err) {
        console.error('Error parsing remainingImages in createProduct:', err);
      }
    }
    const finalImages = [...new Set([...existingUrls, ...imageUrls])];

    // parse sizes
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      } catch (err) {
        console.error('Error parsing sizes:', err);
      }
    }

    // parse tabConfig
    let parsedTabConfig = {
      descriptionEnabled: true,
      ingredientsEnabled: true,
      reviewsEnabled: true,
    };
    if (tabConfig) {
      try {
        parsedTabConfig = typeof tabConfig === 'string' ? JSON.parse(tabConfig) : tabConfig;
      } catch (err) {
        console.error('Error parsing tabConfig:', err);
      }
    }

    // parse ingredients
    let parsedIngredients = [];
    if (ingredients !== undefined) {
      try {
        const raw = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients);
        parsedIngredients = (Array.isArray(raw) ? raw : [])
          .filter(ing => ing && ing.name && ing.name.trim().length > 0)
          .map(ing => ({
            name: ing.name.trim(),
            percentage: ing.percentage ? String(ing.percentage).trim() : '',
            description: ing.description ? String(ing.description).trim() : '',
          }));
      } catch (err) {
        console.error('Error parsing ingredients:', err);
      }
    }

    const product = await Product.create({
      name,
      categoryId,
      mrpPrice: Number(mrpPrice),
      salePrice: Number(salePrice),
      benefit,
      description,
      whyChooseDermfix: sanitizeHtml(whyChooseDermfix || ''),
      images: finalImages,
      sizes: parsedSizes,
      qty: Number(qty) || 0,
      status: 'active',
      isShippingPaid: isShippingPaid === 'true' || isShippingPaid === true,
      tabConfig: parsedTabConfig,
      ingredients: parsedIngredients,
      keyIngredients: parsedIngredients,
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
  const { name, categoryId, mrpPrice, salePrice, benefit, description, whyChooseDermfix, status, sizes, isShippingPaid, tabConfig, ingredients } = req.body;

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

    // parse tabConfig
    let parsedTabConfig = undefined;
    if (tabConfig !== undefined) {
      try {
        parsedTabConfig = typeof tabConfig === 'string' ? JSON.parse(tabConfig) : tabConfig;
      } catch (err) {
        console.error('Error parsing tabConfig:', err);
      }
    }

    // parse ingredients
    let parsedIngredients = undefined;
    if (ingredients !== undefined) {
      try {
        const raw = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients);
        parsedIngredients = (Array.isArray(raw) ? raw : [])
          .filter(ing => ing && ing.name && ing.name.trim().length > 0)
          .map(ing => ({
            name: ing.name.trim(),
            percentage: ing.percentage ? String(ing.percentage).trim() : '',
            description: ing.description ? String(ing.description).trim() : '',
          }));
      } catch (err) {
        console.error('Error parsing ingredients:', err);
      }
    }

    const updates = {
      name,
      categoryId,
      mrpPrice: mrpPrice ? Number(mrpPrice) : undefined,
      salePrice: salePrice ? Number(salePrice) : undefined,
      benefit,
      description,
      whyChooseDermfix: whyChooseDermfix !== undefined ? sanitizeHtml(whyChooseDermfix) : undefined,
      status,
      sizes: parsedSizes,
      isShippingPaid: isShippingPaid !== undefined ? (isShippingPaid === 'true' || isShippingPaid === true) : undefined,
      tabConfig: parsedTabConfig,
      ingredients: parsedIngredients,
      keyIngredients: parsedIngredients,
      ingredientsImage: req.body.ingredientsImage !== undefined ? req.body.ingredientsImage : (req.body.removeIngredientsImage === 'true' || req.body.removeIngredientsImage === true ? '' : undefined),
    };

    // Filter out undefined fields
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    // Handle Image upload / updates
    let updatedImages = Array.isArray(product.images)
      ? [...product.images]
      : (product.images ? [product.images] : []);

    // If remainingImages is sent as a JSON string or array, parse it
    if (req.body.remainingImages !== undefined) {
      try {
        const remaining = Array.isArray(req.body.remainingImages)
          ? req.body.remainingImages
          : JSON.parse(req.body.remainingImages);

        const remainingArr = Array.isArray(remaining) ? remaining : [];

        // Find images to delete
        const toDelete = updatedImages.filter((img) => !remainingArr.includes(img));
        for (const img of toDelete) {
          const publicId = extractPublicId(img);
          if (publicId) {
            try {
              await deleteFromCloudinary(publicId);
            } catch (delErr) {
              console.error('Cloudinary deletion warning:', delErr?.message || delErr);
            }
          }
        }
        updatedImages = remainingArr;
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

    // Preserve order and prevent duplicates
    updates.images = [...new Set(updatedImages)];

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

// Update Product Content (Description & Key Ingredients & Ingredients Image) - Admin
export const updateProductContent = async (req, res) => {
  const { description, whyChooseDermfix, ingredients } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = {};
    if (description !== undefined) {
      updates.description = description;
    }

    if (whyChooseDermfix !== undefined) {
      updates.whyChooseDermfix = sanitizeHtml(whyChooseDermfix);
    }

    if (req.body.tabConfig !== undefined) {
      try {
        const rawTab = typeof req.body.tabConfig === 'string'
          ? JSON.parse(req.body.tabConfig)
          : req.body.tabConfig;
        updates.tabConfig = {
          descriptionEnabled: rawTab.descriptionEnabled !== false,
          ingredientsEnabled: rawTab.ingredientsEnabled !== false,
          reviewsEnabled: rawTab.reviewsEnabled !== false,
        };
      } catch (err) {
        console.error('Error parsing tabConfig in updateProductContent:', err);
      }
    }

    if (ingredients !== undefined) {
      try {
        const raw = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients);
        updates.ingredients = (Array.isArray(raw) ? raw : [])
          .filter(ing => ing && ing.name && ing.name.trim().length > 0)
          .map((ing, idx) => ({
            name: ing.name.trim(),
            percentage: ing.percentage ? String(ing.percentage).trim() : '',
            description: ing.description ? String(ing.description).trim() : '',
            order: ing.order !== undefined ? Number(ing.order) : idx,
          }));
        updates.keyIngredients = updates.ingredients;
      } catch (err) {
        console.error('Error parsing ingredients:', err);
        return res.status(400).json({ success: false, message: 'Invalid ingredients format' });
      }
    }

    // Handle ingredientsImage upload or removal
    if (req.file) {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP formats are supported.',
        });
      }

      // Max size: 10MB
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image size exceeds maximum limit of 10MB.',
        });
      }

      const result = await uploadBuffer(req.file.buffer, 'products/ingredients');
      updates.ingredientsImage = result.secure_url;

      // Delete previous image from Cloudinary if exists
      if (product.ingredientsImage) {
        const oldPublicId = extractPublicId(product.ingredientsImage);
        if (oldPublicId) {
          try {
            await deleteFromCloudinary(oldPublicId);
          } catch (delErr) {
            console.error('Error deleting previous ingredients image:', delErr);
          }
        }
      }
    } else if (req.body.removeIngredientsImage === 'true' || req.body.removeIngredientsImage === true) {
      if (product.ingredientsImage) {
        const oldPublicId = extractPublicId(product.ingredientsImage);
        if (oldPublicId) {
          try {
            await deleteFromCloudinary(oldPublicId);
          } catch (delErr) {
            console.error('Error deleting ingredients image:', delErr);
          }
        }
      }
      updates.ingredientsImage = '';
    } else if (req.body.ingredientsImage !== undefined) {
      updates.ingredientsImage = req.body.ingredientsImage;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, message: 'Product content updated successfully', product });
  } catch (error) {
    console.error('Update product content error:', error);
    res.status(500).json({ success: false, message: 'Server error updating product content' });
  }
};

// Get Product Tab Images
export const getProductTabImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      tabImages: {
        howToUseImage: product.howToUseImage || '',
        whatItDoesImage: product.whatItDoesImage || '',
        ingredientsImage: product.ingredientsImage || '',
      },
      product: {
        _id: product._id,
        name: product.name,
        howToUseImage: product.howToUseImage || '',
        whatItDoesImage: product.whatItDoesImage || '',
        ingredientsImage: product.ingredientsImage || '',
      },
    });
  } catch (error) {
    console.error('Get product tab images error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tab images' });
  }
};

// Update Product Tab Images (Admin)
export const updateProductTabImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = {};
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const handleSingleTabImage = async (fieldName, folderName) => {
      const file = req.files && req.files[fieldName] && req.files[fieldName][0];
      const removeFlagKey = `remove${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
      const shouldRemove = req.body[removeFlagKey] === 'true' || req.body[removeFlagKey] === true;

      if (file) {
        if (!allowedMimes.includes(file.mimetype)) {
          throw new Error(`Invalid format for ${fieldName}. Only JPG, JPEG, PNG, and WEBP formats are supported.`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Image size for ${fieldName} exceeds maximum limit of 10MB.`);
        }

        const result = await uploadBuffer(file.buffer, `products/${folderName}`);
        updates[fieldName] = result.secure_url;

        // Cleanup old image from Cloudinary
        if (product[fieldName]) {
          const oldPublicId = extractPublicId(product[fieldName]);
          if (oldPublicId) {
            try {
              await deleteFromCloudinary(oldPublicId);
            } catch (delErr) {
              console.error(`Error deleting previous ${fieldName}:`, delErr);
            }
          }
        }
      } else if (shouldRemove) {
        if (product[fieldName]) {
          const oldPublicId = extractPublicId(product[fieldName]);
          if (oldPublicId) {
            try {
              await deleteFromCloudinary(oldPublicId);
            } catch (delErr) {
              console.error(`Error deleting ${fieldName}:`, delErr);
            }
          }
        }
        updates[fieldName] = '';
      } else if (req.body[fieldName] !== undefined) {
        updates[fieldName] = req.body[fieldName];
      }
    };

    await handleSingleTabImage('howToUseImage', 'how_to_use');
    await handleSingleTabImage('whatItDoesImage', 'what_it_does');
    await handleSingleTabImage('ingredientsImage', 'ingredients');

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product tab images updated successfully',
      tabImages: {
        howToUseImage: updatedProduct.howToUseImage || '',
        whatItDoesImage: updatedProduct.whatItDoesImage || '',
        ingredientsImage: updatedProduct.ingredientsImage || '',
      },
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product tab images error:', error);
    res.status(400).json({ success: false, message: error.message || 'Server error updating tab images' });
  }
};

