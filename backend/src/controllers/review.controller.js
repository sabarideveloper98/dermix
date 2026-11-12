import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { uploadBuffer } from '../utils/cloudinary.js';

// Create a review (Public / Customer)
export const createReview = async (req, res) => {
  const { productId, name, title, review, rating, skinType, skinConcerns } = req.body;

  try {
    if (!productId || !name || !title || !review) {
      return res.status(400).json({
        success: false,
        message: 'Product, name, title, and review content are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if reviews are enabled for this product
    if (product.tabConfig && product.tabConfig.reviewsEnabled === false) {
      return res.status(400).json({
        success: false,
        message: 'Reviews are currently disabled for this product.',
      });
    }

    // Parse skin concerns if provided
    let parsedConcerns = [];
    if (skinConcerns) {
      try {
        parsedConcerns = Array.isArray(skinConcerns)
          ? skinConcerns
          : JSON.parse(skinConcerns);
      } catch (e) {
        parsedConcerns = [skinConcerns];
      }
    }

    // Handle uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBuffer(file.buffer, 'reviews');
        imageUrls.push(result.secure_url);
      }
    }

    const newReview = await Review.create({
      productId,
      userId: req.user?._id || null,
      name: name.trim(),
      title: title.trim(),
      review: review.trim(),
      rating: Number(rating) || 5,
      skinType: skinType ? skinType.trim() : '',
      skinConcerns: parsedConcerns,
      images: imageUrls,
      status: 'Pending', // Customer reviews are pending by default
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review: newReview,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting review' });
  }
};

// Get approved reviews for a product (Public)
export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({
      productId,
      status: 'Approved',
    }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    let averageRating = 0;
    const breakdown = {
      5: { count: 0, percent: 0 },
      4: { count: 0, percent: 0 },
      3: { count: 0, percent: 0 },
      2: { count: 0, percent: 0 },
      1: { count: 0, percent: 0 },
    };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
        breakdown[star].count += 1;
        return acc + (r.rating || 5);
      }, 0);

      averageRating = Number((sum / totalReviews).toFixed(1));

      // Calculate percentage for each star
      for (let star = 1; star <= 5; star++) {
        breakdown[star].percent = Math.round((breakdown[star].count / totalReviews) * 100);
      }
    }

    res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      averageRating: averageRating || 5.0,
      breakdown,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
};

// Get all reviews for admin moderation (Admin)
export const getAdminReviews = async (req, res) => {
  const { status, productId, page = 1, limit = 20 } = req.query;

  try {
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (productId && productId !== 'all') {
      filter.productId = productId;
    }

    const baseCountFilter = productId && productId !== 'all' ? { productId } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const totalReviews = await Review.countDocuments(filter);
    const pendingCount = await Review.countDocuments({ status: 'Pending', ...baseCountFilter });
    const approvedCount = await Review.countDocuments({ status: 'Approved', ...baseCountFilter });
    const rejectedCount = await Review.countDocuments({ status: 'Rejected', ...baseCountFilter });

    const reviews = await Review.find(filter)
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      pendingCount,
      approvedCount,
      rejectedCount,
      page: Number(page),
      pages: Math.ceil(totalReviews / Number(limit)),
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews for admin' });
  }
};

// Update review status - Approve / Reject (Admin)
export const updateReviewStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('productId', 'name');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      message: `Review ${status.toLowerCase()} successfully`,
      review,
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating review status' });
  }
};

// Delete review (Admin)
export const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
};
