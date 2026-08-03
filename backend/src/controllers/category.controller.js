import Category from '../models/Category.js';
import { uploadBuffer, deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

// Get categories (public lists active, admin lists all)
export const getCategories = async (req, res) => {
  try {
    const filter = {};
    // If not admin, or admin param not active
    if (!req.query.admin || req.query.admin !== 'true') {
      filter.status = 'active';
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

// Get single category
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Get category detail error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching category' });
  }
};

// Create Category (Admin)
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a category image' });
    }

    // Upload to Cloudinary
    const result = await uploadBuffer(req.file.buffer, 'categories');

    const category = await Category.create({
      name,
      description,
      image: result.secure_url,
      status: 'active',
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error creating category' });
  }
};

// Update Category (Admin)
export const updateCategory = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updates = { name, description, status };

    if (req.file) {
      // Upload new image
      const result = await uploadBuffer(req.file.buffer, 'categories');
      updates.image = result.secure_url;

      // Delete old image from Cloudinary
      const oldPublicId = extractPublicId(category.image);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error updating category' });
  }
};

// Delete Category (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Delete image from Cloudinary
    const publicId = extractPublicId(category.image);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    await Category.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
};

// Toggle Category Status (Admin)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
};
