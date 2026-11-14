import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import InstagramVideo from '../models/InstagramVideo.js';
import { uploadBuffer, deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Calculate Total Sales
    const totalSalesData = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalSales = totalSalesData.length > 0 ? totalSalesData[0].total : 0;
    const totalRevenue = totalSales; // Alias

    // Fetch Recent Orders (last 5)
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch Low Stock Products (< 10 units)
    const lowStockProducts = await Product.find({ qty: { $lt: 10 } })
      .populate('categoryId', 'name')
      .limit(5);
    const lowStockCount = await Product.countDocuments({ qty: { $lt: 10 } });

    // Monthly Sales aggregation for charts
    const monthlySales = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalSales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    // Extra statistics for Dermix
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
    const pendingOrders = await Order.countDocuments({ deliveryStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ deliveryStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ deliveryStatus: 'Cancelled' });
    const activeCustomers = await User.countDocuments({ role: 'customer', status: 'active' });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSales,
        totalRevenue,
        recentOrders,
        lowStockProducts,
        lowStockCount,
        monthlySales,
        todayOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        activeCustomers,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

// Customer Management - Get Customers
export const getCustomers = async (req, res) => {
  const { search } = req.query;

  try {
    const filter = { role: 'customer' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
};

// Customer Management - Toggle block/unblock status
export const toggleCustomerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    res.status(200).json({ success: true, message: `Customer status updated to ${user.status}`, user });
  } catch (error) {
    console.error('Toggle customer status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating customer status' });
  }
};

// Banner Management - Get all banners (Public gets active, Admin gets all)
export const getBanners = async (req, res) => {
  try {
    const filter = {};
    if (!req.query.admin || req.query.admin !== 'true') {
      filter.status = 'active';
    }

    const rawBanners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    const banners = rawBanners.map((b) => {
      const doc = b.toObject ? b.toObject() : b;
      const desktop = doc.desktopImage || doc.image || '';
      const mobile = doc.mobileImage || '';
      return {
        ...doc,
        desktopImage: desktop,
        mobileImage: mobile,
        image: doc.image || desktop || mobile || '',
      };
    });

    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching banners' });
  }
};

// Banner Management - Create Banner
export const createBanner = async (req, res) => {
  const { title, description, buttonText, buttonLink, displayOrder, status } = req.body;

  try {
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Banner title is required' });
    }

    const files = req.files || [];
    let desktopFile = null;
    let mobileFile = null;
    let legacyFile = req.file || null;

    if (Array.isArray(files)) {
      desktopFile = files.find((f) => f.fieldname === 'desktopImage') || null;
      mobileFile = files.find((f) => f.fieldname === 'mobileImage') || null;
      legacyFile = legacyFile || files.find((f) => f.fieldname === 'image') || null;
    } else if (typeof files === 'object') {
      desktopFile = files.desktopImage?.[0] || null;
      mobileFile = files.mobileImage?.[0] || null;
      legacyFile = legacyFile || files.image?.[0] || null;
    }

    if (!desktopFile && !mobileFile && !legacyFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one banner image (Desktop or Mobile)',
      });
    }

    let desktopImageUrl = '';
    let mobileImageUrl = '';

    if (desktopFile) {
      const result = await uploadBuffer(desktopFile.buffer, 'banners');
      desktopImageUrl = result.secure_url;
    }

    if (mobileFile) {
      const result = await uploadBuffer(mobileFile.buffer, 'banners');
      mobileImageUrl = result.secure_url;
    }

    if (legacyFile && !desktopImageUrl && !mobileImageUrl) {
      const result = await uploadBuffer(legacyFile.buffer, 'banners');
      desktopImageUrl = result.secure_url;
    }

    const banner = await Banner.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      buttonText: buttonText ? buttonText.trim() : '',
      buttonLink: buttonLink ? buttonLink.trim() : '',
      displayOrder: displayOrder !== undefined && displayOrder !== '' ? Number(displayOrder) : 0,
      desktopImage: desktopImageUrl,
      mobileImage: mobileImageUrl,
      image: desktopImageUrl || mobileImageUrl || '',
      status: status || 'active',
    });

    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ success: false, message: 'Server error creating banner' });
  }
};

