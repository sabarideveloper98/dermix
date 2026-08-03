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

    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching banners' });
  }
};

// Banner Management - Create Banner
export const createBanner = async (req, res) => {
  const { title } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a banner image' });
    }

    const result = await uploadBuffer(req.file.buffer, 'banners');

    const banner = await Banner.create({
      title,
      image: result.secure_url,
      status: 'active',
    });

    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ success: false, message: 'Server error creating banner' });
  }
};

// Banner Management - Update Banner status or title
export const updateBanner = async (req, res) => {
  const { title, status } = req.body;

  try {
    let banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const updates = { title, status };

    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'banners');
      updates.image = result.secure_url;

      // Delete old image
      const oldPublicId = extractPublicId(banner.image);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Filter out undefined
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    banner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ success: false, message: 'Server error updating banner' });
  }
};

// Banner Management - Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const publicId = extractPublicId(banner.image);
    if (publicId) {
      await deleteFromCloudinary(publicId);
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
