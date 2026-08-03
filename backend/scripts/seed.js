import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load env
dotenv.config();

// Models
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import Banner from '../src/models/Banner.js';
import InstagramVideo from '../src/models/InstagramVideo.js';
import Cart from '../src/models/Cart.js';
import Address from '../src/models/Address.js';
import Order from '../src/models/Order.js';
import Payment from '../src/models/Payment.js';
import StockHistory from '../src/models/StockHistory.js';
import OtpVerification from '../src/models/OtpVerification.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// A 1x1 transparent pixel PNG to use for mock uploads to Cloudinary
const mockImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const mockImageBuffer = Buffer.from(mockImageBase64, 'base64');

// Upload helper for seeding
const uploadSeedImage = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

const runSeed = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear all existing data
    console.log('Cleaning collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await InstagramVideo.deleteMany({});
    await Cart.deleteMany({});
    await Address.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await StockHistory.deleteMany({});
    await OtpVerification.deleteMany({});
    console.log('Cleaned database.');

    // Upload category images to Cloudinary
    console.log('Uploading images to Cloudinary...');
    const catImageUrl = await uploadSeedImage(mockImageBuffer, 'seed/categories');
    const prodImageUrl = await uploadSeedImage(mockImageBuffer, 'seed/products');
    const bannerImageUrl = await uploadSeedImage(mockImageBuffer, 'seed/banners');
    console.log('Uploaded mock images to Cloudinary successfully.');

    // 1. Create Categories
    console.log('Creating categories...');
    const categoriesData = [
      { name: 'Cleansers', description: 'Gentle facial cleansers', image: catImageUrl, status: 'active' },
      { name: 'Serums', description: 'Concentrated treatment serums', image: catImageUrl, status: 'active' },
      { name: 'Moisturizers', description: 'Nourishing face creams', image: catImageUrl, status: 'active' },
      { name: 'Sunscreens', description: 'Broad spectrum UV protection', image: catImageUrl, status: 'active' },
      { name: 'Lip Care', description: 'Moisturizing lip glosses and balms', image: catImageUrl, status: 'active' },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log(`Created ${categories.length} categories.`);

    // Map names to ids
    const getCategoryId = (name) => categories.find((c) => c.name === name)._id;

    // 2. Create Products
    console.log('Creating products...');
    const productsData = [
      {
        name: 'Hydraglow Daily Gel Cleanser',
        categoryId: getCategoryId('Cleansers'),
        mrpPrice: 699,
        salePrice: 499,
        benefit: 'Hydrating & Clarifying',
        description: 'A gentle gel cleanser that removes dirt and oil without stripping the skin barrier.',
        images: [prodImageUrl],
        qty: 50,
        status: 'active',
      },
      {
        name: 'Radiance Boost Vitamin C Serum',
        categoryId: getCategoryId('Serums'),
        mrpPrice: 999,
        salePrice: 799,
        benefit: 'Brightens & Evens Tone',
        description: 'Packed with pure Vitamin C to reduce hyperpigmentation and reveal glowing skin.',
        images: [prodImageUrl],
        qty: 35,
        status: 'active',
      },
      {
        name: 'Calm & Repair Moisture Cream',
        categoryId: getCategoryId('Moisturizers'),
        mrpPrice: 1199,
        salePrice: 899,
        benefit: 'Soothes & Restores Barrier',
        description: 'Rich moisturizing cream with ceramides and centella to calm irritated or dry skin.',
        images: [prodImageUrl],
        qty: 40,
        status: 'active',
      },
      {
        name: 'SilkShield SPF 50+ Sunscreen',
        categoryId: getCategoryId('Sunscreens'),
        mrpPrice: 899,
        salePrice: 699,
        benefit: 'Matte Finish UV Shield',
        description: 'Lightweight, non-greasy sunscreen with broad spectrum SPF 50+ protection.',
        images: [prodImageUrl],
        qty: 0, // Out of stock by default for testing
        status: 'active',
      },
      {
        name: 'Hydra Shine Lip Gloss',
        categoryId: getCategoryId('Lip Care'),
        mrpPrice: 399,
        salePrice: 299,
        benefit: 'Glass-like Shine & Plumping',
        description: 'High-shine moisturizing lip gloss enriched with jojoba oil.',
        images: [prodImageUrl],
        qty: 70,
        status: 'active',
      },
      {
        name: 'Deep Pore Cleanser',
        categoryId: getCategoryId('Cleansers'),
        mrpPrice: 499,
        salePrice: 399,
        benefit: 'Exfoliating & Deep Clean',
        description: 'Salicylic acid face wash that deeply penetrates pores to clear blackheads and breakouts.',
        images: [prodImageUrl],
        qty: 30,
        status: 'active',
      },
      {
        name: 'AHA Rosaline Serum 10% - 30ml',
        categoryId: getCategoryId('Serums'),
        mrpPrice: 899,
        salePrice: 699,
        benefit: 'Smooths Texture & Rejuvenates',
        description: 'Gentle exfoliating serum with 10% AHA to resurface rough texture and fine lines.',
        images: [prodImageUrl],
        qty: 25,
        status: 'active',
      },
      {
        name: 'Hydra Barrier Moisturizer',
        categoryId: getCategoryId('Moisturizers'),
        mrpPrice: 999,
        salePrice: 799,
        benefit: 'Intense 72-Hour Hydration',
        description: 'Hyaluronic acid gel cream that locks in hydration for a plump, dewy complexion.',
        images: [prodImageUrl],
        qty: 45,
        status: 'active',
      },
      {
        name: 'Gentle Foam Cleanser',
        categoryId: getCategoryId('Cleansers'),
        mrpPrice: 599,
        salePrice: 450,
        benefit: 'Soft pH-balanced Foam',
        description: 'Delicate foaming face wash for sensitive skin, maintaining natural pH levels.',
        images: [prodImageUrl],
        qty: 15,
        status: 'active',
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`Created ${products.length} products.`);

    // Insert stock history for products
    for (const prod of products) {
      if (prod.qty > 0) {
        await StockHistory.create({
          productId: prod._id,
          previousQty: 0,
          updatedQty: prod.qty,
          reason: 'Initial Seeding Stock',
        });
      }
    }

    // 3. Create Users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const customerPassword = await bcrypt.hash('Customer@123', salt);

    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@dermix.com',
        mobile: '9876543210',
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        status: 'active',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '9876543211',
        password: customerPassword,
        role: 'customer',
        isVerified: true,
        status: 'active',
      },
    ]);
    console.log(`Created ${users.length} users (Admin: admin@dermix.com / Password: Admin@123).`);

    // Create default carts for users
    for (const u of users) {
      await Cart.create({ userId: u._id, items: [], totalAmount: 0 });
    }

    // 4. Create Banners
    console.log('Creating banners...');
    await Banner.insertMany([
      { title: 'Summer Skin Glow Essentials', image: bannerImageUrl, status: 'active' },
      { title: 'Nourish Your Body and Soul', image: bannerImageUrl, status: 'active' },
    ]);
    console.log('Created homepage banners.');

    // 5. Create Instagram Videos
    console.log('Creating Instagram video list...');
    await InstagramVideo.insertMany([
      { title: 'Facial Routine for Acne', videoLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'active' },
      { title: 'Moisturizer Application Tips', videoLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ', status: 'active' },
    ]);
    console.log('Created dynamic Instagram videos links.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

runSeed();