// Banner Management - Update Banner
export const updateBanner = async (req, res) => {
  const {
    title,
    description,
    buttonText,
    buttonLink,
    displayOrder,
    status,
    removeDesktopImage,
    removeMobileImage,
  } = req.body;

  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (buttonText !== undefined) updates.buttonText = buttonText.trim();
    if (buttonLink !== undefined) updates.buttonLink = buttonLink.trim();
    if (displayOrder !== undefined && displayOrder !== '') updates.displayOrder = Number(displayOrder);
    if (status !== undefined) updates.status = status;

    const files = req.files || [];
    let desktopFile = null;
    let mobileFile = null;
    let legacyFile = req.file || null;

    if (Array.isArray(files)) {
      desktopFile = files.find((f) => f.fieldname === 'desktopImage') || null;
      mobileFile = files.find((f) => f.fieldname === 'mobileImage') || null;
      legacyFile = legacyFile || files.find((f) => f.fieldname === 'image') || null;
    } else if (typeof files === 'object') {
      desktopFile = files.desktopImage?.[0] || null;
      mobileFile = files.mobileImage?.[0] || null;
      legacyFile = legacyFile || files.image?.[0] || null;
    }

    // Handle Desktop Banner Image
    if (desktopFile) {
      const result = await uploadBuffer(desktopFile.buffer, 'banners');
      updates.desktopImage = result.secure_url;

      const oldPublicId = extractPublicId(banner.desktopImage || banner.image);
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch (delErr) {
          console.warn('Failed to delete old desktop banner from Cloudinary:', delErr.message);
        }
      }
    } else if (removeDesktopImage === 'true' || removeDesktopImage === true) {
      const oldPublicId = extractPublicId(banner.desktopImage);
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch (delErr) {
          console.warn('Failed to delete desktop banner from Cloudinary:', delErr.message);
        }
      }
      updates.desktopImage = '';
    }

    // Handle Mobile Banner Image
    if (mobileFile) {
      const result = await uploadBuffer(mobileFile.buffer, 'banners');
      updates.mobileImage = result.secure_url;

      const oldPublicId = extractPublicId(banner.mobileImage);
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch (delErr) {
          console.warn('Failed to delete old mobile banner from Cloudinary:', delErr.message);
        }
      }
    } else if (removeMobileImage === 'true' || removeMobileImage === true) {
      const oldPublicId = extractPublicId(banner.mobileImage);
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
        } catch (delErr) {
          console.warn('Failed to delete mobile banner from Cloudinary:', delErr.message);
        }
      }
      updates.mobileImage = '';
    }

    // Handle legacy single-image file if provided
    if (legacyFile && !desktopFile) {
      const result = await uploadBuffer(legacyFile.buffer, 'banners');
      updates.image = result.secure_url;
      if (!updates.desktopImage && !banner.desktopImage) {
        updates.desktopImage = result.secure_url;
      }
    }

    // Preserve existing desktopImage if banner only had legacy image field
    if (updates.desktopImage === undefined && !banner.desktopImage && banner.image) {
      updates.desktopImage = banner.image;
    }

    // Maintain legacy image field synchronized with current active banner
    const effectiveDesktop = updates.desktopImage !== undefined ? updates.desktopImage : (banner.desktopImage || banner.image || '');
    const effectiveMobile = updates.mobileImage !== undefined ? updates.mobileImage : (banner.mobileImage || '');
    updates.image = effectiveDesktop || effectiveMobile || banner.image || '';

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });

    const doc = updatedBanner.toObject ? updatedBanner.toObject() : updatedBanner;
    const desktop = doc.desktopImage || doc.image || '';
    const mobile = doc.mobileImage || '';
    const formattedBanner = {
      ...doc,
      desktopImage: desktop,
      mobileImage: mobile,
      image: doc.image || desktop || mobile || '',
    };

    res.status(200).json({ success: true, banner: formattedBanner });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating banner' });
  }
};

// Banner Management - Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const urlsToDelete = Array.from(
      new Set([banner.desktopImage, banner.mobileImage, banner.image].filter(Boolean))
    );

    for (const url of urlsToDelete) {
      const publicId = extractPublicId(url);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (delErr) {
          console.warn('Failed to delete banner image from Cloudinary:', delErr.message);
        }
      }
    }

    await Banner.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting banner' });
  }
};

// Instagram Video Management - Get videos
export const getInstagramVideos = async (req, res) => {
  try {
    const filter = {};
    if (!req.query.admin || req.query.admin !== 'true') {
      filter.status = 'active';
    }

    const videos = await InstagramVideo.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error('Get Instagram videos error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching videos' });
  }
};

// Instagram Video Management - Create
export const addInstagramVideo = async (req, res) => {
  const { title, videoLink } = req.body;

  try {
    const video = await InstagramVideo.create({
      title,
      videoLink,
      status: 'active',
    });

    res.status(201).json({ success: true, video });
  } catch (error) {
    console.error('Add Instagram video error:', error);
    res.status(500).json({ success: false, message: 'Server error adding video' });
  }
};

// Instagram Video Management - Update
export const updateInstagramVideo = async (req, res) => {
  const { title, videoLink, status } = req.body;

  try {
    const updates = { title, videoLink, status };
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    const video = await InstagramVideo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Instagram video not found' });
    }

    res.status(200).json({ success: true, video });
  } catch (error) {
    console.error('Update Instagram video error:', error);
    res.status(500).json({ success: false, message: 'Server error updating video' });
  }
};

// Instagram Video Management - Delete
export const deleteInstagramVideo = async (req, res) => {
  try {
    const video = await InstagramVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Instagram video not found' });
    }

    await InstagramVideo.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Instagram video deleted successfully' });
  } catch (error) {
    console.error('Delete Instagram video error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting video' });
  }
};

// Get all orders (Admin)
export const getAdminOrders = async (req, res) => {
  const { search } = req.query;
  try {
    const filter = {};
    if (search) {
      filter.orderNumber = { $regex: search, $options: 'i' };
    }
    const orders = await Order.find(filter)
      .populate('products.productId')
      .populate('addressId')
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};
