import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "admin@dermix.com";
    const plainPassword = "Admin@123";
    
    let user = await User.findOne({ email });
    if (!user) {
      console.log("Admin user not found. Creating...");
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      user = await User.create({
        name: "Super Admin",
        email: email,
        password: hashedPassword,
        role: "admin",
        isVerified: true
      });
      console.log("Created admin user successfully!");
    } else {
      console.log("Admin user found. Updating password to ensure match...");
      user.password = await bcrypt.hash(plainPassword, 10);
      user.role = "admin";
      user.isVerified = true;
      await user.save();
      console.log("Updated admin password and role successfully!");
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
run();
